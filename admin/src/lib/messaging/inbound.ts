// ─── Inbound WhatsApp payload normalization ──────────────────────────────────
//
// Webhook receivers speak many provider dialects. This module reduces them to
// one shape before any persistence happens:
//   { phone, body, externalId?, profileName? }
//
// Supported dialects:
// 1. Meta WhatsApp Cloud API — entry[].changes[].value.messages[]
//    { from, id, text: { body }, type: "text" }
// 2. Generic flat JSON — every provider that can POST
//    { phone|from|customerPhone, text|message|body, id? }

export interface InboundWhatsAppMessage {
  phone: string;
  body: string;
  externalId?: string;
  profileName?: string;
}

/** Digits only — the canonical storage/matching form used across the app. */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D+/g, "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// ─── Dialect parsers ───────────────────────────────────────────────────────────

interface MetaMessage {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
}

function fromMetaCloudApi(payload: Record<string, unknown>): InboundWhatsAppMessage | null {
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  for (const entry of entries) {
    const entryRec = asRecord(entry);
    const changes = entryRec && Array.isArray(entryRec.changes) ? entryRec.changes : [];
    for (const change of changes) {
      const changeRec = asRecord(change);
      const value = changeRec ? asRecord(changeRec.value) : null;
      const messages = value && Array.isArray(value.messages) ? (value.messages as MetaMessage[]) : [];
      for (const msg of messages) {
        // Only user text messages for now; media/templates are acknowledged but not parsed.
        const body = str(msg.text?.body);
        const from = str(msg.from);
        if (!from || !body) continue;
        return {
          phone: normalizePhone(from),
          body,
          externalId: str(msg.id),
        };
      }
    }
  }
  return null;
}

function fromFlatJson(payload: Record<string, unknown>): InboundWhatsAppMessage | null {
  const phone = normalizePhone(
    str(payload.phone) ?? str(payload.from) ?? str(payload.customerPhone) ?? str(payload.waPhone) ?? "",
  );
  const body =
    str(payload.text) ??
    str(payload.message) ??
    str(payload.body) ??
    (asRecord(payload.text) ? str(asRecord(payload.text)!.body) : undefined);
  if (!phone || !body) return null;
  return {
    phone,
    body,
    externalId: str(payload.id) ?? str(payload.messageId) ?? str(payload.externalId),
    profileName: str(payload.profileName) ?? str(payload.name),
  };
}

/**
 * Parse an arbitrary webhook payload into an inbound message.
 * Returns null when no known dialect matches — callers decide whether to
 * skip or reject.
 */
export function parseInboundWhatsApp(payload: unknown): InboundWhatsAppMessage | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  return fromMetaCloudApi(rec) ?? fromFlatJson(rec);
}

// ─── Opt-out / opt-in keyword detection ────────────────────────────────────────
//
// Whole-word matches on the uppercased body. Kept deliberately conservative —
// a wrong opt-out silently kills every automation for that contact.

const OPT_OUT_RE = /\b(STOP|STOPALL|UNSUBSCRIBE|OPTOUT|OPT\s+OUT|CANCEL|END|QUIT)\b/;
const OPT_IN_RE = /\b(START|SUBSCRIBE|OPTIN|OPT\s+IN|RESUME)\b/;

export function isOptOutKeyword(body: string): boolean {
  return OPT_OUT_RE.test(body.toUpperCase());
}

export function isOptInKeyword(body: string): boolean {
  return OPT_IN_RE.test(body.toUpperCase());
}
