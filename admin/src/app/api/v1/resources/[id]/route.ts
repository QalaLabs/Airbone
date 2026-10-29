import { type NextRequest } from "next/server";
import { ResourceService } from "@/lib/services/resource.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, noContent, handleError } from "@/lib/utils/response";
import { updateResourceSchema } from "@/lib/validations/resource.schema";
import { syncWebsiteContent } from "@/lib/website/revalidate";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "read", "resources");
    return ok(await ResourceService.getById(ctx, id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "write", "resources");
    const body = await req.json() as unknown;
    const input = updateResourceSchema.parse(body);
    const updated = await ResourceService.update(ctx, id, input);

    if (updated.status === "PUBLISHED") {
      await syncWebsiteContent("resource", ctx.requestId, fetch, process.env, {
        slug: updated.slug,
        paths: ["/blog", `/blog/${updated.slug}`, "/sitemap.xml"],
      });
    }

    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "delete", "resources");
    const existing = await ResourceService.getById(ctx, id);
    await ResourceService.delete(ctx, id);

    if (existing?.status === "PUBLISHED") {
      await syncWebsiteContent("resource", ctx.requestId, fetch, process.env, {
        slug: existing.slug,
        paths: ["/blog", `/blog/${existing.slug}`, "/sitemap.xml"],
      });
    }

    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
