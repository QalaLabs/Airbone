import { type NextRequest } from "next/server";
import { z } from "zod";
import { UserService } from "@/lib/services/user.service";
import { ok, handleError } from "@/lib/utils/response";

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const { token, password } = acceptInviteSchema.parse(body);

    const user = await UserService.acceptInvite(token, password);
    return ok(user);
  } catch (err) {
    return handleError(err);
  }
}
