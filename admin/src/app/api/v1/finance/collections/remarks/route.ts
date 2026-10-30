import { type NextRequest } from "next/server";
import { CollectionsService } from "@/lib/services/collections.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { created, handleError } from "@/lib/utils/response";
import { createCollectionRemarkSchema } from "@/lib/validations/collection.schema";

// Record a collection remark against a student's installment and synchronize
// it to the lead's unified timeline (a LeadActivity NOTE entry).

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "write", "leads");

    const body = (await req.json()) as unknown;
    const input = createCollectionRemarkSchema.parse(body);

    const result = await CollectionsService.addRemark(ctx, input);
    return created(result);
  } catch (err) {
    return handleError(err);
  }
}
