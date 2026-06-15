import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";

const JOB_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  requirements: true,
  location: true,
  isRemote: true,
  jobType: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  experienceYears: true,
  closesAt: true,
  tags: true,
  metadata: true,
  publishedAt: true,
  status: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });

    if (!org) return NextResponse.json({ data: [] });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);

    const jobs = await prisma.job.findMany({
      where: {
        orgId: org.id,
        status: "PUBLISHED",
        OR: [{ closesAt: null }, { closesAt: { gte: new Date() } }],
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: JOB_SELECT,
    });

    return NextResponse.json({ data: jobs });
  } catch (err) {
    console.error("[Public Jobs API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
