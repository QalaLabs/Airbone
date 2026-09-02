import { createHmac, timingSafeEqual } from "node:crypto";
import { decodeCorrelation, type CorrelationPayload } from "./correlation";
import { normalizePhone } from "../../phone";

// Official Interakt webhook types (https://www.interakt.shop/resource-center/interakts-webhooks/)
export const INTERAKT_STATUS_TYPES = [
  "message_api_sent",
  "message_api_delivered",
  "message_api_read",
  "message_api_failed",
  "message_campaign_sent",
  "message_campaign_delivered",
  "message_campaign_read",
  "message_campaign_failed",
] as const;

export const INTERAKT_CLICK_TYPES = ["message_api_clicked"] as const;
export const INTERAKT_INBOUND_TYPES = ["message_received"] as const;

export type InteraktWebhookType =
  | (typeof INTERAKT_STATUS_TYPES)[number]
  | (typeof INTERAKT_CLICK_TYPES)[number]
  | (typeof INTERAKT_INBOUND_TYPES)[number]
  | string;

export type InternalDeliveryStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface NormalizedInteraktWebhook {
  type: InteraktWebhookType;
  kind: "inbound" | "status" | "click" | "ignored";
  phone: string;
  body: string;
  providerMessageId?: string;
  providerCustomerId?: string;
  providerStatus?: string;
  internalStatus?: InternalDeliveryStatus;
  failureReason?: string;
  channelErrorCode?: string;
  callbackData?: CorrelationPayload | null;
  campaignId?: string;
  receivedAt?: string;
  timestamp?: string;
  profileName?: string;
  userIdTrait?: string;
}

const STATUS_RANK: Record<InternalDeliveryStatus, number> = {
  SENT: 1,
  FAILED: 1,
  DELIVERED: 2,
  READ: 3,
};

export function mapProviderStatus(raw: string | undefined, type: string): InternalDeliveryStatus | undefined {
  const fromType = type.toLowerCase();
  if (fromType.endsWith("_failed")) return "FAILED";
  if (fromType.endsWith("_read")) return "READ";
  if (fromType.endsWith("_delivered")) return "DELIVERED";
  if (fromType.endsWith("_sent")) return "SENT";

  const status = (raw ?? "").toLowerCase();
  if (status === "failed") return "FAILED";
  if (status === "read") return "READ";
  if (status === "delivered") return "DELIVERED";
  if (status === "sent") return "SENT";
  return undefined;
}

/** True when `next` should overwrite `current` (never downgrade READ → DELIVERED). */
export function shouldUpgradeStatus(current: string, next: InternalDeliveryStatus): boolean {
  if (current === next) return false;
  if (next === "FAILED") return current !== "READ" && current !== "DELIVERED";
  const curRank = STATUS_RANK[current as InternalDeliveryStatus] ?? 0;
  return STATUS_RANK[next] > curRank;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * HMAC-SHA256 of the raw body, header form `sha256=<hex>`.
 * Docs: Interakt-Signature header, secret configured in Developer Settings.
 */
export function verifyInteraktSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const provided = header.trim();
  const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expectedPrefixed = `sha256=${expectedHex}`;

  const candidates = [expectedPrefixed, expectedHex];
  for (const expected of candidates) {
    try {
      const a = Buffer.from(provided);
      const b = Buffer.from(expected);
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    } catch {
      // length mismatch / invalid encoding
    }
  }
  return false;
}

export function signInteraktPayload(rawBody: string, secret: string): string {
  const hex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return `sha256=${hex}`;
}

function callbackFromMessage(message: Record<string, unknown>): CorrelationPayload | null {
  const meta = asRecord(message.meta_data) ?? asRecord(message.metaData);
  const sourceData = meta ? (asRecord(meta.source_data) ?? asRecord(meta.sourceData)) : null;
  const raw =
    str(sourceData?.callback_data) ??
    str(sourceData?.callbackData) ??
    str(message.callbackData) ??
    str(message.callback_data);
  return decodeCorrelation(raw);
}

