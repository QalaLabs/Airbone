import { type NextRequest } from "next/server";
import { LmsService } from "@/lib/services/lms.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { noContent, handleError } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/v1/lms/certificates/[id] - hard-deletes a certificate (org-scoped). */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "delete", "lms_certificates");
    await LmsService.deleteCertificate(ctx, id);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
