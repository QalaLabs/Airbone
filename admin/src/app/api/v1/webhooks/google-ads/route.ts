import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";

const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ??
  "https://airborne-admin-368523757732.asia-south1.run.app";

const WEBHOOK_URL = `${ADMIN_URL}/api/webhooks/google-ads`;

// ─── GET: return webhook URL + whether a key is configured ───────────────────
export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "leads");

    // Check env first (prod Secret Manager), then org settings (dev)
    const envKey = process.env.GOOGLE_ADS_WEBHOOK_SECRET;
    let keyConfigured = Boolean(envKey && envKey.trim().length > 0);

    if (!keyConfigured) {
      const org = await prisma.organization.findUnique({
        where: { id: ctx.orgId },
        select: { settings: true },
      });
      const s = org?.settings as Record<string, unknown> | null;
      keyConfigured =
        typeof s?.googleAdsWebhookSecret === "string" &&
        (s.googleAdsWebhookSecret as string).length > 0;
    }

    return ok({ webhookUrl: WEBHOOK_URL, keyConfigured });
  } catch (err) {
    return handleError(err);
  }
}

// ─── POST: generate (or regenerate) a new webhook secret ─────────────────────
export async function POST() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "leads");

    // Generate a cryptographically random key (UUID v4 — 36 chars)
    const newKey = crypto.randomUUID();

    // In production Cloud Run, GOOGLE_ADS_WEBHOOK_SECRET is injected via
    // Secret Manager. We store the key in org settings as the source of
    // truth that the webhook endpoint will pick up (env var takes priority
    // in prod once the Cloud Run service is redeployed with the new secret
    // version, but org-settings works immediately as a fallback).
    // Fetch existing settings first, then merge
    const existingOrg = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { settings: true },
    });
    const existingSettings =
      (existingOrg?.settings as Record<string, unknown> | null) ?? {};

    await prisma.organization.update({
      where: { id: ctx.orgId },
      data: {
        settings: {
          ...existingSettings,
          googleAdsWebhookSecret: newKey,
        },
      },
    });

    // Return full key only once — caller should copy immediately
    const keyPreview = `${newKey.slice(0, 8)}...${newKey.slice(-4)}`;

    console.log(JSON.stringify({
      event: "google_ads_webhook_key_rotated",
      orgId: ctx.orgId,
      actor: ctx.user.email ?? ctx.user.id,
      timestamp: new Date().toISOString(),
    }));

    return ok({
      webhookUrl: WEBHOOK_URL,
      key: newKey,          // full key — shown once
      keyPreview,           // short preview for display after close
      keyConfigured: true,
    });
  } catch (err) {
    return handleError(err);
  }
}
