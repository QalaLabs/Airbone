import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { verifyResourceToken } from "@/lib/utils/resource-token";

// GET /api/public/resource-download?token=<gateToken>&id=<resourceId>
// Validates HMAC gate token (issued after lead form submission), returns fileUrl.
// This is the only way to obtain fileUrl for isGated resources.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const resourceId = url.searchParams.get("id");

  if (!token || !resourceId) {
    return NextResponse.json({ error: "token and id are required" }, { status: 400 });
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
}
