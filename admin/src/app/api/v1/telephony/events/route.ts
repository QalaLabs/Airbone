import { type NextRequest, NextResponse } from "next/server";
import { AutoCallingService } from "@/lib/services/auto-calling.service";
import { prisma } from "@/lib/db/client";
import { ok } from "@/lib/utils/response";
import { safeEqualString } from "@/lib/utils/crypto";

/**
 * POST /api/v1/telephony/events
 * Real-time webhook & synchronization endpoint for TeleCMI / Voice Assistant call events.
 * Accepts call status transitions: ringing, answered, completed, busy, no-answer, failed, etc.
 * Updates CallingJob, LeadActivity, and Lead records.
 * Immediately drains the calling queue when an active call completes.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const expectedSecret =
      process.env.API_SHARED_SECRET ||
      process.env.VOICE_ASSISTANT_API_KEY ||
      "AbvgRHR33ZOCqBb2tLsslaCL69qc3UJvC4FDGFl9t2A";

    if (!authHeader || !safeEqualString(authHeader, expectedSecret)) {
      return NextResponse.json({ success: false, error: "Invalid or missing telephony API key" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    let orgId = (typeof body.orgId === "string" && body.orgId) ? body.orgId : "";
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst({
        where: { slug: process.env.PUBLIC_ORG_SLUG || "airborne-aviation" },
        select: { id: true },
      });
      orgId = defaultOrg?.id || "";
    }

    if (!orgId) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const payload = {
      providerCallId: typeof body.providerCallId === "string" ? body.providerCallId : (typeof body.request_id === "string" ? body.request_id : undefined),
      phone:
        (typeof body.phone === "string" && body.phone) ||
        (typeof body.callerPhone === "string" && body.callerPhone) ||
        (typeof body.caller_phone === "string" && body.caller_phone) ||
        (String(body.direction || "").toLowerCase() === "outbound"
          ? (typeof body.to === "string" ? body.to : (typeof body.from === "string" ? body.from : undefined))
          : (typeof body.from === "string" ? body.from : (typeof body.to === "string" ? body.to : undefined))),
      status: String(body.status || body.event || "completed"),
      direction: String(body.direction || "outbound"),
      duration: typeof body.duration === "number" ? body.duration : (typeof body.billsec === "number" ? body.billsec : Number(body.duration || 0)),
      recordingUrl:
        (typeof body.recordingUrl === "string" && body.recordingUrl) ||
        (typeof body.recording_url === "string" && body.recording_url) ||
        (typeof body.record_url === "string" && body.record_url) ||
        (typeof body.file_url === "string" && body.file_url) ||
        (typeof body.gcs_recording_url === "string" && body.gcs_recording_url) ||
        undefined,
      transcript: typeof body.transcript === "string" ? body.transcript : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
      classification: typeof body.classification === "string" ? body.classification : undefined,
      bookingIntent: typeof body.bookingIntent === "string" ? body.bookingIntent : undefined,
      userQuery: typeof body.userQuery === "string" ? body.userQuery : undefined,
      courseInterest: typeof body.courseInterest === "string" ? body.courseInterest : undefined,
    };

    const handled = await AutoCallingService.handleCallEvent(orgId, payload);

    return ok({
      success: true,
      eventProcessed: handled,
      receivedStatus: payload.status,
    });
  } catch (err: unknown) {
    const errObj = err as Error;
    console.error("[Telephony Event Webhook] Error:", errObj);
    return NextResponse.json({ success: false, error: errObj.message || "Failed to process telephony event" }, { status: 500 });
  }
}
