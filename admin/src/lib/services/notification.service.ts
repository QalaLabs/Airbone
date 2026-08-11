import { prisma } from "@/lib/db/client";
import type { NotificationChannel, NotificationEvent } from "@prisma/client";

export const DEFAULT_FROM_EMAIL = "noreply@airborneacademy.in";

type DeliveryStatus = "SENT" | "FAILED" | "PENDING" | "NOT_CONFIGURED";

interface NotificationDispatchParams {
  orgId: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: string;
  variables?: Record<string, string>;
  entityType?: string;
  entityId?: string;
}

/**
 * Resolves the active notification template for (org, event, channel),
 * composes the message, dispatches through the configured provider and
 * records the outcome in NotificationLog.
 *
 * - Never throws to callers (background event paths must not crash).
 * - Never reports SENT unless the provider accepted the message.
 * - Returns null when no active template exists (nothing to send).
 * - Returns the final delivery status otherwise.
 */
export class NotificationService {
  static async dispatch(params: NotificationDispatchParams): Promise<DeliveryStatus | null> {
    try {
      const template = await prisma.notificationTemplate.findFirst({
        where: {
          orgId: params.orgId,
          event: params.event,
          channel: params.channel,
          isActive: true,
        },
      });
      if (!template) return null;

      const variables = params.variables ?? {};
      const subject = template.subject ? interpolate(template.subject, variables) : null;
      const body = interpolate(template.body, variables);

      const log = await prisma.notificationLog.create({
        data: {
          orgId: params.orgId,
          templateId: template.id,
          event: params.event,
          channel: params.channel,
          recipient: params.recipient,
          subject,
          body,
          status: "PENDING",
          entityType: params.entityType,
          entityId: params.entityId,
        },
      });

      const result = await dispatchToProvider({
        channel: params.channel,
        recipient: params.recipient,
        subject,
        body,
      });

      try {
        await prisma.notificationLog.update({
          where: { id: log.id },
          data: {
            status: result.status,
            errorMsg: result.errorMsg ?? null,
            externalId: result.externalId ?? null,
            sentAt: result.status === "SENT" ? new Date() : null,
          },
        });
      } catch (updateErr) {
        // Row stays PENDING if the status write fails — that is truthful.
        console.error("[NotificationService] status update failed", updateErr);
      }

      return result.status;
    } catch (err) {
      console.error("[NotificationService] dispatch failed", err);
      return null;
    }
  }
}

// ─── Provider dispatch ─────────────────────────────────────────────────────────

async function dispatchToProvider(input: {
  channel: NotificationChannel;
  recipient: string;
  subject: string | null;
  body: string;
}): Promise<{ status: DeliveryStatus; errorMsg?: string; externalId?: string }> {
  if (input.channel !== "EMAIL") {
    return {
      status: "NOT_CONFIGURED",
      errorMsg: `${input.channel} channel has no configured provider.`,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      status: "NOT_CONFIGURED",
      errorMsg: "Email provider (Resend) is not configured. Set RESEND_API_KEY.",
    };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.recipient,
        subject: input.subject ?? "",
        text: input.body,
      }),
      signal: controller.signal,
    });

    const payload = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;

    if (!res.ok) {
      const detail = payload?.message ?? `HTTP ${res.status}`;
      return { status: "FAILED", errorMsg: `Resend rejected send (${res.status}): ${detail}` };
    }

    if (!payload?.id) {
      return { status: "FAILED", errorMsg: "Resend returned 200 without a message id." };
    }

    return { status: "SENT", externalId: payload.id };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { status: "FAILED", errorMsg: `Resend request failed: ${detail}` };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Template interpolation ─────────────────────────────────────────────────────

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] ?? match : match,
  );
}
