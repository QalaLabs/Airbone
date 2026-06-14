import { type NextRequest } from "next/server";
import { TestimonialService } from "@/lib/services/testimonial.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { reviewTestimonialSchema } from "@/lib/validations/testimonial.schema";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "approve", "testimonials");
    const body = await req.json() as unknown;
    const input = reviewTestimonialSchema.parse(body);
    return ok(await TestimonialService.review(ctx, id, input));
  } catch (err) {
    return handleError(err);
  }
}
