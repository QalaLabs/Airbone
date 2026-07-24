/**
 * env.ts — Runtime environment validation for Airborne Admin OS.
 *
 * REQUIRED vars crash the process with a clear message if absent.
 * OPTIONAL vars log a warning in dev; callers must handle undefined gracefully.
 *
 * Import this module early (e.g. in next.config.ts or a server-only bootstrap)
 * so misconfiguration surfaces at startup, not mid-request.
 */

// ─── Required ────────────────────────────────────────────────────────────────

const REQUIRED_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "PUBLIC_INTAKE_KEY",
] as const;

// ─── Optional with notes ─────────────────────────────────────────────────────

const OPTIONAL_VARS: Record<string, string> = {
  DIRECT_URL: "Prisma direct (non-pooled) URL — required for migrate deploy in CI",
  GEMINI_API_KEY: "Gemini AI study assistant — stub response returned when absent",
  R2_ACCOUNT_ID: "Cloudflare R2 — dev falls back to mock presign URL",
  R2_ACCESS_KEY_ID: "Cloudflare R2",
  R2_SECRET_ACCESS_KEY: "Cloudflare R2",
  R2_BUCKET_NAME: "Cloudflare R2 (default: airborne-media)",
  R2_BUCKET_DOCS: "Cloudflare R2 docs bucket",
  R2_PUBLIC_URL: "Cloudflare R2 public CDN URL",
  INNGEST_EVENT_KEY: "Inngest — defaults to 'local' when absent",
  INNGEST_SIGNING_KEY: "Inngest signing key for production webhook verification",
  TWILIO_ACCOUNT_SID: "Twilio SMS — reserved, not yet active in code",
  TWILIO_AUTH_TOKEN: "Twilio SMS",
  TWILIO_PHONE_NUMBER: "Twilio SMS sender number",
  WATI_API_URL: "WATI WhatsApp — Sprint 5 notification worker",
  WATI_API_TOKEN: "WATI WhatsApp",
  RESEND_API_KEY: "Resend transactional email — reserved",
  RESEND_FROM_EMAIL: "Resend sender address",
  UPSTASH_REDIS_REST_URL: "Upstash Redis — reserved for rate-limiting/cache",
  UPSTASH_REDIS_REST_TOKEN: "Upstash Redis",
  PUBLIC_ORG_SLUG: "Org slug for public queries (default: airborne-aviation)",
  NEXT_PUBLIC_APP_URL: "Public URL of admin app",
  NEXT_PUBLIC_APP_NAME: "App display name",
  NEXT_PUBLIC_FACEBOOK_APP_ID: "Meta/Facebook CRM integration",
  NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED: "Google Ads CRM integration flag",
  NEXT_PUBLIC_FRAPPE_URL: "Frappe ERP CRM integration URL",
};

// ─── Validation ──────────────────────────────────────────────────────────────

function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables:\n  ${missing.join("\n  ")}\n\nSee admin/.env.example for setup instructions.`,
    );
  }

  if (process.env.NODE_ENV === "development") {
    const missingOptional = Object.keys(OPTIONAL_VARS).filter(
      (key) => !process.env[key],
    );
    if (missingOptional.length > 0) {
      console.warn(
        `[env] Optional vars not set (features may be degraded):\n${missingOptional.map((k) => `  ${k}: ${OPTIONAL_VARS[k]}`).join("\n")}`,
      );
    }
  }
}

// ─── Typed accessors ─────────────────────────────────────────────────────────

export const env = {
  // Required
  DATABASE_URL: process.env.DATABASE_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  AUTH_URL: process.env.AUTH_URL!,
  PUBLIC_INTAKE_KEY: process.env.PUBLIC_INTAKE_KEY!,

  // Optional — storage
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ?? "airborne-media",
  R2_BUCKET_DOCS: process.env.R2_BUCKET_DOCS ?? "airborne-docs",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ?? "",

  // Optional — AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Optional — Inngest (safe defaults)
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY ?? "local",
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,

  // Optional — notifications (not yet active)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  WATI_API_URL: process.env.WATI_API_URL,
  WATI_API_TOKEN: process.env.WATI_API_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "noreply@airborneacademy.in",

  // Optional — org
  PUBLIC_ORG_SLUG: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation",

  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;

// Run validation once at import time (server-side only).
// In Edge runtime this runs per-request; ensure env is valid before serving.
if (typeof window === "undefined") {
  validateEnv();
}

export { validateEnv };
