import { type NextRequest } from "next/server";
import { getLeadInteraktStatus } from "@/lib/automation/interakt-automations";
import { LeadService } from "@/lib/services/lead.service";
import { guard, getCounselorCondition, guardRecord } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "read", "leads");

    const lead = await LeadService.getById(ctx, id);
    const condition = getCounselorCondition(ctx.user);
    guardRecord(ctx.user, "read", "leads", lead as unknown as Record<string, unknown>, condition);

    const status = await getLeadInteraktStatus(ctx.orgId, id);
    return ok(status);
  } catch (err) {
    return handleError(err);
  }
}
