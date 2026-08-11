import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { checkMaintenance } from "@/lib/middleware/maintenance";
import { handleError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await checkMaintenance();
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });

    if (!org) return NextResponse.json({ data: [] });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "6"), 20);

    const testimonials = await prisma.testimonial.findMany({
      where: { orgId: org.id, status: "APPROVED" },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        authorName: true,
        authorTitle: true,
        content: true,
        rating: true,
        batchYear: true,
        isFeatured: true,
        order: true,
        metadata: true,
      },
    });

    return NextResponse.json({ data: testimonials });
  } catch (err) {
    return handleError(err);
  }
}
