import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { handleError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst({
      where: process.env.PUBLIC_ORG_SLUG
        ? { slug: process.env.PUBLIC_ORG_SLUG }
        : {},
      select: { id: true },
    });

    const orgWhere = org ? { orgId: org.id } : {};

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") ?? undefined;

    if (slug) {
      const page = await prisma.page.findFirst({
        where: { ...orgWhere, slug, status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          seoTitle: true,
          seoDesc: true,
          seoKeywords: true,
          ogImage: true,
          metadata: true,
          sections: {
            where: { isVisible: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              name: true,
              settings: true,
              blocks: {
                where: { isVisible: true },
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  props: true,
                  blockType: {
                    select: {
                      type: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return NextResponse.json({ data: page });
    }

    const pages = await prisma.page.findMany({
      where: { ...orgWhere, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDesc: true,
        ogImage: true,
        metadata: true,
      },
    });

    return NextResponse.json({ data: pages });
  } catch (err) {
    return handleError(err);
  }
}
