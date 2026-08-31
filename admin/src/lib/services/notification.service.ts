import { prisma } from "@/lib/db/client";
import type { NotificationChannel, NotificationEvent } from "@prisma/client";
import { getProvider } from "@/lib/messaging";

export { DEFAULT_FROM_EMAIL } from "@/lib/messaging/constants";

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
      // Master switch: automated WhatsApp sends require an explicit opt-in on
      // the org's feature flags (WhatsApp → Settings). Campaign launches are
      // deliberate admin actions and go through the provider directly.
      if (params.channel === "WHATSAPP") {
        const org = await prisma.organization.findUnique({
          where: { id: params.orgId },
          select: { featureFlags: true },
        });
        const flags = org?.featureFlags;
        const enabled =
          !!flags && typeof flags === "object" && (flags as Record<string, unknown>).whatsappNotifications === true;
        if (!enabled) return "NOT_CONFIGURED";
      }

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
//
// Transport is delegated to the messaging provider registry
// (src/lib/messaging) — template resolution, NotificationLog bookkeeping and
// interpolation stay here.

async function dispatchToProvider(input: {
  channel: NotificationChannel;
  recipient: string;
  subject: string | null;
  body: string;
}): Promise<{ status: DeliveryStatus; errorMsg?: string; externalId?: string }> {
  if (input.channel !== "EMAIL" && input.channel !== "SMS" && input.channel !== "WHATSAPP") {
    return {
      status: "NOT_CONFIGURED",
      errorMsg: `${input.channel} channel has no configured provider.`,
    };
  }

  return getProvider(input.channel).send({
    to: input.recipient,
    subject: input.subject ?? undefined,
    body: input.body,
  });
}

// ─── Template interpolation ─────────────────────────────────────────────────────

function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] ?? match : match,
  );
}
