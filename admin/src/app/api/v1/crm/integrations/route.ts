import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { orgWebhookKey } from "@/lib/webhooks/google-ads.service";

const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ??
  "https://airborne-admin-368523757732.asia-south1.run.app";

function configured(...vals: (string | undefined)[]): boolean {
  return vals.every((v) => Boolean(v && v.trim().length > 0));
}

export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "leads");

    const r2Configured = configured(
      process.env.R2_ACCOUNT_ID,
      process.env.R2_ACCESS_KEY_ID,
      process.env.R2_SECRET_ACCESS_KEY,
    );

    // Google Ads is connected when either the env-var secret (Cloud Run /
    // Secret Manager) or a UI-generated org-settings key exists. Both are
    // accepted by /api/webhooks/google-ads.
    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { settings: true },
    });
    const envKey = (process.env.GOOGLE_ADS_WEBHOOK_SECRET ?? "").trim();
    const orgKey = org ? orgWebhookKey(org.settings) : null;
    const googleAdsConfigured = Boolean(envKey || orgKey);

    const [mediaCount, docCount] = await Promise.all([
      prisma.mediaAsset.count({ where: { orgId: ctx.orgId, isActive: true } }),
      prisma.document.count({ where: { orgId: ctx.orgId } }),
    ]);

    return ok({
      crm: {
        leads: {
          status: "connected",
          provider: "Built-in CRM (PostgreSQL)",
          note: "Leads, activities, templates and logs are stored natively in the Airborne database.",
        },
      },
      facebook: {
        status: configured(
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          process.env.FACEBOOK_APP_SECRET,
        )
          ? "connected"
          : "not_configured",
        provider: "Meta for Business",
        required: ["NEXT_PUBLIC_FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
        note: "Facebook leads API and comment ad integrations require a Meta App.",
      },
      googleAds: {
        status: googleAdsConfigured ? "connected" : "not_configured",
        provider: "Google Ads",
        required: ["GOOGLE_ADS_WEBHOOK_SECRET"],
        note: googleAdsConfigured
          ? "Google Ads Lead Form webhook is active. Leads are ingested automatically."
          : "Generate a webhook key from the Integrations page to connect Google Ads Lead Forms.",
        webhookUrl: `${ADMIN_URL}/api/webhooks/google-ads`,
      },
      frappe: {
        status: "removed",
        provider: "Frappe ERP",
        note: "The Frappe bridge was replaced by the native CRM. Inbound lead sync from Frappe is not enabled.",
      },
      media: {
        status: r2Configured ? "connected" : "not_configured",
        provider: "Cloudflare R2",
        required: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"],
        assets: mediaCount,
        note: r2Configured
          ? "Media uploads and public CDN are live."
          : "R2 is not configured — media uploads return STORAGE_UNAVAILABLE.",
      },
      documents: {
        status: r2Configured ? "connected" : "not_configured",
        provider: "Cloudflare R2 (docs bucket)",
        assets: docCount,
      },
      automation: {
        status: configured(process.env.CRON_SECRET) ? "connected" : "not_configured",
        provider: "PostgreSQL + Cloud Scheduler",
        note: configured(process.env.CRON_SECRET)
          ? "Database-backed workflow engine active. Cron dispatches pending events and due runs."
          : "Set CRON_SECRET and configure Cloud Scheduler → /api/cron/automation.",
      },
      payments: {
        status: "not_configured",
        provider: "Payment gateway",
        required: ["STRIPE_SECRET_KEY"],
        note: "No payment provider credentials are set; payments are not processed.",
      },
      summary: {
        connected: [
          ...(["crm"] as const),
          ...(r2Configured ? (["media", "documents"] as const) : []),
          ...(configured(process.env.CRON_SECRET) ? (["automation"] as const) : []),
        ],
        notConfigured: Object.entries({
          facebook: !configured(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID, process.env.FACEBOOK_APP_SECRET),
          googleAds: !googleAdsConfigured,
          media: !r2Configured,
          documents: !r2Configured,
          payments: true,
        })
          .filter(([, missing]) => missing)
          .map(([name]) => name),
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
