import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";

const COURSE_SELECT = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  description: true,
  category: true,
  duration: true,
  fee: true,
  curriculum: true,
  isFeatured: true,
  order: true,
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
    const slug = url.searchParams.get("slug");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);

    if (slug) {
      const course = await prisma.course.findFirst({
        where: { orgId: org.id, slug, status: "PUBLISHED" },
        select: COURSE_SELECT,
      });
      return NextResponse.json({ data: course ?? null });
    }

    const courses = await prisma.course.findMany({
      where: { orgId: org.id, status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: COURSE_SELECT,
    });

    return NextResponse.json({ data: courses });
  } catch (err) {
    console.error("[Public Courses API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
