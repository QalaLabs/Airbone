import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { IntegrationKeyService } from "@/lib/services/integration-key.service";
import { getOptionalSession } from "@/lib/auth/session";
import { sanitizeHtml } from "@/lib/cms/safe-content";
import { syncWebsiteContent } from "@/lib/website/revalidate";
import { ok, created, handleError, buildPaginationMeta, getPaginationParams } from "@/lib/utils/response";
import { UnauthorizedError, ConflictError, ValidationError } from "@/lib/utils/errors";

const ORG_SLUG = process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation";

export const postSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .max(255)
    .optional(),
  body: z.string().optional(),
  bodyHtml: z.string().optional(),
  excerpt: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().max(50)).optional().default([]),
  category: z.string().trim().max(100).optional().default("blog"),
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
  status: z.enum(["DRAFT", "PUBLISHED", "draft", "published"]).optional().default("DRAFT"),
  updateIfExists: z.boolean().optional().default(false),
});

export type PostInput = z.infer<typeof postSchema>;

function extractPresentedKey(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? "";
  const bearer = /^Bearer\s+(.+)$/i.exec(auth)?.[1]?.trim();
  if (bearer) return bearer;
  const apiKey = req.headers.get("x-api-key")?.trim();
  if (apiKey) return apiKey;
  return null;
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function authenticatePostApi(req: NextRequest, orgId?: string) {
  const presented = extractPresentedKey(req);

  // 1. Env key comparison (instant, no DB connection needed)
  const envKeys = [
    process.env.BLOG_POSTING_API_KEY,
    process.env.BLOG_API_KEY,
    process.env.CMS_API_KEY,
  ].filter((k): k is string => Boolean(k && k.trim()));

  if (presented && envKeys.length > 0) {
    for (const envKey of envKeys) {
      if (safeCompare(presented, envKey)) {
        return { authenticated: true, method: "env_key", userId: null, name: "API Key" };
      }
    }
  }

  // 2. IntegrationKey in database (if orgId provided and DB reachable)
  if (presented && orgId) {
    try {
      const dbKey =
        (await IntegrationKeyService.authenticate(orgId, "BLOG_POSTING" as any, presented)) ||
        (await IntegrationKeyService.authenticate(orgId, "JOBS_FEED" as any, presented));
      if (dbKey) {
        return { authenticated: true, method: "integration_key", userId: dbKey.createdBy, name: dbKey.name };
      }
    } catch {
      // DB not configured or unreachable; fallback
    }
  }

  // 3. NextAuth user session
  try {
    const user = await getOptionalSession();
    if (user) {
      return { authenticated: true, method: "session", userId: user.id, name: user.name };
    }
  } catch {
    // No active session
  }

  return { authenticated: false };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticatePostApi(req);
    if (!auth.authenticated) {
      throw new UnauthorizedError("Valid API key or authenticated session required.");
    }

    const org = await prisma.organization.findFirst({ where: { slug: ORG_SLUG }, select: { id: true } });
    if (!org) return NextResponse.json({ success: false, error: { code: "ORG_NOT_FOUND", message: "Organization not found" } }, { status: 500 });

    const { page, limit, skip, sortBy, sortDir } = getPaginationParams(req.nextUrl);
    const statusParam = req.nextUrl.searchParams.get("status")?.toUpperCase();
    const categoryParam = req.nextUrl.searchParams.get("category");
    const tagParam = req.nextUrl.searchParams.get("tag");
    const slugParam = req.nextUrl.searchParams.get("slug");

    const where: any = {
      orgId: org.id,
      type: "DOCUMENT",
      ...(statusParam ? { status: statusParam } : {}),
      ...(categoryParam ? { category: { equals: categoryParam, mode: "insensitive" } } : {}),
      ...(tagParam ? { tags: { has: tagParam } } : {}),
      ...(slugParam ? { slug: slugParam } : {}),
    };

    const [total, posts] = await Promise.all([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: sortDir }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          status: true,
          category: true,
          tags: true,
          seoTitle: true,
          seoDesc: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          metadata: true,
        },
      }),
    ]);

    const formatted = posts.map((p) => {
      const meta = (p.metadata ?? {}) as Record<string, unknown>;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.description,
        status: p.status,
        category: p.category,
        tags: p.tags,
        seoTitle: p.seoTitle,
        seoDesc: p.seoDesc,
        publishedAt: p.publishedAt,
        author: meta.author ?? null,
        featuredImageUrl: meta.featuredImageUrl ?? null,
        featuredImageAlt: meta.featuredImageAlt ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return ok(formatted, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticatePostApi(req);
    if (!auth.authenticated) {
      throw new UnauthorizedError("Valid API key or authenticated session required.");
    }

    const org = await prisma.organization.findFirst({ where: { slug: ORG_SLUG }, select: { id: true } });
    if (!org) return NextResponse.json({ success: false, error: { code: "ORG_NOT_FOUND", message: "Organization not found" } }, { status: 500 });

    const body = (await req.json()) as unknown;
    const input = postSchema.parse(body);

    const slug = input.slug || generateSlug(input.title);
    if (!slug) {
      throw new ValidationError([{ message: "Could not derive a valid slug from title." }]);
    }

    const status = input.status.toUpperCase() as "DRAFT" | "PUBLISHED";
    const rawContent = input.bodyHtml ?? input.body ?? "";
    const cleanBodyHtml = sanitizeHtml(rawContent);
    const excerpt = input.excerpt ?? input.description ?? "";

    // Check for existing post with same slug
    const existing = await prisma.resource.findFirst({
      where: { orgId: org.id, slug },
    });

    let post;
    let isCreated = false;

    if (existing) {
      if (!input.updateIfExists) {
        throw new ConflictError(`A post with slug "${slug}" already exists. Pass 'updateIfExists: true' to update.`);
      }

      const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>;
      const newMeta = {
        ...existingMeta,
        bodyHtml: cleanBodyHtml || existingMeta.bodyHtml,
        featuredImageUrl: input.featuredImageUrl !== undefined ? input.featuredImageUrl : existingMeta.featuredImageUrl,
        featuredImageAlt: input.featuredImageAlt !== undefined ? input.featuredImageAlt : existingMeta.featuredImageAlt,
        author: input.author !== undefined ? input.author : existingMeta.author,
      };

      const publishedAt = status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;

      post = await prisma.resource.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          description: excerpt || existing.description,
          tags: input.tags,
          category: input.category,
          seoTitle: input.seoTitle !== undefined ? input.seoTitle : existing.seoTitle,
          seoDesc: input.seoDesc !== undefined ? input.seoDesc : existing.seoDesc,
          status,
          publishedAt,
          metadata: newMeta as any,
        },
      });
    } else {
      isCreated = true;
      const publishedAt = status === "PUBLISHED" ? new Date() : null;
      const metadata = {
        bodyHtml: cleanBodyHtml,
        featuredImageUrl: input.featuredImageUrl ?? null,
        featuredImageAlt: input.featuredImageAlt ?? null,
        author: input.author ?? null,
      };

      post = await prisma.resource.create({
        data: {
          orgId: org.id,
          title: input.title,
          slug,
          description: excerpt,
          type: "DOCUMENT",
          status,
          tags: input.tags,
          category: input.category,
          seoTitle: input.seoTitle,
          seoDesc: input.seoDesc,
          publishedAt,
          metadata: metadata as any,
          createdBy: auth.userId ?? null,
        },
      });
    }

    // Trigger website revalidation if post is PUBLISHED
    let revalidated = false;
    if (status === "PUBLISHED") {
      try {
        const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
        await syncWebsiteContent("resource", requestId, fetch, process.env, {
          slug: post.slug,
          paths: ["/blog", `/blog/${post.slug}`, "/sitemap.xml"],
        });
        revalidated = true;
      } catch (revErr) {
        console.error("[PostAPI] Failed to trigger website revalidation:", revErr);
      }
    }

    const meta = (post.metadata ?? {}) as Record<string, unknown>;
    const responsePayload = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.description,
      status: post.status,
      category: post.category,
      tags: post.tags,
      seoTitle: post.seoTitle,
      seoDesc: post.seoDesc,
      publishedAt: post.publishedAt,
      author: meta.author ?? null,
      featuredImageUrl: meta.featuredImageUrl ?? null,
      featuredImageAlt: meta.featuredImageAlt ?? null,
      url: `/blog/${post.slug}`,
      revalidated,
    };

    return isCreated ? created(responsePayload) : ok(responsePayload);
  } catch (err) {
    return handleError(err);
  }
}
