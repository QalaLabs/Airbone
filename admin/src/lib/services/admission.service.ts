import { AdmissionRepository } from "@/lib/repositories/admission.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { StudentService } from "@/lib/services/student.service";
import { FeePlanService } from "@/lib/services/fee-plan.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { STAGE_TRANSITIONS } from "@/lib/validations/admission.schema";
import { prisma } from "@/lib/db/client";
import type { CreateAdmissionInput, UpdateAdmissionInput, ChangeStageInput, AdmissionFilters } from "@/lib/validations/admission.schema";
import type { AdmissionStage } from "@prisma/client";
import type { RequestContext } from "@/types";

function splitLeadName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Student", lastName: "-" };
  const firstName = parts[0] ?? "Student";
  if (parts.length === 1) return { firstName, lastName: "-" };
  return { firstName, lastName: parts.slice(1).join(" ") };
}

export class AdmissionService {
  static async list(ctx: RequestContext, filters: AdmissionFilters) {
    return AdmissionRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const admission = await AdmissionRepository.findById(ctx.orgId, id);
    if (!admission) throw new NotFoundError("Admission", id);
    return admission;
  }

  static async create(ctx: RequestContext, input: CreateAdmissionInput) {
    const lead = await prisma.lead.findFirst({
      where: { id: input.leadId, orgId: ctx.orgId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!lead) throw new NotFoundError("Lead", input.leadId);

    if (input.counselorId) {
      const counselor = await prisma.user.findFirst({
        where: { id: input.counselorId, orgId: ctx.orgId, isActive: true },
      });
      if (!counselor) throw new NotFoundError("Counselor", input.counselorId);
    }

    let createInput = { ...input };
    if (input.feePlanId) {
      const plan = await FeePlanService.getById(ctx, input.feePlanId);
      if (!plan.isActive) {
        throw new ValidationError([{ message: "Fee plan is inactive" }]);
      }
      const total = FeePlanService.totalAmount(plan.items);
      createInput = {
        ...createInput,
        feeAmount: createInput.feeAmount ?? total,
        feeDiscount: createInput.feeDiscount ?? 0,
      };
    }

    const applicationNo = await AdmissionRepository.getNextApplicationNo(ctx.orgId);
    const admission = await AdmissionRepository.create(ctx.orgId, { ...createInput, applicationNo });

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "admission.created",
      entityType: "admission",
      entityId: admission.id,
      newValue: { applicationNo, leadId: input.leadId, stage: "ENQUIRY" },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "admission",
      objectId: admission.id,
      objectSnapshot: { applicationNo, leadName: lead.name },
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "admission/created",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        admissionId: admission.id,
        applicationNo,
        leadId: input.leadId,
        leadName: lead.name,
        campusId: input.campusId,
      },
    });

    return admission;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateAdmissionInput) {
    const existing = await this.getById(ctx, id);

    // D-01: never trust a caller-supplied studentId — verify it belongs to this org
    if (input.studentId) {
      const student = await prisma.student.findFirst({
        where: { id: input.studentId, orgId: ctx.orgId, deletedAt: null },
        select: { id: true },
      });
      if (!student) throw new NotFoundError("Student", input.studentId);
    }

    const updateInput = { ...input };

    if (input.feePlanId) {
      const plan = await FeePlanService.getById(ctx, input.feePlanId);
      if (!plan.isActive) {
        throw new ValidationError([{ message: "Fee plan is inactive" }]);
      }
      const total = FeePlanService.totalAmount(plan.items);
      if (updateInput.feeAmount === undefined) {
        updateInput.feeAmount = total;
      }
    }

    const updated = await AdmissionRepository.update(ctx.orgId, id, updateInput);

    if (
      input.feePlanId !== undefined ||
      input.feeAmount !== undefined ||
      input.feeDiscount !== undefined
    ) {
      await AdmissionRepository.updateFeeBalance(ctx.orgId, id);
    }

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "admission.updated",
      entityType: "admission",
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: updated as unknown as Record<string, unknown>,
    });

    return AdmissionRepository.findById(ctx.orgId, id);
  }

  static async changeStage(ctx: RequestContext, id: string, input: ChangeStageInput) {
    const admission = await this.getById(ctx, id);
    const fromStage = admission.stage as AdmissionStage;
    const { toStage } = input;

    const allowed = STAGE_TRANSITIONS[fromStage] ?? [];
    if (!allowed.includes(toStage)) {
      throw new ValidationError([
        { message: `Cannot transition from ${fromStage} to ${toStage}. Allowed: ${allowed.join(", ")}` },
      ]);
    }

    let studentId = input.studentId ?? admission.studentId ?? undefined;

    // D-01: never trust a caller-supplied studentId — verify it belongs to this org
    if (studentId) {
      const student = await prisma.student.findFirst({
        where: { id: studentId, orgId: ctx.orgId, deletedAt: null },
        select: { id: true },
      });
      if (!student) throw new NotFoundError("Student", studentId);
    }

    if (toStage === "ENROLLED" && !studentId && admission.lead) {
      const existingStudent = await prisma.student.findFirst({
        where: { leadId: admission.leadId, orgId: ctx.orgId, deletedAt: null },
        select: { id: true },
      });

      if (existingStudent) {
        studentId = existingStudent.id;
      } else if (input.createStudent !== false) {
        const { firstName, lastName } = splitLeadName(admission.lead.name);
        const email =
          admission.lead.email?.trim() ||
          `student+${admission.applicationNo.toLowerCase()}@airborne.local`;
        const student = await StudentService.create(ctx, {
          firstName,
          lastName,
          email,
          phone: admission.lead.phone,
          nationality: "Indian",
          medicalFitness: false,
          leadId: admission.leadId,
          campusId: admission.campusId ?? undefined,
        });
        studentId = student.id;
      }
    }

    if (toStage === "ENROLLED" && !studentId) {
      throw new ValidationError([
        { message: "Cannot enroll without a linked student. Pass createStudent:true or studentId." },
      ]);
    }

    const updated = await AdmissionRepository.advanceStage(
      ctx.orgId,
      id,
      toStage,
      ctx.user.id,
      input.notes,
      studentId,
    );

    if (toStage === "ENROLLED") {
      await prisma.lead.update({
        where: { id: admission.leadId, orgId: ctx.orgId },
        data: { status: "CONVERTED", convertedAt: new Date(), score: 100 },
      });

      if (studentId) {
        const updatedCount = await prisma.student.updateMany({
          where: { id: studentId, orgId: ctx.orgId, deletedAt: null },
          data: { status: "ACTIVE", enrolledAt: new Date() },
        });
        if (updatedCount.count === 0) {
          throw new NotFoundError("Student", studentId);
        }
      }
    }

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "admission.stage_changed",
      entityType: "admission",
      entityId: id,
      oldValue: { stage: fromStage },
      newValue: { stage: toStage, studentId },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "stage_changed",
      objectType: "admission",
      objectId: id,
      objectSnapshot: { applicationNo: admission.applicationNo },
      context: { from: fromStage, to: toStage, actorName: ctx.user.name },
    });

    await emitEvent({
      name: "admission/stage.changed",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        admissionId: id,
        applicationNo: admission.applicationNo,
        fromStage,
        toStage,
        studentId,
      },
    });

    return updated;
  }

  static async getStageLogs(ctx: RequestContext, id: string) {
    await this.getById(ctx, id);
    return AdmissionRepository.getStageLogs(ctx.orgId, id);
  }
}
