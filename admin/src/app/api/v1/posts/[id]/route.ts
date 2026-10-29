import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { authenticatePostApi } from "../route";
import { sanitizeHtml } from "@/lib/cms/safe-content";
import { syncWebsiteContent } from "@/lib/website/revalidate";
import { ok, noContent, handleError } from "@/lib/utils/response";
import { UnauthorizedError, NotFoundError, ConflictError } from "@/lib/utils/errors";

const ORG_SLUG = process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation";

const updatePostSchema = z.object({
  title: z.string().trim().min(3).max(255).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(255)
    .optional(),
  body: z.string().optional(),
  bodyHtml: z.string().optional(),
  excerpt: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().max(50)).optional(),
  category: z.string().trim().max(100).optional(),
  seoTitle: z.string().trim().max(255).optional(),
  seoDesc: z.string().trim().max(500).optional(),
  featuredImageUrl: z.string().trim().optional().nullable(),
  featuredImageAlt: z.string().trim().max(255).optional().nullable(),
  author: z
    .union([
      z.string().trim().max(100),
      z.object({
        name: z.string().trim().max(100),
        role: z.string().trim().max(100).optional(),
        avatar: z.string().trim().optional(),
      }),
    ])
    .optional()
    .nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "draft", "published", "archived"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = await authenticatePostApi(req);
    if (!auth.authenticated) throw new UnauthorizedError("Valid API key or session required.");

    const org = await prisma.organization.findFirst({ where: { slug: ORG_SLUG }, select: { id: true } });
    if (!org) return NextResponse.json({ success: false, error: { code: "ORG_NOT_FOUND", message: "Organization not found" } }, { status: 500 });

    const { id } = await params;
    const post = await prisma.resource.findFirst({
      where: {
        orgId: org.id,
        OR: [{ id: id }, { slug: id }],
      },
    });

    if (!post) throw new NotFoundError("Post", id);

    const meta = (post.metadata ?? {}) as Record<string, unknown>;
    return ok({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.description,
      bodyHtml: meta.bodyHtml ?? "",
      status: post.status,
      category: post.category,
      tags: post.tags,
      seoTitle: post.seoTitle,
      seoDesc: post.seoDesc,
      publishedAt: post.publishedAt,
      author: meta.author ?? null,
      featuredImageUrl: meta.featuredImageUrl ?? null,
      featuredImageAlt: meta.featuredImageAlt ?? null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      url: `/blog/${post.slug}`,
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await authenticatePostApi(req);
    if (!auth.authenticated) throw new UnauthorizedError("Valid API key or session required.");

    const org = await prisma.organization.findFirst({ where: { slug: ORG_SLUG }, select: { id: true } });
    if (!org) return NextResponse.json({ success: false, error: { code: "ORG_NOT_FOUND", message: "Organization not found" } }, { status: 500 });

    const { id } = await params;
    const existing = await prisma.resource.findFirst({
      where: {
        orgId: org.id,
        OR: [{ id: id }, { slug: id }],
      },
    });

    if (!existing) throw new NotFoundError("Post", id);

    const body = (await req.json()) as unknown;
    const input = updatePostSchema.parse(body);

    if (input.slug && input.slug !== existing.slug) {
      const conflict = await prisma.resource.findFirst({
        where: { orgId: org.id, slug: input.slug, id: { not: existing.id } },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictError(`Slug "${input.slug}" is already in use by another article.`);
      }
    }

    const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>;
    const rawContent = input.bodyHtml ?? input.body;
    const cleanBodyHtml = rawContent !== undefined ? sanitizeHtml(rawContent) : existingMeta.bodyHtml;

    const newMeta = {
      ...existingMeta,
      ...(cleanBodyHtml !== undefined ? { bodyHtml: cleanBodyHtml } : {}),
      ...(input.featuredImageUrl !== undefined ? { featuredImageUrl: input.featuredImageUrl } : {}),
      ...(input.featuredImageAlt !== undefined ? { featuredImageAlt: input.featuredImageAlt } : {}),
      ...(input.author !== undefined ? { author: input.author } : {}),
    };

    const nextStatus = input.status ? (input.status.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED") : existing.status;
    const publishedAt = nextStatus === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;
    const excerpt = input.excerpt ?? input.description;

    const updated = await prisma.resource.update({
      where: { id: existing.id },
      data: {
        title: input.title ?? existing.title,
        slug: input.slug ?? existing.slug,
        description: excerpt !== undefined ? excerpt : existing.description,
        tags: input.tags ?? existing.tags,
        category: input.category ?? existing.category,
        seoTitle: input.seoTitle !== undefined ? input.seoTitle : existing.seoTitle,
        seoDesc: input.seoDesc !== undefined ? input.seoDesc : existing.seoDesc,
        status: nextStatus,
        publishedAt,
        metadata: newMeta as any,
      },
    });

    let revalidated = false;
    if (nextStatus === "PUBLISHED" || existing.status === "PUBLISHED") {
      try {
        const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
        await syncWebsiteContent("resource", requestId, fetch, process.env, {
          slug: updated.slug,
          paths: ["/blog", `/blog/${updated.slug}`, "/sitemap.xml"],
        });
        revalidated = true;
      } catch (revErr) {
        console.error("[PostAPI] Failed to trigger website revalidation:", revErr);
      }
    }

    const meta = (updated.metadata ?? {}) as Record<string, unknown>;
    return ok({
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      excerpt: updated.description,
      status: updated.status,
      category: updated.category,
      tags: updated.tags,
      seoTitle: updated.seoTitle,
      seoDesc: updated.seoDesc,
      publishedAt: updated.publishedAt,
      author: meta.author ?? null,
      featuredImageUrl: meta.featuredImageUrl ?? null,
      featuredImageAlt: meta.featuredImageAlt ?? null,
      url: `/blog/${updated.slug}`,
      revalidated,
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await authenticatePostApi(req);
    if (!auth.authenticated) throw new UnauthorizedError("Valid API key or session required.");

    const org = await prisma.organization.findFirst({ where: { slug: ORG_SLUG }, select: { id: true } });
    if (!org) return NextResponse.json({ success: false, error: { code: "ORG_NOT_FOUND", message: "Organization not found" } }, { status: 500 });

    const { id } = await params;
    const existing = await prisma.resource.findFirst({
      where: {
        orgId: org.id,
        OR: [{ id: id }, { slug: id }],
      },
    });

    if (!existing) throw new NotFoundError("Post", id);

    await prisma.resource.delete({ where: { id: existing.id } });

    if (existing.status === "PUBLISHED") {
      const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
      await syncWebsiteContent("resource", requestId, fetch, process.env, {
        slug: existing.slug,
        paths: ["/blog", `/blog/${existing.slug}`, "/sitemap.xml"],
      }).catch(() => undefined);
    }

    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
