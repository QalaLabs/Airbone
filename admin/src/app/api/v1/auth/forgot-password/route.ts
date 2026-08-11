import { type NextRequest } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { ok, handleError } from "@/lib/utils/response";
import { forgotPasswordSchema } from "@/lib/validations/user.schema";

// Public — no session required. Always returns a generic response so callers
// cannot enumerate which accounts exist.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const input = forgotPasswordSchema.parse(body);
    const result = await UserService.requestPasswordReset(input);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
