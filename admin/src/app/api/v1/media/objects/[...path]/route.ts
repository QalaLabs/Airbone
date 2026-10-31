import { type NextRequest } from "next/server";
import {
  guessContentTypeFromKey,
  isLocalStorageDriver,
  readLocalObject,
} from "@/lib/storage/gcs";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { handleError } from "@/lib/utils/response";
import { AppError } from "@/lib/utils/errors";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    if (!isLocalStorageDriver()) {
      throw new AppError("NOT_FOUND", "Object not found", 404);
    }

    const ctx = await getRequestContext();
    guard(ctx.user, "read", "media");

    const { path: segments } = await params;
    const key = segments.map(decodeURIComponent).join("/");
    const bytes = await readLocalObject(key);
    if (!bytes) {
      throw new AppError("NOT_FOUND", "Object not found", 404);
    }

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": guessContentTypeFromKey(key),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
