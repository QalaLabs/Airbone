import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { verifyResourceToken } from "@/lib/utils/resource-token";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { checkMaintenance } from "@/lib/middleware/maintenance";
import { handleError } from "@/lib/utils/response";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    await checkMaintenance();
    const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // Prevent token brute-forcing: 20 attempts per IP per minute
  const { allowed, resetAt } = checkRateLimit(`resource-download:${ip}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      },
    );
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const resourceId = url.searchParams.get("id");

  if (!token || !resourceId) {
    return NextResponse.json({ error: "token and id are required" }, { status: 400 });
  }

  if (!UUID_RE.test(resourceId)) {
    return NextResponse.json({ error: "Invalid resource id" }, { status: 400 });
  }

  const { valid } = verifyResourceToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired access token" }, { status: 403 });
  }

  const org = await prisma.organization.findFirst({
    where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
    select: { id: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Academy configuration missing" }, { status: 500 });
  }

  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, orgId: org.id, status: "PUBLISHED", isGated: true },
    select: { fileUrl: true, externalUrl: true },
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const downloadUrl = resource.fileUrl ?? resource.externalUrl;
  if (!downloadUrl) {
    return NextResponse.json({ error: "Resource has no downloadable file" }, { status: 404 });
  }

  return NextResponse.json({ url: downloadUrl });
  } catch (err) {
    return handleError(err);
  }
}
