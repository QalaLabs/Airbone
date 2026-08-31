import type { MessageChannel, MessageProvider } from "./types";
import { ResendProvider } from "./providers/resend.provider";
import { NoopProvider } from "./providers/noop.provider";

// ─── Provider registry ───────────────────────────────────────────────────────
//
// Channel → transport selection is env-driven so future providers plug in
// without touching call sites:
//   EMAIL_PROVIDER=resend        (default)
//   SMS_PROVIDER=                (unset → noop)
//   WHATSAPP_PROVIDER=mock|interakt   (Phase 5 / Phase 7)

const REGISTRY: Record<string, (channel: MessageChannel) => MessageProvider> = {
  resend: () => new ResendProvider(),
  // "mock" and "interakt" register here in later phases.
};

export function getProvider(channel: MessageChannel): MessageProvider {
  const key =
    channel === "EMAIL"
      ? (process.env.EMAIL_PROVIDER ?? "resend").trim().toLowerCase()
      : channel === "SMS"
        ? (process.env.SMS_PROVIDER ?? "").trim().toLowerCase()
        : (process.env.WHATSAPP_PROVIDER ?? "").trim().toLowerCase();

  const factory = REGISTRY[key];
  if (factory) return factory(channel);

  return new NoopProvider(
    channel,
    key
      ? `${channel} provider "${key}" is not registered.`
      : `${channel} channel has no configured provider.`,
  );
}
