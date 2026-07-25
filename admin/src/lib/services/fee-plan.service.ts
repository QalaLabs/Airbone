import { FeePlanRepository } from "@/lib/repositories/fee-plan.repository";
import { AuditService } from "@/lib/services/audit.service";
import { NotFoundError } from "@/lib/utils/errors";
import type { CreateFeePlanInput, UpdateFeePlanInput, FeePlanFilters } from "@/lib/validations/fee-plan.schema";
import type { RequestContext } from "@/types";

export class FeePlanService {
  static async list(ctx: RequestContext, filters: FeePlanFilters) {
    return FeePlanRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const plan = await FeePlanRepository.findById(ctx.orgId, id);
    if (!plan) throw new NotFoundError("FeePlan", id);
    return plan;
  }

  static async create(ctx: RequestContext, input: CreateFeePlanInput) {
    const plan = await FeePlanRepository.create(ctx.orgId, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "fee_plan.created",
      entityType: "fee_plan",
      entityId: plan.id,
      newValue: { name: plan.name, itemCount: plan.items.length },
    });

    return plan;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateFeePlanInput) {
    await this.getById(ctx, id);
    const plan = await FeePlanRepository.update(ctx.orgId, id, input);
    if (!plan) throw new NotFoundError("FeePlan", id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "fee_plan.updated",
      entityType: "fee_plan",
      entityId: id,
      newValue: { name: plan.name, isActive: plan.isActive },
    });

    return plan;
  }

  /** Sum plan installment amounts for admission fee fields. */
  static totalAmount(items: { amount: unknown }[]): number {
    return items.reduce((sum, item) => sum + Number(item.amount), 0);
  }
}
