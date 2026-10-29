import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { LeadService } from "@/lib/services/lead.service";
import { AuditService } from "@/lib/services/audit.service";
import { AutoCallingService } from "@/lib/services/auto-calling.service";
import { guard, getCounselorCondition, guardRecord } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { ValidationError } from "@/lib/utils/errors";

const agentCallSchema = z.object({
  action: z.enum(["call_now", "retry", "toggle_auto_calling", "set_do_not_call"]).optional().default("call_now"),
  objective: z.string().max(2000).optional(),
  customInstructions: z.string().max(2000).optional(),
  enabled: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/leads/[id]/agent-call
 * Returns automated calling status, telemetry, history, and active calling jobs for this lead.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "read", "leads");

    const leadRecord = await LeadService.getById(ctx, id);
    const condition = getCounselorCondition(ctx.user);
    guardRecord(ctx.user, "read", "leads", leadRecord as unknown as Record<string, unknown>, condition);

    const lead = await prisma.lead.findUnique({
      where: { id: leadRecord.id },
    });
    if (!lead) {
      throw new ValidationError([{ path: ["lead"], message: "Lead not found" }]);
    }

    // Fetch call activities for this lead
    const [callActivities, callingJobs, activeCallsCount] = await Promise.all([
      prisma.leadActivity.findMany({
        where: {
          leadId: lead.id,
          orgId: ctx.orgId,
          activityType: "CALL",
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.callingJob.findMany({
        where: {
          leadId: lead.id,
          orgId: ctx.orgId,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      AutoCallingService.getActiveCallsCount(ctx.orgId),
    ]);

    const voiceAssistantUrl =
      process.env.VOICE_ASSISTANT_URL || "https://airborne-voice-assistant-368523757732.asia-south1.run.app";

    return ok({
      leadId: lead.id,
      phone: lead.phone,
      hasPhone: !!lead.phone,
      autoCallingEnabled: lead.autoCallingEnabled !== false,
      doNotCall: lead.doNotCall === true,
      latestCallStatus: lead.latestCallStatus || (callingJobs[0]?.status ?? null),
      latestCallOutcome: lead.latestCallOutcome || (callingJobs[0]?.callOutcome ?? null),
      lastCallAt: lead.lastCallAt || (callingJobs[0]?.callCompletedAt ?? null),
      lastCallDuration: lead.lastCallDuration ?? (callingJobs[0]?.durationSecs ?? null),
      callAttemptCount: lead.callAttemptCount || callingJobs.length,
      lastCallSummary: lead.lastCallSummary || (callingJobs[0]?.summary ?? null),
      voiceAssistantConfigured: !!voiceAssistantUrl,
      activeCallsCount,
      maxConcurrentCalls: AutoCallingService.MAX_CONCURRENT_CALLS,
      callingJobs: callingJobs.map((j) => ({
        id: j.id,
        status: j.status,
        attemptCount: j.attemptCount,
        providerCallId: j.providerCallId,
        scheduledAt: j.scheduledAt,
        callStartedAt: j.callStartedAt,
        callAnsweredAt: j.callAnsweredAt,
        callCompletedAt: j.callCompletedAt,
        initiationLatencyMs: j.initiationLatencyMs,
        durationSecs: j.durationSecs,
        callOutcome: j.callOutcome,
        recordingUrl: j.recordingUrl,
        transcript: j.transcript,
        summary: j.summary,
        lastErrorMessage: j.lastErrorMessage,
        createdAt: j.createdAt,
      })),
      recentCalls: callActivities.map((a) => ({
        id: a.id,
        title: a.title,
        outcome: a.outcome,
        durationMins: a.durationMins,
        createdAt: a.createdAt,
        metadata: a.metadata,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/v1/leads/[id]/agent-call
 * Executes actions: call_now, retry, toggle_auto_calling, or set_do_not_call.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "write", "leads");

    const leadRecord = await LeadService.getById(ctx, id);
    const condition = getCounselorCondition(ctx.user);
    guardRecord(ctx.user, "write", "leads", leadRecord as unknown as Record<string, unknown>, condition);

    const lead = await prisma.lead.findUnique({
      where: { id: leadRecord.id },
    });
    if (!lead) {
      throw new ValidationError([{ path: ["lead"], message: "Lead not found" }]);
    }

    const body = (await req.json().catch(() => ({}))) as unknown;
    const parsed = agentCallSchema.parse(body ?? {});

    // Action 1: Toggle Auto Calling for this lead
    if (parsed.action === "toggle_auto_calling") {
      const newEnabled = parsed.enabled ?? !lead.autoCallingEnabled;
      await prisma.lead.update({
        where: { id: lead.id },
        data: { autoCallingEnabled: newEnabled, lastActivityAt: new Date() },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          orgId: ctx.orgId,
          performedBy: ctx.user.id,
          activityType: "NOTE",
          title: newEnabled ? "Automated Calling Enabled" : "Automated Calling Disabled",
          notes: `Automated calling setting updated to ${newEnabled ? "ENABLED" : "DISABLED"} by ${ctx.user.name}.`,
          outcome: "RECORDED",
        },
      });

      return ok({
        success: true,
        message: `Automated calling ${newEnabled ? "enabled" : "disabled"} for this lead.`,
        autoCallingEnabled: newEnabled,
      });
    }

    // Action 2: Set Do-Not-Call (DND)
    if (parsed.action === "set_do_not_call") {
      const newDnd = parsed.doNotCall ?? true;
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          doNotCall: newDnd,
          lastActivityAt: new Date(),
        },
      });

      // If marked DND, cancel all pending/queued calling jobs immediately
      if (newDnd) {
        await prisma.callingJob.updateMany({
          where: {
            leadId: lead.id,
            orgId: ctx.orgId,
            status: { in: ["QUEUED", "RETRY_SCHEDULED"] },
          },
          data: {
            status: "CANCELLED",
            skipReason: "marked_do_not_call",
          },
        });
      }

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          orgId: ctx.orgId,
          performedBy: ctx.user.id,
          activityType: "NOTE",
          title: newDnd ? "Marked as Do Not Call (DND)" : "Removed from Do Not Call (DND)",
          notes: newDnd
            ? `Lead marked as DND by ${ctx.user.name}. All automated calling cancelled.`
            : `DND status cleared by ${ctx.user.name}.`,
          outcome: "RECORDED",
        },
      });

      return ok({
        success: true,
        message: newDnd ? "Lead marked as Do-Not-Call. Automated calls cancelled." : "DND status removed.",
        doNotCall: newDnd,
      });
    }

    // Action 3: Call Now or Retry
    if (!lead.phone) {
      throw new ValidationError([{ path: ["phone"], message: "Lead does not have a phone number" }]);
    }

    if (lead.doNotCall) {
      throw new ValidationError([
        { path: ["do_not_call"], message: "Lead is marked as Do-Not-Call (DND). Unmark DND before calling." },
      ]);
    }

    // Strict concurrency check
    const activeCalls = await AutoCallingService.getActiveCallsCount(ctx.orgId);
    if (activeCalls >= AutoCallingService.MAX_CONCURRENT_CALLS) {
      throw new ValidationError([
        {
          path: ["agent_concurrency"],
          message: `AI Voice Agent is currently on ${activeCalls} calls (maximum capacity: ${AutoCallingService.MAX_CONCURRENT_CALLS}). Please wait for an active call to conclude before initiating another.`,
        },
      ]);
    }

    const targetPhone = AutoCallingService.normalizePhone(lead.phone);
    const attemptNumber = (lead.callAttemptCount || 0) + 1;

    const dispatchResult = await AutoCallingService.dispatchCall(ctx.orgId, lead, targetPhone, {
      attemptNumber,
      customNotes: parsed.objective
        ? `Manual AI Agent Call initiated by ${ctx.user.name}. Objective: ${parsed.objective}`
        : `Manual AI Agent Call initiated by counsellor ${ctx.user.name}.`,
    });

    if (dispatchResult.status === "failed") {
      throw new ValidationError([
        { path: ["voice_assistant"], message: dispatchResult.error || "Failed to trigger AI agent call" },
      ]);
    }

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      action: "CALL_INITIATED",
      entityType: "lead",
      entityId: lead.id,
      newValue: {
        phone: targetPhone,
        activityId: dispatchResult.activityId,
        jobId: dispatchResult.jobId,
        status: dispatchResult.status,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return ok({
      success: true,
      message: `AI Voice Agent call initiated to ${targetPhone}.`,
      dispatch: dispatchResult,
      activityId: dispatchResult.activityId,
      jobId: dispatchResult.jobId,
    });
  } catch (err) {
    return handleError(err);
  }
}
