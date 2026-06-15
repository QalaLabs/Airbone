import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });

    if (!org) return NextResponse.json({ data: [] });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);
    const category = url.searchParams.get("category") ?? undefined;

    const resources = await prisma.resource.findMany({
      where: {
        orgId: org.id,
        status: "PUBLISHED",
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        type: true,
        fileUrl: true,
        externalUrl: true,
        isGated: true,
        category: true,
        tags: true,
        metadata: true,
        downloadCount: true,
      },
    });

    return NextResponse.json({ data: resources });
  } catch (err) {
    console.error("[Public Resources API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
