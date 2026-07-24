import { type NextRequest } from "next/server";
import { LmsService } from "@/lib/services/lms.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { noContent, handleError } from "@/lib/utils/response";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "delete", "lms_courses");
    const { contentId } = await params;
    await LmsService.deleteContent(ctx, contentId);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
