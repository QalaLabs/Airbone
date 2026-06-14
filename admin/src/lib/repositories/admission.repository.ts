import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import type { AdmissionFilters, CreateAdmissionInput, UpdateAdmissionInput } from "@/lib/validations/admission.schema";

const ADMISSION_SELECT = {
  id: true,
  orgId: true,
  campusId: true,
  studentId: true,
  leadId: true,
  applicationNo: true,
  stage: true,
  courseName: true,
  batchName: true,
  batchStartDate: true,
  feeAmount: true,
  feeDiscount: true,
  feeFinal: true,
  feePaid: true,
  feeBalance: true,
  counselorId: true,
  stageChangedAt: true,
  stageChangedBy: true,
  notes: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true, code: true } },
  student: { select: { id: true, studentCode: true, firstName: true, lastName: true } },
  lead: { select: { id: true, name: true, phone: true, email: true } },
  counselor: { select: { id: true, name: true, email: true, avatarUrl: true } },
  _count: { select: { documents: true, payments: true, stageLogs: true } },
} satisfies Prisma.AdmissionSelect;

export class AdmissionRepository {
  static async findMany(orgId: string, filters: AdmissionFilters) {
    const where: Prisma.AdmissionWhereInput = {
      orgId,
      ...(filters.stage && { stage: filters.stage }),
      ...(filters.campusId && { campusId: filters.campusId }),
      ...(filters.counselorId && { counselorId: filters.counselorId }),
      ...(filters.studentId && { studentId: filters.studentId }),
      ...(filters.leadId && { leadId: filters.leadId }),
      ...(filters.search && {
        OR: [
          { applicationNo: { contains: filters.search, mode: "insensitive" } },
          { lead: { name: { contains: filters.search, mode: "insensitive" } } },
          { student: { firstName: { contains: filters.search, mode: "insensitive" } } },
          { student: { lastName: { contains: filters.search, mode: "insensitive" } } },
        ],
      }),
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
      prisma.admission.findMany({
        where,
        select: ADMISSION_SELECT,
        skip,
        take: filters.limit,
        orderBy: { [filters.sortBy]: filters.sortDir },
      }),
      prisma.admission.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(orgId: string, id: string) {
    return prisma.admission.findFirst({
      where: { id, orgId },
      select: ADMISSION_SELECT,
    });
  }

  static async getNextApplicationNo(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.admission.count({ where: { orgId } });
    const seq = String(count + 1).padStart(5, "0");
    return `APP-${year}-${seq}`;
  }

  static async create(orgId: string, data: CreateAdmissionInput & { applicationNo: string }) {
    const feeFinal = data.feeAmount != null
      ? data.feeAmount - (data.feeDiscount ?? 0)
      : null;

    return prisma.admission.create({
      data: {
        orgId,
        leadId: data.leadId,
        campusId: data.campusId,
        counselorId: data.counselorId,
        applicationNo: data.applicationNo,
        courseName: data.courseName,
        batchName: data.batchName,
        batchStartDate: data.batchStartDate ? new Date(data.batchStartDate) : null,
        feeAmount: data.feeAmount,
        feeDiscount: data.feeDiscount,
        feeFinal,
        feeBalance: feeFinal ?? 0,
        notes: data.notes,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
      select: ADMISSION_SELECT,
    });
  }

  static async update(orgId: string, id: string, data: UpdateAdmissionInput) {
    const feeFinalUpdate =
      data.feeAmount !== undefined
        ? data.feeAmount - (data.feeDiscount ?? 0)
        : undefined;

    return prisma.admission.update({
      where: { id, orgId },
      data: {
        ...(data.campusId !== undefined && { campusId: data.campusId }),
        ...(data.counselorId !== undefined && { counselorId: data.counselorId }),
        ...(data.studentId !== undefined && { studentId: data.studentId }),
        ...(data.courseName !== undefined && { courseName: data.courseName }),
        ...(data.batchName !== undefined && { batchName: data.batchName }),
        ...(data.batchStartDate !== undefined && { batchStartDate: data.batchStartDate ? new Date(data.batchStartDate) : null }),
        ...(data.feeAmount !== undefined && { feeAmount: data.feeAmount }),
        ...(data.feeDiscount !== undefined && { feeDiscount: data.feeDiscount }),
        ...(feeFinalUpdate !== undefined && { feeFinal: feeFinalUpdate, feeBalance: feeFinalUpdate }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.metadata !== undefined && { metadata: data.metadata as Prisma.InputJsonValue }),
      },
      select: ADMISSION_SELECT,
    });
  }

  static async advanceStage(
    orgId: string,
    id: string,
    toStage: string,
    changedBy: string,
    notes?: string,
    studentId?: string,
  ) {
    const [admission] = await prisma.$transaction([
      prisma.admission.update({
        where: { id, orgId },
        data: {
          stage: toStage as never,
          stageChangedAt: new Date(),
          stageChangedBy: changedBy,
          ...(studentId && { studentId }),
          ...(toStage === "ENROLLED" && { studentId }),
        },
        select: ADMISSION_SELECT,
      }),
      prisma.admissionStageLog.create({
        data: {
          orgId,
          admissionId: id,
          toStage: toStage as never,
          notes,
          changedBy,
        },
      }),
    ]);
    return admission;
  }

  static async getStageLogs(orgId: string, admissionId: string) {
    return prisma.admissionStageLog.findMany({
      where: { admissionId, orgId },
      orderBy: { changedAt: "desc" },
      include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  static async updateFeeBalance(orgId: string, id: string) {
    const total = await prisma.paymentTransaction.aggregate({
      where: { admissionId: id, orgId, status: "COMPLETED" },
      _sum: { amount: true },
    });
    const feePaid = Number(total._sum.amount ?? 0);

    const admission = await prisma.admission.findFirst({
      where: { id, orgId },
      select: { feeFinal: true },
    });
    const feeBalance = Math.max(0, Number(admission?.feeFinal ?? 0) - feePaid);

    return prisma.admission.update({
      where: { id, orgId },
      data: { feePaid, feeBalance },
      select: { id: true, feePaid: true, feeBalance: true },
    });
  }
}
