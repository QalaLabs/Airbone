import { PaymentRepository } from "@/lib/repositories/payment.repository";
import { AdmissionRepository } from "@/lib/repositories/admission.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError } from "@/lib/utils/errors";
import type { CreatePaymentInput, UpdatePaymentInput, PaymentFilters } from "@/lib/validations/payment.schema";
import type { RequestContext } from "@/types";

export class PaymentService {
  static async list(ctx: RequestContext, filters: PaymentFilters) {
    return PaymentRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const payment = await PaymentRepository.findById(ctx.orgId, id);
    if (!payment) throw new NotFoundError("Payment", id);
    return payment;
  }

  static async create(ctx: RequestContext, admissionId: string, input: CreatePaymentInput) {
    // Verify admission exists in this org
    const admission = await AdmissionRepository.findById(ctx.orgId, admissionId);
    if (!admission) throw new NotFoundError("Admission", admissionId);

    const receiptNo = await PaymentRepository.getNextReceiptNo(ctx.orgId);

    const payment = await PaymentRepository.create(ctx.orgId, admissionId, ctx.user.id, {
      ...input,
      receiptNo,
      studentId: admission.studentId ?? undefined,
      campusId: admission.campusId ?? undefined,
    });

    // Recalculate admission fee balance
    await AdmissionRepository.updateFeeBalance(ctx.orgId, admissionId);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "payment.recorded",
      entityType: "payment",
      entityId: payment.id,
      newValue: {
        amount: input.amount,
        method: input.method,
        receiptNo,
        admissionId,
      },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "recorded_payment",
      objectType: "payment",
      objectId: payment.id,
      objectSnapshot: { amount: input.amount, method: input.method, receiptNo },
      targetType: "admission",
      targetId: admissionId,
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "payment/received",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        paymentId: payment.id,
        admissionId,
        studentId: admission.studentId ?? undefined,
        amount: String(input.amount),
        method: input.method,
        receiptNo,
      },
    });

    return payment;
  }

  static async update(ctx: RequestContext, id: string, input: UpdatePaymentInput) {
    const existing = await this.getById(ctx, id);
    const updated = await PaymentRepository.update(ctx.orgId, id, input);

    // If status changed to COMPLETED or REFUNDED, recalculate fee balance
    if (input.status && input.status !== existing.status) {
      await AdmissionRepository.updateFeeBalance(ctx.orgId, existing.admissionId);
    }

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "payment.updated",
      entityType: "payment",
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: input.status ?? existing.status },
    });

    return updated;
  }

  static async getSummaryByAdmission(ctx: RequestContext, admissionId: string) {
    const admission = await AdmissionRepository.findById(ctx.orgId, admissionId);
    if (!admission) throw new NotFoundError("Admission", admissionId);

    const { total, count } = await PaymentRepository.getTotalByAdmission(ctx.orgId, admissionId);

    return {
      admissionId,
      feeAmount: admission.feeAmount,
      feeDiscount: admission.feeDiscount,
      feeFinal: admission.feeFinal,
      feePaid: total,
      feeBalance: admission.feeBalance,
      paymentCount: count,
    };
  }
}
