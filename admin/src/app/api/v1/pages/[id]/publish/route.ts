import { type NextRequest } from "next/server";
import { PageService } from "@/lib/services/page.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { publishPageSchema } from "@/lib/validations/page.schema";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "publish", "pages");

    const body = await req.json() as unknown;
    const input = publishPageSchema.parse(body);

    const result = await PageService.publish(ctx, id, input);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
