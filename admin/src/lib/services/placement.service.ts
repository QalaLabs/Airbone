import { HiringPartnerRepository, PlacementRepository } from "@/lib/repositories/placement.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type {
  CreateHiringPartnerInput,
  UpdateHiringPartnerInput,
  HiringPartnerFilters,
  CreatePlacementInput,
  UpdatePlacementInput,
  PlacementFilters,
} from "@/lib/validations/placement.schema";
import type { RequestContext } from "@/types";
import { prisma } from "@/lib/db/client";

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s]+/g, "-");
}

async function ensureUniquePartnerSlug(orgId: string, base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  for (;;) {
    const existing = await prisma.hiringPartner.findFirst({ where: { orgId, slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${++n}`;
  }
}

// ─── Hiring Partner Service ───────────────────────────────────────────────────

export class HiringPartnerService {
  static async list(ctx: RequestContext, filters: HiringPartnerFilters) {
    return HiringPartnerRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const partner = await HiringPartnerRepository.findById(ctx.orgId, id);
    if (!partner) throw new NotFoundError("HiringPartner", id);
    return partner;
  }

  static async create(ctx: RequestContext, input: CreateHiringPartnerInput) {
    const baseSlug = input.slug ?? generateSlug(input.name);
    const slug = await ensureUniquePartnerSlug(ctx.orgId, baseSlug);

    const partner = await HiringPartnerRepository.create(ctx.orgId, ctx.user.id, input, slug);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "hiring_partner.created",
      entityType: "hiring_partner",
      entityId: partner.id,
      newValue: { name: partner.name, slug: partner.slug },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "hiring_partner",
      objectId: partner.id,
      objectSnapshot: { name: partner.name },
      context: { actorName: ctx.user.name },
    });

    return partner;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateHiringPartnerInput) {
    const existing = await this.getById(ctx, id);

    if (input.slug && input.slug !== existing.slug) {
      const conflict = await prisma.hiringPartner.findFirst({
        where: { orgId: ctx.orgId, slug: input.slug },
        select: { id: true },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictError(`Slug "${input.slug}" already in use.`);
      }
    }

    const updated = await HiringPartnerRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "hiring_partner.updated",
      entityType: "hiring_partner",
      entityId: id,
      oldValue: { name: existing.name },
      newValue: { name: input.name ?? existing.name },
    });

    return updated;
  }

  static async delete(ctx: RequestContext, id: string) {
    const existing = await this.getById(ctx, id);
    const hasJobs = await HiringPartnerRepository.hasActiveJobs(ctx.orgId, id);
    if (hasJobs) {
      throw new ConflictError("Cannot delete hiring partner with active or draft jobs. Close or archive jobs first.");
    }

    await HiringPartnerRepository.delete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "hiring_partner.deleted",
      entityType: "hiring_partner",
      entityId: id,
      oldValue: { name: existing.name },
    });
  }
}

// ─── Placement Service ────────────────────────────────────────────────────────

export class PlacementService {
  static async list(ctx: RequestContext, filters: PlacementFilters) {
    return PlacementRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const placement = await PlacementRepository.findById(ctx.orgId, id);
    if (!placement) throw new NotFoundError("Placement", id);
    return placement;
  }

  static async create(ctx: RequestContext, input: CreatePlacementInput) {
    const placement = await PlacementRepository.create(ctx.orgId, ctx.user.id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "placement.created",
      entityType: "placement",
      entityId: placement.id,
      newValue: {
        studentId: input.studentId,
        jobTitle: input.jobTitle,
        hiringPartnerId: input.hiringPartnerId,
      },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "placement",
      objectId: placement.id,
      objectSnapshot: { jobTitle: input.jobTitle, studentId: input.studentId },
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "placement/created",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        placementId: placement.id,
        studentId: input.studentId,
        jobTitle: input.jobTitle,
        hiringPartnerId: input.hiringPartnerId,
      },
    });

    return placement;
  }

  static async update(ctx: RequestContext, id: string, input: UpdatePlacementInput) {
    const existing = await this.getById(ctx, id);
    const updated = await PlacementRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "placement.updated",
      entityType: "placement",
      entityId: id,
      oldValue: { status: existing.status, jobTitle: existing.jobTitle },
      newValue: { status: input.status ?? existing.status, jobTitle: input.jobTitle ?? existing.jobTitle },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "updated",
      objectType: "placement",
      objectId: id,
      objectSnapshot: { jobTitle: updated.jobTitle, status: updated.status },
      context: { actorName: ctx.user.name },
    });

    if (input.status && input.status !== existing.status) {
      await emitEvent({
        name: "placement/updated",
        orgId: ctx.orgId,
        actorId: ctx.user.id,
        actorName: ctx.user.name,
        requestId: ctx.requestId,
        timestamp: new Date().toISOString(),
        data: { placementId: id, studentId: existing.studentId, status: input.status },
      });
    }

    return updated;
  }

  static async delete(ctx: RequestContext, id: string) {
    const existing = await this.getById(ctx, id);
    await PlacementRepository.delete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "placement.deleted",
      entityType: "placement",
      entityId: id,
      oldValue: { studentId: existing.studentId, jobTitle: existing.jobTitle },
    });
  }
}