function phoneFromCustomer(customer: Record<string, unknown> | null): string {
  if (!customer) return "";
  const channel = str(customer.channel_phone_number) ?? str(customer.channelPhoneNumber);
  if (channel) return normalizePhone(channel);
  const country = str(customer.country_code) ?? str(customer.countryCode) ?? "";
  const national = str(customer.phone_number) ?? str(customer.phoneNumber) ?? "";
  return normalizePhone(`${country}${national}`);
}

function bodyFromMessage(message: Record<string, unknown>): string {
  const content = message.message;
  if (typeof content === "string" && content.trim()) return content.trim();
  const type = str(message.message_content_type) ?? str(message.messageContentType) ?? "Unknown";
  const media = str(message.media_url) ?? str(message.mediaUrl);
  if (media) return `[${type}] ${media}`;
  return `[${type}]`;
}

export function parseInteraktWebhook(payload: unknown): NormalizedInteraktWebhook | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  const type = str(rec.type);
  if (!type) return null;

  const data = asRecord(rec.data) ?? rec;
  const customer = asRecord(data.customer);
  const message = asRecord(data.message) ?? asRecord(rec.message);
  const traits = customer ? asRecord(customer.traits) : null;

  const phone = phoneFromCustomer(customer);
  const providerMessageId = message ? str(message.id) : undefined;
  const providerCustomerId = customer ? str(customer.id) : undefined;
  const providerStatus = message ? str(message.message_status) ?? str(message.messageStatus) : undefined;
  const userIdTrait = traits ? str(traits["User Id"]) ?? str(traits.userId) ?? str(traits.user_id) : undefined;
  const profileName = traits ? str(traits.name) : undefined;
  const campaignId = message ? str(message.campaign_id) ?? str(message.campaignId) : undefined;
  const callbackData = message ? callbackFromMessage(message) : null;
  const failureReason =
    (message ? str(message.channel_failure_reason) ?? str(message.channelFailureReason) : undefined) ?? undefined;
  const channelErrorCode =
    (message ? str(message.channel_error_code) ?? str(message.channelErrorCode) : undefined) ?? undefined;

  const lower = type.toLowerCase();
  if ((INTERAKT_INBOUND_TYPES as readonly string[]).includes(lower)) {
    if (!phone) return null;
    return {
      type,
      kind: "inbound",
      phone,
      body: message ? bodyFromMessage(message) : "",
      providerMessageId,
      providerCustomerId,
      providerStatus,
      receivedAt: message ? str(message.received_at_utc) ?? str(message.receivedAtUtc) : undefined,
      timestamp: str(rec.timestamp),
      profileName,
      userIdTrait,
      callbackData,
      campaignId,
    };
  }

  if ((INTERAKT_STATUS_TYPES as readonly string[]).includes(lower)) {
    return {
      type,
      kind: "status",
      phone,
      body: "",
      providerMessageId,
      providerCustomerId,
      providerStatus,
      internalStatus: mapProviderStatus(providerStatus, type),
      failureReason,
      channelErrorCode,
      callbackData,
      campaignId,
      timestamp: str(rec.timestamp),
      profileName,
      userIdTrait,
    };
  }

  if ((INTERAKT_CLICK_TYPES as readonly string[]).includes(lower)) {
    return {
      type,
      kind: "click",
      phone,
      body: "",
      providerMessageId,
      providerCustomerId,
      callbackData,
      timestamp: str(rec.timestamp),
      profileName,
      userIdTrait,
    };
  }

  return {
    type,
    kind: "ignored",
    phone,
    body: "",
    providerMessageId,
    timestamp: str(rec.timestamp),
  };
}

export function isInteraktWebhookPayload(payload: unknown): boolean {
  const rec = asRecord(payload);
  if (!rec) return false;
  const type = str(rec.type);
  if (!type) return false;
  return type.startsWith("message_") || type.startsWith("account_") || type.startsWith("template_") || type === "messages";
}

export function providerEventId(event: NormalizedInteraktWebhook): string {
  const id = event.providerMessageId ?? event.timestamp ?? "unknown";
  return `${event.type}:${id}`;
}
