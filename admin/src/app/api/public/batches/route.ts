import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { checkMaintenance } from "@/lib/middleware/maintenance";
import { handleError } from "@/lib/utils/response";
import { COURSE_SLUG_ALIASES } from "@/lib/repositories/course.repository";

/**
 * CMS-08 — public next-batch lookup for course pages.
 *
 * Returns the earliest upcoming LmsBatch start date for a course slug. There is
 * deliberately NO heuristic fallback: when no batch exists the response is
 * `{ data: null }`, so the website can render nothing instead of inventing a
 * "1st / 15th of the month" date.
 */
export async function GET(req: NextRequest) {
  try {
    await checkMaintenance();
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });
    if (!org) return NextResponse.json({ data: null });

    const url = new URL(req.url);
    const slug = (url.searchParams.get("courseSlug") ?? "").trim();
    if (!slug) return NextResponse.json({ data: null }, { status: 400 });

    const now = new Date();
    // CMS-08: the marketing slug and the LMS course slug are not always the
    // same (e.g. /courses/commercial-pilot-license-cpl vs cpl-ground-classes).
    // Use the same alias table as the public course catalogue so a published
    // batch is found for every course page.
    const slugCandidates = COURSE_SLUG_ALIASES[slug.toLowerCase()] ?? [slug];
    const batch = await prisma.lmsBatch.findFirst({
      where: {
        orgId: org.id,
        startDate: { gte: now },
        course: {
          orgId: org.id,
          slug: { in: slugCandidates, mode: "insensitive" },
          isPublished: true,
        },
      },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        capacity: true,
        course: { select: { id: true, slug: true, title: true } },
      },
    });

    return NextResponse.json({ data: batch });
  } catch (err) {
    return handleError(err);
  }
}
