import { type NextRequest } from "next/server";
import { uploadObject } from "@/lib/storage/gcs";
import { verifyLocalUploadQuery } from "@/lib/storage/local-upload-token";
import { handleError } from "@/lib/utils/response";
import { AppError } from "@/lib/utils/errors";

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    const contentType = url.searchParams.get("contentType") ?? "application/octet-stream";
    const exp = Number(url.searchParams.get("exp"));
    const sig = url.searchParams.get("sig") ?? "";

    if (!key) {
      throw new AppError("VALIDATION_ERROR", "Missing storage key", 400);
    }
    if (!verifyLocalUploadQuery(key, contentType, exp, sig)) {
      throw new AppError("FORBIDDEN", "Invalid or expired upload URL", 403);
    }

    const bytes = new Uint8Array(await req.arrayBuffer());
    if (bytes.byteLength === 0) {
      throw new AppError("VALIDATION_ERROR", "Upload body is empty", 400);
    }

    await uploadObject(key, bytes, contentType);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
