import { StudentRepository } from "@/lib/repositories/student.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import { prisma } from "@/lib/db/client";
import type { CreateStudentInput, UpdateStudentInput, StudentFilters } from "@/lib/validations/student.schema";
import type { RequestContext } from "@/types";

export class StudentService {
  static async list(ctx: RequestContext, filters: StudentFilters) {
    return StudentRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const student = await StudentRepository.findById(ctx.orgId, id);
    if (!student) throw new NotFoundError("Student", id);
    return student;
  }

  static async create(ctx: RequestContext, input: CreateStudentInput) {
    // Email uniqueness within org
    const existing = await StudentRepository.findByEmail(ctx.orgId, input.email);
    if (existing) throw new ConflictError(`Student with email ${input.email} already exists`);

    // If linked to a lead, ensure no student already created from it
    if (input.leadId) {
      const byLead = await StudentRepository.findByLeadId(ctx.orgId, input.leadId);
      if (byLead) throw new ConflictError(`A student (${byLead.studentCode}) already exists for this lead`);

      // Verify lead belongs to this org
      const lead = await prisma.lead.findFirst({
        where: { id: input.leadId, orgId: ctx.orgId, deletedAt: null },
        select: { id: true },
      });
      if (!lead) throw new NotFoundError("Lead", input.leadId);
    }

    // Verify campus belongs to org
    if (input.campusId) {
      const campus = await prisma.campus.findFirst({ where: { id: input.campusId, orgId: ctx.orgId } });
      if (!campus) throw new NotFoundError("Campus", input.campusId);
    }

    const studentCode = await StudentRepository.getNextCode(ctx.orgId);
    const student = await StudentRepository.create(ctx.orgId, { ...input, studentCode });

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "student.created",
      entityType: "student",
      entityId: student.id,
      newValue: { studentCode, email: input.email, leadId: input.leadId },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "student",
      objectId: student.id,
      objectSnapshot: { studentCode, name: `${student.firstName} ${student.lastName}` },
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
        admissionId: student.id,
        applicationNo: studentCode,
        leadId: input.leadId ?? "",
        leadName: `${student.firstName} ${student.lastName}`,
        campusId: input.campusId,
      },
    });

    return student;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateStudentInput) {
    const existing = await this.getById(ctx, id);

    // Email uniqueness if changing email
    if (input.email && input.email.toLowerCase() !== existing.email) {
      const conflict = await StudentRepository.findByEmail(ctx.orgId, input.email, id);
      if (conflict) throw new ConflictError(`Student with email ${input.email} already exists`);
    }

    const updated = await StudentRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "student.updated",
      entityType: "student",
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  static async delete(ctx: RequestContext, id: string) {
    await this.getById(ctx, id);
    await StudentRepository.softDelete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "student.deleted",
      entityType: "student",
      entityId: id,
    });

    return { ok: true };
  }

  static async getAdmissions(ctx: RequestContext, studentId: string) {
    await this.getById(ctx, studentId);
    return prisma.admission.findMany({
      where: { studentId, orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      include: {
        campus: { select: { id: true, name: true, code: true } },
        counselor: { select: { id: true, name: true } },
        _count: { select: { documents: true, payments: true } },
      },
    });
  }
}
