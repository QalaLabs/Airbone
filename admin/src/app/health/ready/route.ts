import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { isInngestEnabled } from "@/lib/events/inngest";

export const dynamic = "force-dynamic";

// Readiness: checks the database (the single most important dependency for the
// admin app) and reports whether the Inngest worker is live. No secrets exposed.
export async function GET() {
  let dbOk = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  const ready = dbOk;

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      checks: {
        database: dbOk,
        inngest_enabled: isInngestEnabled(),
      },
      error: dbError,
    },
    { status: ready ? 200 : 503 },
  );
}
