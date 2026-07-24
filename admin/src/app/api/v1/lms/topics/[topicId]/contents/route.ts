import { type NextRequest } from "next/server";
import { LmsService } from "@/lib/services/lms.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { created, handleError } from "@/lib/utils/response";
import { createLmsContentSchema } from "@/lib/validations/lms.schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "lms_courses");
    const { topicId } = await params;
    const body = (await req.json()) as unknown;
    const input = createLmsContentSchema.parse(body);
    const content = await LmsService.createContent(ctx, topicId, input);
    return created(content);
  } catch (err) {
    return handleError(err);
  }
}
