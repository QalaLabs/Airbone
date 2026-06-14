import { AdmissionRepository } from "@/lib/repositories/admission.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { STAGE_TRANSITIONS } from "@/lib/validations/admission.schema";
import { prisma } from "@/lib/db/client";
import type { CreateAdmissionInput, UpdateAdmissionInput, ChangeStageInput, AdmissionFilters } from "@/lib/validations/admission.schema";
import type { AdmissionStage } from "@prisma/client";
import type { RequestContext } from "@/types";

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
    // Verify lead exists in this org
    const lead = await prisma.lead.findFirst({
      where: { id: input.leadId, orgId: ctx.orgId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!lead) throw new NotFoundError("Lead", input.leadId);

    // Verify counselor if provided
    if (input.counselorId) {
      const counselor = await prisma.user.findFirst({
        where: { id: input.counselorId, orgId: ctx.orgId, isActive: true },
      });
      if (!counselor) throw new NotFoundError("Counselor", input.counselorId);
    }

    const applicationNo = await AdmissionRepository.getNextApplicationNo(ctx.orgId);
    const admission = await AdmissionRepository.create(ctx.orgId, { ...input, applicationNo });

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
    const updated = await AdmissionRepository.update(ctx.orgId, id, input);

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

    return updated;
  }

  static async changeStage(ctx: RequestContext, id: string, input: ChangeStageInput) {
    const admission = await this.getById(ctx, id);
    const fromStage = admission.stage as AdmissionStage;
    const { toStage } = input;

    // Enforce valid transitions
    const allowed = STAGE_TRANSITIONS[fromStage] ?? [];
    if (!allowed.includes(toStage)) {
      throw new ValidationError([
        { message: `Cannot transition from ${fromStage} to ${toStage}. Allowed: ${allowed.join(", ")}` },
      ]);
    }

    // When enrolling: require a student (existing or auto-create from lead)
    let studentId = input.studentId ?? admission.studentId ?? undefined;

    if (toStage === "ENROLLED" && !studentId && admission.lead) {
      // Auto-create student record from lead if not exists
      const existingStudent = await prisma.student.findFirst({
        where: { leadId: admission.leadId, orgId: ctx.orgId },
        select: { id: true },
      });
      studentId = existingStudent?.id;
    }

    const updated = await AdmissionRepository.advanceStage(
      ctx.orgId,
      id,
      toStage,
      ctx.user.id,
      input.notes,
      studentId,
    );

    // If enrolled, mark lead as CONVERTED
    if (toStage === "ENROLLED") {
      await prisma.lead.update({
        where: { id: admission.leadId, orgId: ctx.orgId },
        data: { status: "CONVERTED", convertedAt: new Date(), score: 100 },
      });

      // Mark student as enrolled
      if (studentId) {
        await prisma.student.update({
          where: { id: studentId },
          data: { status: "ACTIVE", enrolledAt: new Date() },
        });
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
      newValue: { stage: toStage },
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
