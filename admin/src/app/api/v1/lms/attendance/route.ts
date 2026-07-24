import { type NextRequest } from "next/server";
import { LmsService } from "@/lib/services/lms.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { created, handleError } from "@/lib/utils/response";
import { markAttendanceSchema } from "@/lib/validations/lms.schema";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "lms_attendance");
    const body = (await req.json()) as unknown;
    const input = markAttendanceSchema.parse(body);
    const session = await LmsService.markAttendance(ctx, input);
    return created(session);
  } catch (err) {
    return handleError(err);
  }
}
