import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { parseInboundWhatsApp } from "@/lib/messaging/inbound";
import { isInteraktWebhookPayload, verifyInteraktSignature } from "@/lib/messaging/providers/interakt/webhooks";
import { WhatsAppService } from "@/lib/services/whatsapp.service";

// ─── Inbound WhatsApp webhook ────────────────────────────────────────────────
//
// Public endpoint — middleware exempts /api/webhooks from session auth.
//
//   GET  → Meta Cloud API subscription handshake (hub.challenge).
//   POST → Interakt HMAC (Interakt-Signature) when that header is present;
//          otherwise the shared-secret x-webhook-secret / ?secret= check.
//
// Persistence (dedup, inbound thread, delivery status) happens in this
// handler before HTTP 200. Workflow fan-out is persisted to internal_events
// and processed by cron — no fire-and-forget after response.

function webhookSecret(): string | undefined {
  return process.env.INTERAKT_WEBHOOK_SECRET?.trim() || process.env.WHATSAPP_WEBHOOK_SECRET?.trim() || undefined;
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const secret = webhookSecret();
    if (!secret) {
      console.warn("[WhatsApp Webhook] No webhook secret configured — rejecting");
      return NextResponse.json({ received: false, error: "not_configured" }, { status: 403 });
    }

    const rawBody = await req.text();
    const interaktSig = req.headers.get("interakt-signature") ?? req.headers.get("Interakt-Signature");

    if (interaktSig) {
      if (!verifyInteraktSignature(rawBody, interaktSig, secret)) {
        console.warn("[WhatsApp Webhook] Invalid Interakt-Signature");
        return NextResponse.json({ received: false, error: "invalid_signature" }, { status: 403 });
      }
    } else {
      const provided = req.headers.get("x-webhook-secret") ?? req.nextUrl.searchParams.get("secret");
      if (provided !== secret) {
        console.warn("[WhatsApp Webhook] Invalid secret provided");
        return NextResponse.json({ received: false, error: "invalid_secret" }, { status: 403 });
      }
    }

    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });
    if (!org) {
      console.error("[WhatsApp Webhook] Org not found");
      return NextResponse.json({ received: true, skipped: "org_not_found" }, { status: 200 });
    }

    let payload: unknown;
    try {
      payload = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      return NextResponse.json({ received: true, skipped: "invalid_json" }, { status: 200 });
    }

    if (isInteraktWebhookPayload(payload)) {
      const result = await WhatsAppService.handleProviderWebhook(org.id, payload);
      return NextResponse.json({ received: true, ...result }, { status: 200 });
    }

    const msg = parseInboundWhatsApp(payload);
    if (!msg) {
      console.warn("[WhatsApp Webhook] Unrecognized payload shape", rawBody.slice(0, 500));
      return NextResponse.json({ received: true, skipped: "unrecognized_payload" }, { status: 200 });
    }

    const result = await WhatsAppService.ingestInboundMessage(org.id, msg);
    return NextResponse.json({ received: true, ...result }, { status: 200 });
  } catch (err) {
    console.error("[WhatsApp Webhook] Unhandled error", err);
    return NextResponse.json({ received: true, error: "internal" }, { status: 200 });
  }
}
