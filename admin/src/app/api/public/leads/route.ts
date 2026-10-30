import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import type { LeadSource, LeadStatus } from "@prisma/client";
import { isLostStatus } from "@/lib/leads/lead-status";
import { consumeRateLimit, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { resolveIntakeRateLimitIp } from "@/lib/utils/client-ip";
import { safeEqualString } from "@/lib/utils/crypto";
import { generateResourceToken } from "@/lib/utils/resource-token";
import { publicLeadSchema } from "@/lib/validations/public-lead.schema";
import { emitLeadCreated } from "@/lib/automation/emit-lead-created";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { checkMaintenance } from "@/lib/middleware/maintenance";
import { handleError } from "@/lib/utils/response";
import { isHoneypotTripped } from "@/lib/utils/honeypot";
import { evaluateEligibility, type EvaluatedEligibility } from "@/lib/courses/eligibility";
import { getCourseEligibility } from "@/lib/services/course-eligibility.service";
import { contactCandidates, normalizePhone } from "@/lib/messaging/phone";
import { LeadAssignmentService } from "@/lib/services/lead-assignment.service";

const SOURCE_MAP: Record<string, LeadSource> = {
  homepage_cta: "HOMEPAGE_CTA",
  contact_form: "CONTACT_FORM",
  brochure_download: "BROCHURE_DOWNLOAD",
  course_page: "COURSE_PAGE",
};

/**
 * CRM-02: public submissions are canonicalised to the same 10-digit national
 * form LeadService uses, so "+91 98765 43210" and "9876543210" cannot become
 * two leads for the same person.
 */
function canonicalPublicPhone(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

interface ExistingLeadMatch {
  id: string;
  name: string;
  createdAt: Date;
  courseInterest: string | null;
  deletedAt: Date | null;
}

/**
 * CRM-02: resolve a submission against every stored phone shape (raw, digits,
 * +91…, 91…) and against both the live table and the Recycle Bin. A live lead
 * always wins over a trashed one for the same person.
 */
async function findExistingLead(
  orgId: string,
  rawPhone: string,
): Promise<{ live: ExistingLeadMatch | null; trashed: ExistingLeadMatch | null }> {
  const candidates = contactCandidates(rawPhone);
  if (candidates.length === 0) return { live: null, trashed: null };
  const select = {
    id: true,
    name: true,
    createdAt: true,
    courseInterest: true,
    deletedAt: true,
  } as const;
  const [live, trashed] = await Promise.all([
    prisma.lead.findFirst({
      where: { orgId, phone: { in: candidates }, deletedAt: null },
      select,
      orderBy: { createdAt: "asc" },
    }),
    prisma.lead.findFirst({
      where: { orgId, phone: { in: candidates }, deletedAt: { not: null } },
      select,
      orderBy: { deletedAt: "desc" },
    }),
  ]);
  return { live, trashed };
}

export async function POST(req: NextRequest) {
  try {
    await checkMaintenance();
    const apiKey = req.headers.get("x-intake-key");
    if (!process.env.PUBLIC_INTAKE_KEY || !safeEqualString(apiKey, process.env.PUBLIC_INTAKE_KEY)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  // Rate limit: 5 requests per minute per visitor IP
  const ip = resolveIntakeRateLimitIp(req);
  const decision = await consumeRateLimit(`lead:${ip}`, 5, 60_000);

  if (!decision.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: rateLimitHeaders(decision),
      },
    );
  }

  const body = (await req.json()) as unknown;
    if (isHoneypotTripped(body)) {
      console.warn(JSON.stringify({ event: "lead_honeypot_triggered", timestamp: new Date().toISOString() }));
      return NextResponse.json({ success: true }, { status: 200 });
    }
    const parsed = publicLeadSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const field = first?.path[0] ?? "body";
      const reason = first?.message ?? "Invalid request body";
      return NextResponse.json(
        { error: `${field}: ${reason}` },
        { status: 400 },
      );
    }
    const input = parsed.data;
    const {
      name,
      email,
      phone,
      courseInterest,
      pincode,
      persona,
      source,
      tags,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrerUrl,
      landingPage,
      leadUuid,
      message,
      customFields,
    } = input;

    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true, settings: true },
    });

    if (!org) {
      console.error("[Public Lead] Org not found:", process.env.PUBLIC_ORG_SLUG);
      return NextResponse.json({ error: "Academy configuration missing" }, { status: 500 });
    }

    const settings = org.settings as Record<string, unknown> | null;
    if (settings && settings.applicationIntake === false) {
      return NextResponse.json({ error: "Application intake is closed" }, { status: 403 });
    }

    const normalizedPhone = canonicalPublicPhone(String(phone));
    const leadSource: LeadSource = SOURCE_MAP[source?.toLowerCase() ?? ""] ?? "HOMEPAGE_CTA";
    const requestUuid = leadUuid?.trim() || null;
    const isWebinar = source?.toLowerCase() === "webinar" || source?.toLowerCase().includes("webinar") || (Array.isArray(tags) && tags.includes("webinar"));
    const webinarQuestion = isWebinar && message ? (message.includes("Question: ") ? message.split("Question: ")[1]?.split(";")[0]?.trim() : message) : null;
    const computedTags: string[] = Array.isArray(tags) && tags.length > 0
      ? [...tags]
      : (isWebinar
        ? ["webinar", "parents_webinar"]
        : (source?.toLowerCase().includes("starter_kit") || source?.toLowerCase().includes("starter kit")
          ? ["starter_kit_download"]
          : []));
    if (isWebinar && !computedTags.includes("webinar")) computedTags.push("webinar");
    if (isWebinar && !computedTags.includes("parents_webinar")) computedTags.push("parents_webinar");
    const leadTags = [
      ...computedTags,
      `persona_${persona.toLowerCase()}`,
    ];

    // Advisory course pre-check: validated against the selected course's questions
    // (400 on unknown questions/values) but never blocks a valid enquiry.
    const eligibility: EvaluatedEligibility | null =
      input.eligibility && Object.keys(input.eligibility).length > 0
        ? evaluateEligibility(await getCourseEligibility(org.id, courseInterest), input.eligibility)
        : null;
    const eligibilitySummary = eligibility ? { course: eligibility.course, result: eligibility.result } : null;

    // CRM-02: a repeat enquiry (or a re-enquiry from the Recycle Bin) must link
    // to the existing lead instead of creating a second row. This pre-check also
    // covers legacy rows stored as +91…/91… which the canonical insert cannot
    // collide with, and prefers a live lead over a trashed one.
    const respondRepeatEnquiry = async (existing: ExistingLeadMatch) => {
      const existingLead = await prisma.lead.findUnique({
        where: { id: existing.id },
        select: { customFields: true, tags: true, status: true, name: true, email: true },
      });
      const existingCustom = (existingLead?.customFields as Record<string, any>) || {};
      const existingWebinar = existingCustom.webinar as Record<string, any> | undefined;
      const mergedCustom: Record<string, any> = {
        ...existingCustom,
        webSource: source ?? "website",
        ...(requestUuid ? { leadUuid: requestUuid } : {}),
        ...(isWebinar ? {
          webinar: {
            eventDate: "2026-10-31",
            eventTitle: "Parents' Webinar — Becoming an Airline Pilot",
            eventTime: "11:00 AM IST",
            eventDateTime: "Saturday 31 Oct 2026, 11:00 AM IST · Live online",
            paymentStatus: existingWebinar?.paymentStatus === "PAID" ? "PAID" : "UNPAID",
            eligibility: existingWebinar?.eligibility === "ELIGIBLE" ? "ELIGIBLE" : "NOT_ELIGIBLE",
            fee: 21,
            paymentId: existingWebinar?.paymentId ?? undefined,
            verifiedAt: existingWebinar?.verifiedAt ?? undefined,
            question: webinarQuestion ?? existingWebinar?.question ?? undefined,
            registeredAt: existingWebinar?.registeredAt ?? new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          }
        } : {}),
      };
      const updatedTags = Array.from(new Set([...(existingLead?.tags || []), ...leadTags]));

      await prisma.$transaction([
        prisma.lead.update({
          where: { id: existing.id },
          // First-touch course interest and attribution are preserved. The new
          // interest is recorded on the activity instead of overwriting it.
          data: {
            lastActivityAt: new Date(),
            tags: updatedTags,
            customFields: mergedCustom,
            ...(courseInterest ? { courseInterest } : {}),
            ...(name && name.trim().length >= 2 ? { name: name.trim() } : {}),
            ...(email && email.trim() ? { email: email.trim() } : {}),
            ...(existingLead?.status && isLostStatus(existingLead.status) ? { status: "NEW" as LeadStatus } : {}),
          },
        }),
        prisma.leadActivity.create({
          data: {
            leadId: existing.id,
            orgId: org.id,
            activityType: "NOTE",
            title: isWebinar ? "Webinar Registration Received (Existing Contact)" : "Repeat enquiry received",
            notes: isWebinar
              ? `Webinar registration received for Saturday 31 Oct 2026. Payment status: ${existingWebinar?.paymentStatus || "UNPAID"}.${webinarQuestion ? ` Question: ${webinarQuestion}` : ""}`
              : `Repeat enquiry received via ${leadSource.replace("_", " ")}${courseInterest ? ` for ${courseInterest}` : ""}.`,
            completedAt: new Date(),
            metadata: {
              source: leadSource,
              webSource: source ?? "website",
              repeatEnquiry: true,
              courseInterest: courseInterest ?? null,
              previousCourseInterest: existing.courseInterest ?? null,
              utmCampaign: utmCampaign ?? null,
              utmSource: utmSource ?? null,
              persona,
            },
          },
        }),
      ]);



      await emitLeadCreated({
        orgId: org.id,
        leadId: existing.id,
        leadName: existing.name,
        source: leadSource,
        courseInterest: courseInterest,
        actorName: "Public form",
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          success: true,
          data: { id: existing.id, name: existing.name, createdAt: existing.createdAt },
          gateToken: generateResourceToken(normalizedPhone),
          eligibility: eligibilitySummary,
          meta: { repeatEnquiry: true, isDuplicate: true, duplicateOf: existing.id },
        },
        { status: 200 },
      );
    };

    const respondRestored = async (existing: ExistingLeadMatch) => {
      // CRM-05: soft-deleting a lead cascades to its student and admissions, so
      // a public re-enquiry must restore the whole dossier. deletedBy is cleared
      // too, otherwise the restored rows still look user-deleted.
      await prisma.$transaction([
        prisma.lead.update({
          where: { id: existing.id },
          data: { deletedAt: null, deletedBy: null, lastActivityAt: new Date() },
        }),
        prisma.student.updateMany({
          where: { leadId: existing.id, orgId: org.id, deletedAt: { not: null } },
          data: { deletedAt: null, deletedBy: null },
        }),
        prisma.admission.updateMany({
          where: { leadId: existing.id, orgId: org.id, deletedAt: { not: null } },
          data: { deletedAt: null, deletedBy: null },
        }),
        prisma.leadActivity.create({
          data: {
            leadId: existing.id,
            orgId: org.id,
            activityType: "NOTE",
            title: "Re-enquiry — restored from Recycle Bin",
            notes: `New enquiry received via ${leadSource.replace("_", " ")}${courseInterest ? ` for ${courseInterest}` : ""}.`,
            completedAt: new Date(),
            metadata: {
              source: leadSource,
              webSource: source ?? "website",
              restoredFromTrash: true,
              courseInterest: courseInterest ?? null,
              previousCourseInterest: existing.courseInterest ?? null,
              persona,
            },
          },
        }),
      ]);
      await AuditService.write({
        orgId: org.id,
        action: "lead.restored",
        entityType: "lead",
        entityId: existing.id,
        newValue: { reason: "public_re_enquiry", source: leadSource },
      });
      await emitLeadCreated({
        orgId: org.id,
        leadId: existing.id,
        leadName: existing.name,
        source: leadSource,
        courseInterest: courseInterest,
        actorName: "Public form",
        ipAddress: ip,
      });
      return NextResponse.json(
        {
          success: true,
          data: { id: existing.id, name: existing.name, createdAt: existing.createdAt },
          gateToken: generateResourceToken(normalizedPhone),
          eligibility: eligibilitySummary,
          meta: { restored: true, isDuplicate: true, duplicateOf: existing.id },
        },
        { status: 200 },
      );
    };

    // Idempotency: a retry of the same submission (same leadUuid) must not
    // create a second lead or a misleading 409 — return the original lead.
    if (requestUuid) {
      const replayed = await prisma.lead.findFirst({
        where: {
          orgId: org.id,
          customFields: { path: ["leadUuid"], equals: requestUuid },
        },
        select: { id: true, name: true, createdAt: true },
      });
      if (replayed) {
        await emitLeadCreated({
          orgId: org.id,
          leadId: replayed.id,
          leadName: replayed.name,
          source: leadSource,
          courseInterest: courseInterest,
          actorName: "Public form",
          ipAddress: ip,
        });
        const gateToken = generateResourceToken(normalizedPhone);
        console.log(JSON.stringify({
          event: "lead_replayed",
          leadId: replayed.id,
          timestamp: new Date().toISOString(),
        }));
        return NextResponse.json(
          { success: true, data: replayed, gateToken, eligibility: eligibilitySummary, meta: { replayed: true } },
          { status: 200 },
        );
      }
    }

    // CRM-02: only after idempotent replays are ruled out do we treat the
    // submission as a repeat enquiry against an existing lead.
    const existingLead = await findExistingLead(org.id, normalizedPhone);
    if (existingLead.live) return respondRepeatEnquiry(existingLead.live);
    if (existingLead.trashed) return respondRestored(existingLead.trashed);

    // Lead row + initial activity + lastActivityAt commit atomically. The 201 is
    // returned only after this transaction commits, so success can never mean
    // "partially persisted". External side effects (audit/feed/Inngest) stay
    // outside the transaction.
    let lead: { id: string; name: string; createdAt: Date } | null = null;
    try {
      lead = await prisma.$transaction(async (tx) => {
        const created = await tx.lead.create({
          data: {
            name,
            email: email ?? null,
            phone: normalizedPhone,
            courseInterest: courseInterest ?? null,
            pincode: pincode ?? null,
            source: leadSource,
            tags: leadTags,
            orgId: org.id,
            utmSource: utmSource ?? null,
            utmMedium: utmMedium ?? null,
            utmCampaign: utmCampaign ?? null,
            utmTerm: utmTerm ?? null,
            utmContent: utmContent ?? null,
            referrerUrl: referrerUrl ?? null,
            landingPage: landingPage ?? null,
            customFields: {
              webSource: source ?? "website",
              persona,
              ...(requestUuid ? { leadUuid: requestUuid } : {}),
              ...(eligibility ? { eligibility: { ...eligibility, evaluatedAt: new Date().toISOString() } } : {}),
            },
          },
          select: { id: true, name: true, createdAt: true },
        });

        await tx.leadActivity.create({
          data: {
            leadId: created.id,
            orgId: org.id,
            activityType: "NOTE",
            title: "Web form submission",
            notes: `Enquiry received via ${leadSource.replace("_", " ")}`,
            completedAt: new Date(),
            metadata: { source: leadSource, webSource: source ?? "website" },
          },
        });

        await tx.lead.update({
          where: { id: created.id },
          data: { lastActivityAt: new Date() },
        });

        return created;
      });
    } catch (err) {
      // CRM-02/CRM-05: the partial unique index on (orgId, phone) WHERE
      // deletedAt IS NULL makes a second live row impossible. A P2002 here means
      // a concurrent request won the race, so resolve it as a repeat enquiry or
      // a Recycle Bin restore instead of surfacing a 500/409.
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        // A concurrent request may have committed the same leadUuid first —
        // treat that race as an idempotent replay, not a duplicate rejection.
        if (requestUuid) {
          const raced = await prisma.lead.findFirst({
            where: {
              orgId: org.id,
              customFields: { path: ["leadUuid"], equals: requestUuid },
            },
            select: { id: true, name: true, createdAt: true },
          });
          if (raced) {
            await emitLeadCreated({
              orgId: org.id,
              leadId: raced.id,
              leadName: raced.name,
              source: leadSource,
              courseInterest: courseInterest,
              actorName: "Public form",
              ipAddress: ip,
            });
            const gateToken = generateResourceToken(normalizedPhone);
            console.log(JSON.stringify({
              event: "lead_replayed",
              leadId: raced.id,
              reason: "concurrent_race",
              timestamp: new Date().toISOString(),
            }));
            return NextResponse.json(
              { success: true, data: raced, gateToken, eligibility: eligibilitySummary, meta: { replayed: true } },
              { status: 200 },
            );
          }
        }
        // A concurrent request may have won with the same canonical phone.
        // Re-resolve through every stored phone shape and reuse the shared
        // repeat/restore responses rather than creating a duplicate row.
        const racedExisting = await findExistingLead(org.id, normalizedPhone);
        if (racedExisting.live) return respondRepeatEnquiry(racedExisting.live);
        if (racedExisting.trashed) return respondRestored(racedExisting.trashed);
      }
      throw err;
    }

    console.log(JSON.stringify({
      event: "lead_saved",
      leadId: lead.id,
      timestamp: new Date().toISOString(),
    }));

    // Auto-assign counselor (authoritative centralized engine: Cadet -> Shivangi, CPL -> Round Robin)
    await LeadAssignmentService.autoAssign(
      { orgId: org.id, ipAddress: ip },
      { id: lead.id, courseInterest, source: leadSource }
    );

    // Durable audit/activity owned by the sync path (Inngest-independent).
    // Public submission — no authenticated user, so actor is null and the
    // human-readable identity lives in the feed context.
    await AuditService.write({
      orgId: org.id,
      ipAddress: ip,
      action: "lead.created",
      entityType: "lead",
      entityId: lead.id,
      newValue: { name: lead.name, source: leadSource, phone: normalizedPhone },
    });

    await ActivityFeedService.write({
      orgId: org.id,
      verb: "created",
      objectType: "lead",
      objectId: lead.id,
      objectSnapshot: { name: lead.name, source: leadSource },
      context: { actorName: "Public form" },
    });

    // Emit after the lead row exists. Interakt track is inline + idempotent on lead id.
    if (isWebinar) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          orgId: org.id,
          activityType: "NOTE",
          title: "Webinar Registration Created",
          notes: `Webinar registration received for Saturday 31 Oct 2026, 11:00 AM IST. Seat Not Confirmed (Fee ₹21 Pending).${webinarQuestion ? ` Question: ${webinarQuestion}` : ""}`,
          completedAt: new Date(),
          metadata: { source: leadSource, isWebinar: true, paymentStatus: "UNPAID" },
        },
      });
    }

    await emitLeadCreated({
      orgId: org.id,
      leadId: lead.id,
      leadName: lead.name,
      source: leadSource,
      courseInterest: courseInterest,
      actorName: "Public form",
      ipAddress: ip,
    });

    // Issue a short-lived token granting access to gated resources
    const gateToken = generateResourceToken(normalizedPhone);

    return NextResponse.json(
      {
        success: true,
        data: lead,
        gateToken,
        eligibility: eligibilitySummary,
        meta: { "X-RateLimit-Remaining": String(decision.remaining) },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleError(err);
  }
}
