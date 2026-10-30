import { prisma } from "@/lib/db/client";
import { buildInstallmentSchedule, isDueInISTMonth, isOverdue } from "@/lib/services/collection-schedule";
import type { CollectionInstallment } from "@/lib/services/collection-schedule";
import { AuditService } from "@/lib/services/audit.service";
import { NotFoundError, ForbiddenError } from "@/lib/utils/errors";
import type { CreateCollectionRemarkInput } from "@/lib/validations/collection.schema";
import type { RequestContext } from "@/types";
import type { Prisma } from "@prisma/client";

/** Metadata marker stored on the LeadActivity so remarks survive as timeline entries. */
export const COLLECTION_REMARK_KIND = "collection_remark";

export interface CollectionRow {
  admissionId: string;
  applicationNo: string;
  leadId: string;
  studentId: string | null;
  studentCode: string | null;
  studentName: string;
  phone: string;
  courseName: string | null;
  installmentKey: string;
  installmentName: string;
  amount: number;
  paid: number;
  pending: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: string | null;
  counselorName: string | null;
  collectionStatus: string;
  latestRemark: { text: string; authorName: string | null; at: string } | null;
}

interface AdmissionSeed {
  id: string;
  applicationNo: string;
  stage: string;
  courseName: string | null;
  batchStartDate: Date | null;
  createdAt: Date;
  feeAmount: unknown;
  feeFinal: unknown;
  leadId: string;
  metadata: unknown;
  student: { id: string; studentCode: string; firstName: string; lastName: string; phone: string } | null;
  lead: { id: string; name: string; phone: string } | null;
  counselor: { id: string; name: string } | null;
  feePlan: {
    items: { id: string; name: string; amount: unknown; percentOfFee: unknown; dueOffsetDays: number; sortOrder: number }[];
  } | null;
  payments: { amount: unknown; refundedAmount: unknown; status: string }[];
}

interface SnapshotItem {
  name: string;
  amount?: number | string | null;
  percentOfFee?: number | string | null;
  dueOffsetDays?: number | null;
  sortOrder?: number | null;
  resolvedAmount?: number | string | null;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Extract installment items from the admission's immutable snapshot or live plan. */
function extractItems(a: AdmissionSeed): SnapshotItem[] {
  const meta = (a.metadata ?? {}) as {
    feePlanSnapshot?: { items?: SnapshotItem[] };
  };
  if (Array.isArray(meta.feePlanSnapshot?.items) && meta.feePlanSnapshot!.items.length > 0) {
    return meta.feePlanSnapshot!.items.map((it) => ({
      name: it.name ?? "Installment",
      amount: it.amount ?? null,
      percentOfFee: it.percentOfFee ?? null,
      dueOffsetDays: it.dueOffsetDays ?? 0,
      sortOrder: it.sortOrder ?? 0,
      resolvedAmount: it.resolvedAmount ?? null,
    }));
  }
  if (a.feePlan && Array.isArray(a.feePlan.items) && a.feePlan.items.length > 0) {
    return a.feePlan.items.map((it) => ({
      name: it.name,
      amount: (it.amount ?? null) as number | string | null,
      percentOfFee: (it.percentOfFee ?? null) as number | string | null,
      dueOffsetDays: it.dueOffsetDays,
      sortOrder: it.sortOrder,
    }));
  }
  // No plan → the admission is a single lump-sum fee due at the base date.
  const feeFinal = toNumber(a.feeFinal);
  return [
    {
      name: "Course fee",
      amount: null,
      percentOfFee: null,
      dueOffsetDays: 0,
      sortOrder: 0,
      resolvedAmount: feeFinal,
    },
  ];
}

export class CollectionsService {
  static async getCollections(ctx: RequestContext, now = new Date()) {
    const admissions: AdmissionSeed[] = await prisma.admission.findMany({
      where: {
        orgId: ctx.orgId,
        deletedAt: null,
        stage: { notIn: ["CANCELLED", "DROPPED"] },
        lead: { deletedAt: null },
      },
      select: {
        id: true,
        applicationNo: true,
        stage: true,
        courseName: true,
        batchStartDate: true,
        createdAt: true,
        feeAmount: true,
        feeFinal: true,
        leadId: true,
        metadata: true,
        student: { select: { id: true, studentCode: true, firstName: true, lastName: true, phone: true } },
        lead: { select: { id: true, name: true, phone: true } },
        counselor: { select: { id: true, name: true } },
        feePlan: {
          select: {
            items: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, name: true, amount: true, percentOfFee: true, dueOffsetDays: true, sortOrder: true },
            },
          },
        },
        payments: { select: { amount: true, refundedAmount: true, status: true } },
      },
    });

