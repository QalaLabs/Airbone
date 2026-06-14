import { createHash } from "crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function buildAuditRowHash(fields: {
  id: bigint;
  orgId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  occurredAt: Date;
  prevHash?: string | null;
}): string {
  const raw = [
    fields.id.toString(),
    fields.orgId,
    fields.userId ?? "",
    fields.action,
    fields.entityType,
    fields.entityId ?? "",
    fields.occurredAt.toISOString(),
    fields.prevHash ?? "",
  ].join("|");
  return sha256(raw);
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function generateInviteToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
