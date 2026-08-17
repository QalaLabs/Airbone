import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Readiness: the marketing app is useless for lead intake unless it can reach
// the admin backend and can persist to the durability fallback. No secrets are
// exposed; only presence of config is reported.
export async function GET() {
  const adminConfigured = Boolean(
    process.env.ADMIN_API_URL && process.env.ADMIN_API_URL.startsWith("http"),
  );
  const intakeKeyConfigured = Boolean(
    process.env.PUBLIC_INTAKE_KEY && process.env.PUBLIC_INTAKE_KEY.length > 0,
  );
  const fallbackConfigured = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
  );

  const ready = adminConfigured && intakeKeyConfigured && fallbackConfigured;

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      checks: {
        admin_api_url: adminConfigured,
        public_intake_key: intakeKeyConfigured,
        fallback_storage: fallbackConfigured,
      },
    },
    { status: ready ? 200 : 503 },
  );
}
