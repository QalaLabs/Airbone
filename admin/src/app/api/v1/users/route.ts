import { type NextRequest } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, created, handleError, buildPaginationMeta } from "@/lib/utils/response";
import { userFiltersSchema, inviteUserSchema, createUserSchema } from "@/lib/validations/user.schema";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "users");

    const url = new URL(req.url);
    const rawFilters = Object.fromEntries(url.searchParams.entries());
    const filters = userFiltersSchema.parse(rawFilters);

    const { data, total } = await UserService.list(ctx, filters);
    const meta = buildPaginationMeta(total, filters.page, filters.limit);

    return ok(data, meta);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "users");

    const body = await req.json() as unknown;
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "invite") {
      const input = inviteUserSchema.parse(body);
      const user = await UserService.invite(ctx, input);
      return created(user);
    }

    const input = createUserSchema.parse(body);
    const user = await UserService.create(ctx, input);
    return created(user);
  } catch (err) {
    return handleError(err);
  }
}
