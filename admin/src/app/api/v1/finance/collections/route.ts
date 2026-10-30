import { type NextRequest } from "next/server";
import { CollectionsService } from "@/lib/services/collections.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";

// Finance Collections Hub — "Fees Due This Month" and "Overdue Fees" derived
// from the admission fee-plan installment schedule and the live payment ledger.

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "payments");

    const data = await CollectionsService.getCollections(ctx);
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
