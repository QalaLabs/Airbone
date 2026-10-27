/**
 * CRM-04 — call dispositions.
 *
 * A disposition is the outcome of a single contact attempt (ringing, busy,
 * switched off, …). It is deliberately a SEPARATE vocabulary from
 * `LeadStatus` / the commercial pipeline stage, so logging an unanswered call
 * can never knock a lead out of the active sales pipeline.
 */
export const CALL_DISPOSITIONS = [
  "CONNECTED",
  "RINGING",
  "BUSY",
  "SWITCHED_OFF",
  "NOT_REACHABLE",
  "VOICEMAIL",
  "WRONG_NUMBER",
  "CALL_BACK_REQUESTED",
  "NOT_INTERESTED",
] as const;

export type CallDisposition = (typeof CALL_DISPOSITIONS)[number];

export const CALL_DISPOSITION_LABELS: Record<CallDisposition, string> = {
  CONNECTED: "Connected",
  RINGING: "Ringing",
  BUSY: "Busy",
  SWITCHED_OFF: "Switched off",
  NOT_REACHABLE: "Not reachable",
  VOICEMAIL: "Voicemail",
  WRONG_NUMBER: "Wrong number",
  CALL_BACK_REQUESTED: "Call back requested",
  NOT_INTERESTED: "Not interested",
};

export function isCallDisposition(value: unknown): value is CallDisposition {
  return typeof value === "string" && (CALL_DISPOSITIONS as readonly string[]).includes(value);
}
