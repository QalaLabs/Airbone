import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { parseInboundWhatsApp } from "@/lib/messaging/inbound";
import { WhatsAppService } from "@/lib/services/whatsapp.service";

// ─── Inbound WhatsApp webhook (provider-agnostic) ────────────────────────────
//
// Public endpoint — middleware exempts /api/webhooks from session auth; this
// handler does its own verification:
//
//   GET  → Meta Cloud API subscription handshake (hub.challenge) verified
//          against WHATSAPP_WEBHOOK_VERIFY_TOKEN.
//   POST → shared-secret check. Set WHATSAPP_WEBHOOK_SECRET and have the
//          provider send it as the `x-webhook-secret` header or `?secret=`
//          query param. No secret configured → 403, nothing is ingested.
//
// Payloads are normalized from known dialects (Meta Cloud API, generic flat
// JSON); unknown shapes are acknowledged with 200 + skipped so providers do
// not retry-storm on payloads we will never understand.

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
    // ── 1. Shared-secret verification ────────────────────────────────────────
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("[WhatsApp Webhook] WHATSAPP_WEBHOOK_SECRET not configured — rejecting");
      return NextResponse.json({ received: false, error: "not_configured" }, { status: 403 });
    }

    const provided = req.headers.get("x-webhook-secret") ?? req.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      console.warn("[WhatsApp Webhook] Invalid secret provided");
      return NextResponse.json({ received: false, error: "invalid_secret" }, { status: 403 });
    }

    // ── 2. Locate org (single-tenant default, same convention as Google Ads) ─
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });
    if (!org) {
      console.error("[WhatsApp Webhook] Org not found");
      return NextResponse.json({ received: true, skipped: "org_not_found" }, { status: 200 });
    }

    // ── 3. Parse payload into the normalized shape ───────────────────────────
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ received: true, skipped: "invalid_json" }, { status: 200 });
    }

    const msg = parseInboundWhatsApp(payload);
    if (!msg) {
      console.warn("[WhatsApp Webhook] Unrecognized payload shape", JSON.stringify(payload).slice(0, 500));
      return NextResponse.json({ received: true, skipped: "unrecognized_payload" }, { status: 200 });
    }

    // ── 4. Ingest ─────────────────────────────────────────────────────────────
    const result = await WhatsAppService.ingestInboundMessage(org.id, msg);
    return NextResponse.json({ received: true, ...result }, { status: 200 });
  } catch (err) {
    console.error("[WhatsApp Webhook] Unhandled error", err);
    // 200 so providers back off; the error is logged for diagnosis.
    return NextResponse.json({ received: true, error: "internal" }, { status: 200 });
  }
}
