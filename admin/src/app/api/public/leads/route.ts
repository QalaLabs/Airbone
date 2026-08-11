import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import type { LeadSource } from "@prisma/client";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { generateResourceToken } from "@/lib/utils/resource-token";
import { publicLeadSchema } from "@/lib/validations/public-lead.schema";
import { emitEvent } from "@/lib/events/inngest";
import { checkMaintenance } from "@/lib/middleware/maintenance";
import { handleError } from "@/lib/utils/response";

const SOURCE_MAP: Record<string, LeadSource> = {
  homepage_cta: "HOMEPAGE_CTA",
  contact_form: "CONTACT_FORM",
  brochure_download: "BROCHURE_DOWNLOAD",
  course_page: "COURSE_PAGE",
};

export async function POST(req: NextRequest) {
  try {
    await checkMaintenance();
    const apiKey = req.headers.get("x-intake-key");
    if (!process.env.PUBLIC_INTAKE_KEY || apiKey !== process.env.PUBLIC_INTAKE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  // Rate limit: 5 requests per minute per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(`lead:${ip}`, 5, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      },
    );
  }

  const body = (await req.json()) as unknown;
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
      source,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrerUrl,
      landingPage,
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

    const normalizedPhone = String(phone).trim();
    const leadSource: LeadSource = SOURCE_MAP[source?.toLowerCase() ?? ""] ?? "HOMEPAGE_CTA";

    const lead = await prisma.lead.create({
      data: {
        name,
        email: email ?? null,
        phone: normalizedPhone,
        courseInterest: courseInterest ?? null,
        source: leadSource,
        orgId: org.id,
        utmSource: utmSource ?? null,
        utmMedium: utmMedium ?? null,
        utmCampaign: utmCampaign ?? null,
        utmTerm: utmTerm ?? null,
        utmContent: utmContent ?? null,
        referrerUrl: referrerUrl ?? null,
        landingPage: landingPage ?? null,
        customFields: { webSource: source ?? "website" },
      },
      select: { id: true, name: true, createdAt: true },
    }).catch((err: unknown) => {
      // The org-scoped unique(orgId, phone) constraint makes a duplicate lead
      // insert impossible — surface it as a clean 409 instead of a 500.
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        return null;
      }
      throw err;
    });

    if (!lead) {
      return NextResponse.json(
        { error: "A lead with this phone already exists" },
        { status: 409 },
      );
    }

    // Log the submission on the lead timeline so intake is auditable
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        orgId: org.id,
        activityType: "NOTE",
        title: "Web form submission",
        notes: `Enquiry received via ${leadSource.replace("_", " ")}`,
        completedAt: new Date(),
        metadata: { source: leadSource, webSource: source ?? "website" },
      },
    });
    await prisma.lead.update({
      where: { id: lead.id },
      data: { lastActivityAt: new Date() },
    });

    // Emit NEW_LEAD event for notification worker / audit pipeline
    await emitEvent({
      name: "lead/created",
      orgId: org.id,
      actorId: "system",
      actorName: "Public form",
      requestId: ip,
      ipAddress: ip,
      timestamp: new Date().toISOString(),
      data: {
        leadId: lead.id,
        leadName: lead.name,
        source: leadSource,
        courseInterest: courseInterest ?? undefined,
      },
    });

    // Issue a short-lived token granting access to gated resources
    const gateToken = generateResourceToken(normalizedPhone);

    return NextResponse.json(
      {
        success: true,
        data: lead,
        gateToken,
        meta: { "X-RateLimit-Remaining": String(remaining) },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleError(err);
  }
}
