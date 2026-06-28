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
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);

    const placements = await prisma.placement.findMany({
      where: { orgId: org.id, status: "CONFIRMED" },
      orderBy: { joiningDate: "desc" },
      take: limit,
      select: {
        id: true,
        studentId: true,
        jobTitle: true,
        package: true,
        currency: true,
        joiningDate: true,
        batchYear: true,
        notes: true,
        hiringPartner: {
          select: {
            name: true,
            logoId: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ data: placements });
  } catch (err) {
    console.error("[Public Placements API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
