import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, created, handleError } from "@/lib/utils/response";
import { AppError } from "@/lib/utils/errors";
import {
  outreachTemplateSchema,
  toggleTemplateSchema,
} from "@/lib/validations/outreach.schema";
import { getProvider } from "@/lib/messaging";
import { computeReplyRate } from "@/lib/analytics/rates";
import { isAutomationEngineEnabled } from "@/lib/events/dispatch";

// Provider status reflects live messaging transport checks.
// `configured` = transport exists and reports required credentials;
// `verified` = a live provider round-trip / handshake succeeded.
// A channel is NEVER marked verified without a successful live check.
async function providerState(key: "email" | "sms" | "whatsapp") {
  const p = getProvider(key === "email" ? "EMAIL" : key === "sms" ? "SMS" : "WHATSAPP");
  const isConfigured = p.isConfigured();
  const configuredNow = isConfigured && p.name !== "noop";

  if (!configuredNow) {
    let missingNote = `${key} transport is not configured for this environment.`;
    if (key === "sms") {
      missingNote = "SMS provider is not configured. Missing SMS_PROVIDER (e.g. twilio, fast2sms, msg91) and provider credentials in environment variables.";
    } else if (key === "email") {
      missingNote = "Email provider is not configured. Missing SMTP_HOST, SMTP_USER, SMTP_PASS (or RESEND_API_KEY).";
    } else if (key === "whatsapp") {
      missingNote = "WhatsApp provider is not configured. Missing INTERAKT_API_KEY (or WHATSAPP_PROVIDER=interakt).";
    }
    return {
      provider: p.name,
      configured: false,
      verified: false,
      status: "not_configured" as const,
      note: missingNote,
    };
  }

  // Provider is configured: perform live verification check
  let verified = false;
  let note = "";
  try {
    const healthProvider = p as unknown as { checkHealth?: () => Promise<{ ok: boolean; live: boolean; error?: string }> };
    if (typeof healthProvider.checkHealth === "function") {
      const health = await healthProvider.checkHealth();
      verified = Boolean(health.ok && health.live);
      if (verified) {
        note = `${key.toUpperCase()} provider (${p.name}) verified and operational via live check.`;
      } else {
        note = `${key.toUpperCase()} provider (${p.name}) live verification failed: ${health.error || "connection check failed"}`;
      }
    } else {
      verified = false;
      note = `${key.toUpperCase()} provider (${p.name}) is configured but does not support automated live verification.`;
    }
  } catch (err) {
    verified = false;
    const msg = err instanceof Error ? err.message : String(err);
    note = `${key.toUpperCase()} provider (${p.name}) live verification threw error: ${msg}`;
  }

  return {
    provider: p.name,
    configured: configuredNow,
    verified,
    status: verified ? ("connected" as const) : ("configured_not_verified" as const),
    note,
  };
}

export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "notifications");

    const [templates, logs, statusCounts, whatsappReplies] = await Promise.all([
      prisma.notificationTemplate.findMany({
        where: { orgId: ctx.orgId },
        select: {
          id: true,
          event: true,
          channel: true,
          name: true,
          subject: true,
          body: true,
          variables: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.notificationLog.findMany({
        where: { orgId: ctx.orgId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          event: true,
          channel: true,
          recipient: true,
          subject: true,
          status: true,
          errorMsg: true,
          externalId: true,
          entityType: true,
          entityId: true,
          sentAt: true,
          createdAt: true,
          template: { select: { id: true, name: true } },
        },
      }),
      prisma.notificationLog.groupBy({
        by: ["status"],
        where: { orgId: ctx.orgId },
        _count: { _all: true },
      }),
      // Real reply tracking: Count unique replied leads so multiple replies from a
      // single contact never inflate the reply rate above 100%.
      prisma.leadActivity.findMany({
        where: {
          orgId: ctx.orgId,
          activityType: "WHATSAPP",
          title: { startsWith: "WhatsApp reply" },
        },
        select: { leadId: true },
        distinct: ["leadId"],
      }),
    ]);

    const statusBreakdown: Record<string, number> = {};
    for (const row of statusCounts) {
      statusBreakdown[String(row.status).toUpperCase()] = row._count._all;
    }

    const uniqueReplies = whatsappReplies.length;
    const sent = statusBreakdown.SENT ?? 0;
    // Reply rate divides unique replies by total eligible delivered outbound messages, clamped to <= 100%.
    const replyRate = computeReplyRate(sent, statusBreakdown.DELIVERED ?? 0, uniqueReplies);

    const [emailProvider, smsProvider, whatsappProvider] = await Promise.all([
      providerState("email"),
      providerState("sms"),
      providerState("whatsapp"),
    ]);

    return ok({
      templates,
      logs,
      statusBreakdown,
      delivery: {
        total: logs.length,
        sent,
        failed: statusBreakdown.FAILED ?? 0,
        pending: statusBreakdown.PENDING ?? 0,
        whatsappReplies: uniqueReplies,
        // Honest rates: null means "not measurable with persisted data" —
        // never a fabricated 0.
        emailOpenRate: null,
        replyRate,
      },
      providers: {
        email: emailProvider,
        sms: smsProvider,
        whatsapp: whatsappProvider,
      },
      dispatchEngine: {
        automationEnabled: isAutomationEngineEnabled(),
        note: isAutomationEngineEnabled()
          ? "PostgreSQL internal_events + Cloud Scheduler cron dispatch workflow and notification side effects."
          : "Automation engine unavailable.",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "notifications");

    const body = (await req.json()) as unknown;
    const action = (body as { action?: string }).action;

    if (action === "toggle") {
      const input = toggleTemplateSchema.parse(body);
      const existing = await prisma.notificationTemplate.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) {
        throw new AppError("NOT_FOUND", "Template not found", 404);
      }
      const updated = await prisma.notificationTemplate.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });
      return ok(updated);
    }

    if (action === "create") {
      const input = outreachTemplateSchema.parse(body);
      const template = await prisma.notificationTemplate.create({
        data: {
          orgId: ctx.orgId,
          event: input.event,
          channel: input.channel,
          name: input.name,
          subject: input.subject ?? null,
          body: input.body,
          variables: input.variables,
          isActive: input.isActive ?? true,
        },
      });
      return created(template);
    }

    throw new AppError("BAD_REQUEST", "Unknown outreach action. Use action=toggle or action=create.", 400);
  } catch (err) {
    return handleError(err);
  }
}
