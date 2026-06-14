import { type NextRequest } from "next/server";
import { DocumentService } from "@/lib/services/document.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, created, handleError, buildPaginationMeta } from "@/lib/utils/response";
import { uploadDocumentSchema, documentFiltersSchema, getPresignedUrlSchema } from "@/lib/validations/document.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id: admissionId } = await params;
    guard(ctx.user, "read", "documents");

    const url = new URL(req.url);
    const filters = documentFiltersSchema.parse({
      ...Object.fromEntries(url.searchParams),
      admissionId,
    });

    const { data, total } = await DocumentService.list(ctx, filters);
    return ok(data, buildPaginationMeta(total, filters.page, filters.limit));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id: admissionId } = await params;
    guard(ctx.user, "write", "documents");

    const url = new URL(req.url);

    // ?action=presign — return a presigned upload URL
    if (url.searchParams.get("action") === "presign") {
      const body = await req.json() as unknown;
      const { fileName, contentType } = getPresignedUrlSchema.parse(body);
      const result = await DocumentService.getPresignedUrl(ctx, fileName, contentType);
      return ok(result);
    }

    // Default: register uploaded document
    const body = await req.json() as unknown;
    const input = uploadDocumentSchema.parse({ ...(body as object), admissionId });
    const doc = await DocumentService.upload(ctx, input);
    return created(doc);
  } catch (err) {
    return handleError(err);
  }
}
