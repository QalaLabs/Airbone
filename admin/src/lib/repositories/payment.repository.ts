import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import type { PaymentFilters, CreatePaymentInput, UpdatePaymentInput } from "@/lib/validations/payment.schema";

const PAYMENT_SELECT = {
  id: true,
  orgId: true,
  campusId: true,
  admissionId: true,
  studentId: true,
  amount: true,
  currency: true,
  method: true,
  status: true,
  referenceNo: true,
  receiptNo: true,
  feeType: true,
  description: true,
  paidAt: true,
  gateway: true,
  gatewayTxnId: true,
  notes: true,
  collectedBy: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  admission: { select: { id: true, applicationNo: true, stage: true } },
  student: { select: { id: true, studentCode: true, firstName: true, lastName: true } },
  collector: { select: { id: true, name: true } },
} satisfies Prisma.PaymentTransactionSelect;

export class PaymentRepository {
  static async findMany(orgId: string, filters: PaymentFilters) {
    const where: Prisma.PaymentTransactionWhereInput = {
      orgId,
      ...(filters.status && { status: filters.status }),
      ...(filters.method && { method: filters.method }),
      ...(filters.admissionId && { admissionId: filters.admissionId }),
      ...(filters.studentId && { studentId: filters.studentId }),
      ...(filters.campusId && { campusId: filters.campusId }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
            },
          }
        : {}),
    };

    const skip = (filters.page - 1) * filters.limit;
    const [data, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        select: PAYMENT_SELECT,
        skip,
        take: filters.limit,
        orderBy: { [filters.sortBy]: filters.sortDir },
      }),
      prisma.paymentTransaction.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(orgId: string, id: string) {
    return prisma.paymentTransaction.findFirst({ where: { id, orgId }, select: PAYMENT_SELECT });
  }

  static async getNextReceiptNo(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await prisma.paymentTransaction.count({ where: { orgId } });
    const seq = String(count + 1).padStart(5, "0");
    return `RCP-${year}${month}-${seq}`;
  }

  static async create(
    orgId: string,
    admissionId: string,
    collectedBy: string,
    data: CreatePaymentInput & { receiptNo: string; studentId?: string; campusId?: string },
  ) {
    return prisma.paymentTransaction.create({
      data: {
        orgId,
        admissionId,
        studentId: data.studentId,
        campusId: data.campusId,
        collectedBy,
        receiptNo: data.receiptNo,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        feeType: data.feeType,
        description: data.description,
        referenceNo: data.referenceNo,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        status: "COMPLETED",
        notes: data.notes,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
      select: PAYMENT_SELECT,
    });
  }

  static async update(orgId: string, id: string, data: UpdatePaymentInput) {
    return prisma.paymentTransaction.update({
      where: { id, orgId },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.referenceNo !== undefined && { referenceNo: data.referenceNo }),
        ...(data.paidAt !== undefined && { paidAt: data.paidAt ? new Date(data.paidAt) : null }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.gatewayTxnId !== undefined && { gatewayTxnId: data.gatewayTxnId }),
        ...(data.metadata !== undefined && { metadata: data.metadata as Prisma.InputJsonValue }),
      },
      select: PAYMENT_SELECT,
    });
  }

  static async getTotalByAdmission(orgId: string, admissionId: string) {
    const result = await prisma.paymentTransaction.aggregate({
      where: { admissionId, orgId, status: "COMPLETED" },
      _sum: { amount: true },
      _count: { id: true },
    });
    return { total: Number(result._sum.amount ?? 0), count: result._count.id };
  }
}
