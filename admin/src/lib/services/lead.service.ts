import { LeadRepository } from "@/lib/repositories/lead.repository";
import { emitEvent } from "@/lib/events/inngest";
import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";
import type { CreateLeadInput, UpdateLeadInput, LeadFilters, CreateActivityInput } from "@/lib/validations/lead.schema";
import type { RequestContext } from "@/types";
import type { LeadStatus } from "@prisma/client";

export class LeadService {
  static async list(ctx: RequestContext, filters: LeadFilters) {
    return LeadRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const lead = await LeadRepository.findById(ctx.orgId, id);
    if (!lead) throw new NotFoundError("Lead", id);
    return lead;
  }

  static async create(ctx: RequestContext, input: CreateLeadInput) {
    // Check for duplicate phone within org
    const existing = await LeadRepository.findByPhone(ctx.orgId, input.phone);

    const lead = await LeadRepository.create(ctx.orgId, ctx.user.id, input);

    // Mark as potential duplicate
    if (existing) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { isDuplicate: true, duplicateOf: existing.id },
      });
    }

    // Emit event — triggers audit + activity feed + score calc async
    await emitEvent({
      name: "lead/created",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      timestamp: new Date().toISOString(),
      data: {
        leadId: lead.id,
        leadName: lead.name,
        source: lead.source,
        courseInterest: lead.courseInterest ?? undefined,
      },
    });

    return lead;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateLeadInput) {
    const existing = await this.getById(ctx, id);

    // Detect status change for targeted event
    const statusChanged = input.status && input.status !== existing.status;

    const updated = await LeadRepository.update(ctx.orgId, id, input);

    if (statusChanged) {
      await emitEvent({
        name: "lead/status.changed",
        orgId: ctx.orgId,
        actorId: ctx.user.id,
        actorName: ctx.user.name,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
        timestamp: new Date().toISOString(),
        data: {
          leadId: id,
          leadName: updated.name,
          oldStatus: existing.status,
          newStatus: input.status as LeadStatus,
        },
      });
    } else {
      // General update audit via event
      const { AuditService } = await import("@/lib/services/audit.service");
      await AuditService.write({
        orgId: ctx.orgId,
        userId: ctx.user.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
        action: "lead.updated",
        entityType: "lead",
        entityId: id,
        oldValue: existing as unknown as Record<string, unknown>,
        newValue: updated as unknown as Record<string, unknown>,
      });
    }

    return updated;
  }

  static async assign(ctx: RequestContext, id: string, counselorId: string) {
    const lead = await this.getById(ctx, id);

    // Verify counselor exists in same org
    const counselor = await prisma.user.findFirst({
      where: { id: counselorId, orgId: ctx.orgId, isActive: true },
      select: { id: true, name: true },
    });
    if (!counselor) throw new NotFoundError("Counselor", counselorId);

    await LeadRepository.update(ctx.orgId, id, { assignedTo: counselorId });

    await emitEvent({
      name: "lead/assigned",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        leadId: id,
        leadName: lead.name,
        counselorId,
        counselorName: counselor.name,
      },
    });

    return { ok: true };
  }

  static async delete(ctx: RequestContext, id: string) {
    await this.getById(ctx, id);
    await LeadRepository.softDelete(ctx.orgId, id);

    const { AuditService } = await import("@/lib/services/audit.service");
    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "lead.deleted",
      entityType: "lead",
      entityId: id,
    });

    return { ok: true };
  }

  // ─── Lead Activities ───────────────────────────────────────────────────

  static async createActivity(
    ctx: RequestContext,
    leadId: string,
    input: CreateActivityInput,
  ) {
    await this.getById(ctx, leadId);

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        orgId: ctx.orgId,
        performedBy: ctx.user.id,
        activityType: input.activityType,
        title: input.title,
        notes: input.notes,
        outcome: input.outcome,
        nextAction: input.nextAction,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        completedAt: input.completedAt ? new Date(input.completedAt) : null,
        durationMins: input.durationMins,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        performer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update lead nextFollowUp if nextAction provided
    if (input.dueAt) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { nextFollowUp: new Date(input.dueAt) },
      });
    }

    await emitEvent({
      name: "lead/activity.created",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        leadId,
        leadName: (await LeadRepository.findById(ctx.orgId, leadId))?.name ?? "",
        activityId: activity.id,
        activityType: activity.activityType,
      },
    });

    return activity;
  }

  static async listActivities(ctx: RequestContext, leadId: string, page = 1, limit = 20) {
    await this.getById(ctx, leadId);

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.leadActivity.findMany({
        where: { leadId, orgId: ctx.orgId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          performer: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      }),
      prisma.leadActivity.count({ where: { leadId, orgId: ctx.orgId } }),
    ]);

    return { data, total };
  }

  static async getPipelineCounts(ctx: RequestContext) {
    return LeadRepository.getStatusCounts(ctx.orgId);
  }
}