    const rows: CollectionRow[] = [];
    for (const a of admissions) {
      const items = extractItems(a);
      const baseDate = a.batchStartDate ?? a.createdAt;
      const schedule: CollectionInstallment[] = buildInstallmentSchedule({
        items,
        baseDate,
        baseFee: toNumber(a.feeAmount),
        feeFinal: toNumber(a.feeFinal),
        payments: a.payments.map((p) => ({
          amount: Number(p.amount ?? 0),
          refundedAmount: p.refundedAmount != null ? Number(p.refundedAmount) : null,
          status: p.status,
        })),
        now,
      });

      const studentName = a.student
        ? `${a.student.firstName} ${a.student.lastName}`.trim()
        : a.lead?.name ?? "Candidate";

      for (const inst of schedule) {
        if (inst.pending <= 0) continue; // exclude fully paid installments
        rows.push({
          admissionId: a.id,
          applicationNo: a.applicationNo,
          leadId: a.leadId,
          studentId: a.student?.id ?? null,
          studentCode: a.student?.studentCode ?? null,
          studentName,
          phone: a.student?.phone || a.lead?.phone || "",
          courseName: a.courseName,
          installmentKey: inst.key,
          installmentName: inst.name,
          amount: inst.amount,
          paid: inst.paid,
          pending: inst.pending,
          dueDate: inst.dueDate.toISOString(),
          daysOverdue: inst.daysOverdue,
          agingBucket: inst.agingBucket,
          counselorName: a.counselor?.name ?? null,
          collectionStatus: inst.status,
          latestRemark: null,
        });
      }
    }

    // Latest collection remark per (admission, installment) — newest first.
    const leadIds = [...new Set(rows.map((r) => r.leadId))];
    if (leadIds.length > 0) {
      const remarkActivities = await prisma.leadActivity.findMany({
        where: {
          orgId: ctx.orgId,
          leadId: { in: leadIds },
          metadata: { path: ["kind"], equals: COLLECTION_REMARK_KIND },
        },
        orderBy: { createdAt: "desc" },
        select: {
          leadId: true,
          notes: true,
          createdAt: true,
          metadata: true,
          performer: { select: { name: true } },
        },
      });

      const latest = new Map<string, CollectionRow["latestRemark"]>();
      for (const act of remarkActivities) {
        const meta = (act.metadata ?? {}) as { admissionId?: string; installmentKey?: string };
        if (!meta.admissionId) continue;
        const mapKey = `${meta.admissionId}:${meta.installmentKey ?? ""}`;
        if (latest.has(mapKey)) continue; // ordered desc → first is latest
        latest.set(mapKey, {
          text: act.notes ?? "",
          authorName: act.performer?.name ?? null,
          at: act.createdAt.toISOString(),
        });
      }
      for (const row of rows) {
        row.latestRemark = latest.get(`${row.admissionId}:${row.installmentKey}`) ?? null;
      }
    }

    const dueThisMonth = rows
      .filter((r) => isDueInISTMonth(new Date(r.dueDate), now))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const overdue = rows
      .filter((r) => isOverdue(new Date(r.dueDate), now))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const sum = (list: CollectionRow[]) =>
      list.reduce((s, r) => s + r.pending, 0);

    return {
      dueThisMonth,
      overdue,
      totals: {
        outstanding: Math.round(sum(rows) * 100) / 100,
        dueThisMonth: Math.round(sum(dueThisMonth) * 100) / 100,
        overdue: Math.round(sum(overdue) * 100) / 100,
        activeAccounts: new Set(rows.map((r) => r.admissionId)).size,
      },
    };
  }

  static async addRemark(ctx: RequestContext, input: CreateCollectionRemarkInput) {
    const admission = await prisma.admission.findFirst({
      where: { id: input.admissionId, orgId: ctx.orgId },
      select: { id: true, leadId: true, lead: { select: { id: true, assignedTo: true, createdBy: true } } },
    });
    if (!admission) throw new NotFoundError("Admission", input.admissionId);

    const lead = admission.lead;
    if (!lead) throw new NotFoundError("Lead", admission.leadId);

    // ABAC: counselors may only remark on leads they own; admins/finance are unrestricted.
    if (
      ctx.user.role === "ADMISSIONS_COUNSELOR" &&
      lead.assignedTo !== ctx.user.id &&
      lead.createdBy !== ctx.user.id
    ) {
      throw new ForbiddenError("write", "leads");
    }

    // Idempotency: a retry of the same client key returns the existing remark
    // instead of writing a duplicate timeline event.
    const metadata = {
      kind: COLLECTION_REMARK_KIND,
      admissionId: admission.id,
      installmentKey: input.installmentKey ?? null,
      installmentName: input.installmentName ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
    };

    if (input.idempotencyKey) {
      const existing = await prisma.leadActivity.findFirst({
        where: {
          orgId: ctx.orgId,
          leadId: admission.leadId,
          metadata: { path: ["idempotencyKey"], equals: input.idempotencyKey },
        },
        select: { id: true },
      });
      if (existing) return { id: existing.id, replayed: true };
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: admission.leadId,
        orgId: ctx.orgId,
        performedBy: ctx.user.id,
        activityType: "NOTE",
        title: `Fee Collection Remark${input.installmentName ? ` — ${input.installmentName}` : ""}`,
        notes: input.remark,
        outcome: input.outcome ?? null,
        nextAction: input.nextAction ?? null,
        completedAt: new Date(),
        metadata: metadata as Prisma.InputJsonValue,
      },
      include: { performer: { select: { id: true, name: true } } },
    });

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "collection_remark.created",
      entityType: "lead_activity",
      entityId: activity.id,
      newValue: { admissionId: admission.id, installmentKey: input.installmentKey ?? null },
    });

    return { id: activity.id, replayed: false };
  }
}
