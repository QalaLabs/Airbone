import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { emitEvent } from "@/lib/events/inngest";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";

// ─── Google Ads Lead Form payload shape ──────────────────────────────────────
interface GoogleAdsColumn {
  column_id: string;
  string_value?: string;
}

interface GoogleAdsPayload {
  lead_id?: string;
  api_version?: string;
  form_id?: string;
  campaign_id?: string;
  adgroup_id?: string;
  creative_id?: string;
  google_key?: string;
  user_column_data?: GoogleAdsColumn[];
  is_test?: boolean;
}

// ─── Helper: extract named column ────────────────────────────────────────────
function col(data: GoogleAdsColumn[], id: string): string | undefined {
  return data.find((c) => c.column_id === id)?.string_value?.trim() || undefined;
}

// ─── Helper: get webhook secret (env first, org settings fallback for dev) ───
async function getWebhookSecret(orgId: string): Promise<string | null> {
  if (process.env.GOOGLE_ADS_WEBHOOK_SECRET) {
    return process.env.GOOGLE_ADS_WEBHOOK_SECRET;
  }
  // Dev fallback: key stored in org settings
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { settings: true },
  });
  const s = org?.settings as Record<string, unknown> | null;
  const devKey = s?.googleAdsWebhookSecret;
  return typeof devKey === "string" && devKey.length > 0 ? devKey : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GoogleAdsPayload;

    // ── 1. Locate org ─────────────────────────────────────────────────────────
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true, settings: true },
    });

    if (!org) {
      console.error("[GoogleAds Webhook] Org not found");
      return NextResponse.json({ received: true, error: "org_not_found" }, { status: 200 });
    }

    // ── 2. Validate webhook secret ────────────────────────────────────────────
    const secret = await getWebhookSecret(org.id);
    if (!secret) {
      console.warn("[GoogleAds Webhook] No webhook secret configured");
      return NextResponse.json({ received: false, error: "not_configured" }, { status: 403 });
    }

    if (!body.google_key || body.google_key !== secret) {
      console.warn("[GoogleAds Webhook] Invalid google_key received");
      return NextResponse.json({ received: false, error: "invalid_key" }, { status: 403 });
    }

    // ── 3. Extract fields from user_column_data ───────────────────────────────
    const columns = body.user_column_data ?? [];
    const fullName = col(columns, "FULL_NAME");
    const firstName = col(columns, "FIRST_NAME") ?? col(columns, "GIVEN_NAME");
    const lastName = col(columns, "LAST_NAME") ?? col(columns, "FAMILY_NAME");
    const name =
      fullName ??
      (firstName && lastName ? `${firstName} ${lastName}` : firstName ?? lastName ?? "Unknown");
    const phone = col(columns, "PHONE_NUMBER");
    const email = col(columns, "EMAIL");
    // Try standard column first, then common custom question patterns
    const courseInterest =
      col(columns, "COURSE_INTEREST") ??
      columns.find((c) =>
        c.column_id.toLowerCase().includes("program") ||
        c.column_id.toLowerCase().includes("course") ||
        c.column_id.toLowerCase().includes("interest")
      )?.string_value?.trim();

    if (!phone) {
      console.warn("[GoogleAds Webhook] Missing PHONE_NUMBER field", { lead_id: body.lead_id });
      return NextResponse.json({ received: true, skipped: "no_phone" }, { status: 200 });
    }

    const normalizedPhone = phone.replace(/\s+/g, "").trim();
    const leadId = body.lead_id ?? crypto.randomUUID();

    // ── 4. Idempotency: skip if lead_id already processed ────────────────────
    const existing = await prisma.lead.findFirst({
      where: {
        orgId: org.id,
        customFields: { path: ["googleAdsLeadId"], equals: leadId },
      },
      select: { id: true },
    });

    if (existing) {
      console.log(JSON.stringify({
        event: "google_ads_lead_replayed",
        googleAdsLeadId: leadId,
        leadId: existing.id,
      }));
      return NextResponse.json({ received: true, meta: { replayed: true } }, { status: 200 });
    }

    // ── 5. Test submission: acknowledge but do NOT persist ────────────────────
    if (body.is_test === true) {
      console.log(JSON.stringify({
        event: "google_ads_test_lead",
        googleAdsLeadId: leadId,
        name,
        phone: normalizedPhone,
      }));
      return NextResponse.json({ received: true, meta: { test: true } }, { status: 200 });
    }

    // ── 6. Check intake gate ──────────────────────────────────────────────────
    const settings = org.settings as Record<string, unknown> | null;
    if (settings?.applicationIntake === false) {
      return NextResponse.json({ received: true, skipped: "intake_closed" }, { status: 200 });
    }

    // ── 7. Create lead atomically ─────────────────────────────────────────────
    let lead: { id: string; name: string; createdAt: Date } | null = null;

    try {
      lead = await prisma.$transaction(async (tx) => {
        const created = await tx.lead.create({
          data: {
            name,
            email: email ?? null,
            phone: normalizedPhone,
            courseInterest: courseInterest ?? null,
            source: "GOOGLE_ADS",
            orgId: org.id,
            utmSource: "google_ads",
            utmMedium: "cpc",
            utmCampaign: body.campaign_id ?? null,
            customFields: {
              googleAdsLeadId: leadId,
              googleAdsFormId: body.form_id ?? null,
              googleAdsCampaignId: body.campaign_id ?? null,
              googleAdsAdgroupId: body.adgroup_id ?? null,
              webSource: "google_ads_lead_form",
            },
          },
          select: { id: true, name: true, createdAt: true },
        });

        await tx.leadActivity.create({
          data: {
            leadId: created.id,
            orgId: org.id,
            activityType: "NOTE",
            title: "Google Ads Lead Form",
            notes: `Lead received via Google Ads Lead Form Extension (Form ID: ${body.form_id ?? "unknown"})`,
            completedAt: new Date(),
            metadata: {
              source: "GOOGLE_ADS",
              googleAdsLeadId: leadId,
              formId: body.form_id,
              campaignId: body.campaign_id,
            },
          },
        });

        await tx.lead.update({
          where: { id: created.id },
          data: { lastActivityAt: new Date() },
        });

        return created;
      });
    } catch (err) {
      // Duplicate phone — return 200 so Google does not retry
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        console.log(JSON.stringify({
          event: "google_ads_lead_duplicate",
          phone: normalizedPhone,
          googleAdsLeadId: leadId,
        }));
        return NextResponse.json({ received: true, meta: { duplicate: true } }, { status: 200 });
      }
      throw err;
    }

    console.log(JSON.stringify({
      event: "google_ads_lead_saved",
      leadId: lead.id,
      googleAdsLeadId: leadId,
      timestamp: new Date().toISOString(),
    }));

    // ── 8. Audit + activity feed ──────────────────────────────────────────────
    await AuditService.write({
      orgId: org.id,
      action: "lead.created",
      entityType: "lead",
      entityId: lead.id,
      newValue: { name: lead.name, source: "GOOGLE_ADS", phone: normalizedPhone },
    });

    await ActivityFeedService.write({
      orgId: org.id,
      verb: "created",
      objectType: "lead",
      objectId: lead.id,
      objectSnapshot: { name: lead.name, source: "GOOGLE_ADS" },
      context: { actorName: "Google Ads Lead Form" },
    });

    // ── 9. Inngest event ──────────────────────────────────────────────────────
    await emitEvent({
      name: "lead/created",
      orgId: org.id,
      actorId: "system",
      actorName: "Google Ads Lead Form",
      requestId: leadId,
      ipAddress: "google-ads",
      timestamp: new Date().toISOString(),
      data: {
        leadId: lead.id,
        leadName: lead.name,
        source: "GOOGLE_ADS",
        courseInterest: courseInterest ?? undefined,
      },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[GoogleAds Webhook] Unhandled error", err);
    // Return 200 to prevent Google from spamming retries
    return NextResponse.json({ received: true, error: "internal" }, { status: 200 });
  }
}
