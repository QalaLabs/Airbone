import { type NextRequest } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { ok, handleError } from "@/lib/utils/response";
import { resetPasswordSchema } from "@/lib/validations/user.schema";

// Public — consumes the one-time reset token issued by forgot-password.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const input = resetPasswordSchema.parse(body);
    const result = await UserService.resetPassword(input);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
