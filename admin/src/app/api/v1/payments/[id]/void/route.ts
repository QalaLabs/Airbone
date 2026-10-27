import { type NextRequest } from "next/server";
import { PaymentService } from "@/lib/services/payment.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { voidPaymentSchema } from "@/lib/validations/payment.schema";

type Params = { params: Promise<{ id: string }> };

/**
 * CRM-11 — Void / reverse a receipt.
 * The ledger row is retained with status VOIDED plus actor, timestamp and a
 * mandatory reason; it never contributes to gross/net collections again.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "write", "payments");

    const body = (await req.json()) as unknown;
    const input = voidPaymentSchema.parse(body);

    const payment = await PaymentService.void(ctx, id, input);
    return ok(payment);
  } catch (err) {
    return handleError(err);
  }
}
