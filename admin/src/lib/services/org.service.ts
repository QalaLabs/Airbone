import { OrgRepository, CampusRepository } from "@/lib/repositories/org.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import { prisma } from "@/lib/db/client";
import type { CreateOrgInput, UpdateOrgInput, CreateCampusInput, UpdateCampusInput } from "@/lib/validations/org.schema";
import type { RequestContext } from "@/types";

export class OrgService {
  static async getById(ctx: RequestContext) {
    const org = await OrgRepository.findById(ctx.orgId);
    if (!org) throw new NotFoundError("Organization", ctx.orgId);
    return org;
  }

  static async update(ctx: RequestContext, input: UpdateOrgInput) {
    const existing = await this.getById(ctx);
    const updated = await OrgRepository.update(ctx.orgId, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "org.updated",
      entityType: "organization",
      entityId: ctx.orgId,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  // Only SUPER_ADMIN — creates a new tenant org
  static async create(input: CreateOrgInput & { createdBy: string }) {
    const existing = await OrgRepository.findBySlug(input.slug);
    if (existing) throw new ConflictError(`Organization slug "${input.slug}" is already taken`);

    return OrgRepository.create(input);
  }

  static async listAll() {
    return OrgRepository.listAll();
  }
}

export class CampusService {
  static async list(ctx: RequestContext, includeInactive = false) {
    return CampusRepository.findMany(ctx.orgId, includeInactive);
  }

  static async getById(ctx: RequestContext, id: string) {
    const campus = await CampusRepository.findById(ctx.orgId, id);
    if (!campus) throw new NotFoundError("Campus", id);
    return campus;
  }

  static async create(ctx: RequestContext, input: CreateCampusInput) {
    const existing = await CampusRepository.findByCode(ctx.orgId, input.code);
    if (existing) throw new ConflictError(`Campus code "${input.code}" already exists in this organization`);

    // Validate headCounselor belongs to same org
    if (input.headCounselorId) {
      const counselor = await prisma.user.findFirst({
        where: { id: input.headCounselorId, orgId: ctx.orgId, isActive: true },
      });
      if (!counselor) throw new NotFoundError("Counselor", input.headCounselorId);
    }

    const campus = await CampusRepository.create(ctx.orgId, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "campus.created",
      entityType: "campus",
      entityId: campus.id,
      newValue: { name: campus.name, code: campus.code },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "campus",
      objectId: campus.id,
      objectSnapshot: { name: campus.name, code: campus.code },
      context: { actorName: ctx.user.name },
    });

    return campus;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateCampusInput) {
    const existing = await this.getById(ctx, id);

    // If code is changing, check uniqueness
    if (input.code && input.code.toUpperCase() !== existing.code) {
      const conflict = await CampusRepository.findByCode(ctx.orgId, input.code);
      if (conflict) throw new ConflictError(`Campus code "${input.code}" already exists`);
    }

    const updated = await CampusRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "campus.updated",
      entityType: "campus",
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  static async delete(ctx: RequestContext, id: string) {
    await this.getById(ctx, id);

    // Prevent deletion if campus has active users
    const userCount = await prisma.user.count({
      where: { campusId: id, orgId: ctx.orgId, deletedAt: null },
    });
    if (userCount > 0) {
      throw new ConflictError(`Cannot delete campus with ${userCount} active users. Reassign users first.`);
    }

    await CampusRepository.delete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "campus.deleted",
      entityType: "campus",
      entityId: id,
    });

    return { ok: true };
  }
}
