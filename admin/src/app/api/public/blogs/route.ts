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
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 200);
    const slug = url.searchParams.get("slug") ?? undefined;
    const categoryFilter = url.searchParams.get("category") ?? undefined;
    const tagFilter = url.searchParams.get("tag") ?? undefined;

    if (slug) {
      const blog = await prisma.resource.findFirst({
        where: { orgId: org.id, slug, status: "PUBLISHED" },
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
          seoTitle: true,
          seoDesc: true,
          downloadCount: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          thumbnailId: true,
        },
      });
      const thumbnail = blog?.thumbnailId
        ? await prisma.mediaAsset.findFirst({
            where: { id: blog.thumbnailId, orgId: org.id, isActive: true },
            select: { fileUrl: true, altText: true },
          })
        : null;
      const meta = (blog?.metadata ?? {}) as Record<string, unknown>;
      return NextResponse.json({
        data: blog
          ? {
              ...blog,
              thumbnailUrl: thumbnail?.fileUrl ?? (typeof meta.featuredImageUrl === "string" ? meta.featuredImageUrl : null),
              thumbnailAlt: (typeof meta.featuredImageAlt === "string" && meta.featuredImageAlt) ? meta.featuredImageAlt : (thumbnail?.altText ?? null),
            }
          : null,
      });
    }

    const blogs = await prisma.resource.findMany({
      where: {
        orgId: org.id,
        status: "PUBLISHED",
        OR: [{ category: "blog" }, { type: "DOCUMENT" }],
        ...(categoryFilter ? { category: { equals: categoryFilter, mode: "insensitive" } } : {}),
        ...(tagFilter ? { tags: { has: tagFilter } } : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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
        seoTitle: true,
        seoDesc: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        thumbnailId: true,
      },
    });

    const thumbnailIds = [...new Set(blogs.map((b) => b.thumbnailId).filter((id): id is string => !!id))];
    const thumbnails = thumbnailIds.length
      ? await prisma.mediaAsset.findMany({
          where: { id: { in: thumbnailIds }, orgId: org.id, isActive: true },
          select: { id: true, fileUrl: true, altText: true },
        })
      : [];
    const byId = new Map(thumbnails.map((t) => [t.id, t]));

    return NextResponse.json({
      data: blogs.map((blog) => {
        const thumbnail = blog.thumbnailId ? byId.get(blog.thumbnailId) : null;
        const meta = (blog.metadata ?? {}) as Record<string, unknown>;
        return {
          ...blog,
          thumbnailUrl: thumbnail?.fileUrl ?? (typeof meta.featuredImageUrl === "string" ? meta.featuredImageUrl : null),
          thumbnailAlt: (typeof meta.featuredImageAlt === "string" && meta.featuredImageAlt) ? meta.featuredImageAlt : (thumbnail?.altText ?? null),
        };
      }),
    });
  } catch (err) {
    return handleError(err);
  }
}
