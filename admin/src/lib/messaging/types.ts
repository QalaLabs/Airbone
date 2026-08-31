// ─── Messaging transport abstraction ─────────────────────────────────────────
//
// Providers own TRANSPORT ONLY — template resolution, logging and retry policy
// stay in NotificationService / the workflow engine. A provider must never
// report SENT unless the remote provider accepted the message.

export type MessageChannel = "EMAIL" | "SMS" | "WHATSAPP";

export interface SendMessageInput {
  to: string;
  /** Rendered body (interpolation already applied upstream). */
  body: string;
  /** Email only. */
  subject?: string;
  /** Provider-side template reference (e.g. Interakt template slug). */
  templateName?: string;
  /** Correlation ids for tracing a send back to its workflow/notification. */
  metadata?: Record<string, string>;
}

export type SendStatus = "SENT" | "FAILED" | "NOT_CONFIGURED";

export interface SendResult {
  status: SendStatus;
  /** Provider message id when accepted. */
  externalId?: string;
  errorMsg?: string;
}

export interface MessageProvider {
  readonly name: string;
  readonly channel: MessageChannel;
  /**
   * Cheap synchronous check so callers can distinguish "not configured" from
   * "configured but failed" without attempting a network call.
   */
  isConfigured(): boolean;
  send(input: SendMessageInput): Promise<SendResult>;
}
