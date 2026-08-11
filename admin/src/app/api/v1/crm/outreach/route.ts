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
import { isInngestEnabled } from "@/lib/events/inngest";

function configured(key?: string): boolean {
  return Boolean(key && key.trim().length > 0);
}

export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "notifications");

    const [templates, logs, statusCounts] = await Promise.all([
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
    ]);

    const statusBreakdown: Record<string, number> = {};
    for (const row of statusCounts) {
      statusBreakdown[String(row.status).toUpperCase()] = row._count._all;
    }

    return ok({
      templates,
      logs,
      statusBreakdown,
      delivery: {
        total: logs.length,
        sent: statusBreakdown.SENT ?? 0,
        failed: statusBreakdown.FAILED ?? 0,
        pending: statusBreakdown.PENDING ?? 0,
      },
      providers: {
        email: {
          configured: configured(process.env.RESEND_API_KEY),
          provider: "Resend",
        },
        sms: {
          configured:
            configured(process.env.TWILIO_ACCOUNT_SID) &&
            configured(process.env.TWILIO_AUTH_TOKEN) &&
            configured(process.env.TWILIO_PHONE_NUMBER),
          provider: "Twilio",
        },
        whatsapp: {
          configured:
            configured(process.env.WATI_API_URL) && configured(process.env.WATI_API_TOKEN),
          provider: "WATI",
        },
      },
      dispatchEngine: {
        inngestEnabled: isInngestEnabled(),
        note: isInngestEnabled()
          ? "Inngest event key is configured. Delivery records are written when a notification worker processes queued events."
          : "Inngest is not configured — queued notification events are not being processed.",
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
