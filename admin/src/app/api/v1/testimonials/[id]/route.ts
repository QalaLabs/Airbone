import { type NextRequest } from "next/server";
import { TestimonialService } from "@/lib/services/testimonial.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, noContent, handleError } from "@/lib/utils/response";
import { updateTestimonialSchema } from "@/lib/validations/testimonial.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "read", "testimonials");
    return ok(await TestimonialService.getById(ctx, id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "write", "testimonials");
    const body = await req.json() as unknown;
    const input = updateTestimonialSchema.parse(body);
    return ok(await TestimonialService.update(ctx, id, input));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "delete", "testimonials");
    await TestimonialService.delete(ctx, id);
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
