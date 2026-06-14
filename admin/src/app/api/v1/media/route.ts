import { type NextRequest } from "next/server";
import { MediaService } from "@/lib/services/media.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, created, handleError, buildPaginationMeta } from "@/lib/utils/response";
import { registerAssetSchema, assetFiltersSchema } from "@/lib/validations/media.schema";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "media");

    const url = new URL(req.url);
    const filters = assetFiltersSchema.parse(Object.fromEntries(url.searchParams));

    const { data, total } = await MediaService.list(ctx, filters);
    return ok(data, buildPaginationMeta(total, filters.page, filters.limit));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "media");

    const body = await req.json() as unknown;
    const input = registerAssetSchema.parse(body);

    const asset = await MediaService.register(ctx, input);
    return created(asset);
  } catch (err) {
    return handleError(err);
  }
}
