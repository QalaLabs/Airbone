import { LeadRepository } from "@/lib/repositories/lead.repository";
import { emitEvent } from "@/lib/events/inngest";
import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";
import type { CreateLeadInput, UpdateLeadInput, LeadFilters, CreateActivityInput } from "@/lib/validations/lead.schema";
import type { RequestContext } from "@/types";
import type { LeadStatus, LeadSource } from "@prisma/client";

export class LeadService {
  static resolveSource(raw: string = ""): LeadSource {
    const key = raw.toLowerCase();
    let slug = "homepage_cta";
    if (key.startsWith("resource gate")) {
      slug = "brochure_download";
    } else if (key.startsWith("course")) {
      slug = "course_page";
    } else {
      const mapping: Record<string, string> = {
        "homepage modal": "homepage_cta",
        "homepage final cta": "homepage_cta",
        "contact form": "contact_form",
        "contact page": "contact_form",
        "flagship featured banner": "course_page",
      };
      slug = mapping[key] ?? "homepage_cta";
    }
    const SOURCE_MAP: Record<string, LeadSource> = {
      homepage_cta: "HOMEPAGE_CTA",
      contact_form: "CONTACT_FORM",
      brochure_download: "BROCHURE_DOWNLOAD",
      course_page: "COURSE_PAGE",
    };
    return SOURCE_MAP[slug] ?? "HOMEPAGE_CTA";
  }

  static async syncFallbackLeads(ctx: RequestContext) {
    const targetSlug = process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation";
    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { slug: true },
    });
    if (!org || org.slug !== targetSlug) return;

    const pending = await prisma.fallbackLead.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });

    if (pending.length === 0) return;

    for (const fLead of pending) {
      try {
        const phone = fLead.phone.trim();
        const existing = await prisma.lead.findFirst({
          where: { orgId: ctx.orgId, phone },
        });

        if (existing) {
          await prisma.fallbackLead.update({
            where: { id: fLead.id },
            data: { status: "recovered" },
          });

          await prisma.leadActivity.create({
            data: {
              leadId: existing.id,
              orgId: ctx.orgId,
              activityType: "NOTE",
              title: "Duplicate fallback enquiry",
              notes: `Enquiry from fallback store recovered. Originally submitted at ${fLead.createdAt.toISOString()}`,
              completedAt: new Date(),
            },
          });
        } else {
          const sourceEnum = this.resolveSource(fLead.source || "");
          const lead = await prisma.lead.create({
            data: {
              orgId: ctx.orgId,
              createdBy: null,
              name: fLead.name,
              email: fLead.email || null,
              phone,
              courseInterest: fLead.course || null,
              source: sourceEnum,
              createdAt: fLead.createdAt,
              customFields: { fallbackLeadId: fLead.id },
            },
          });

          await prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              orgId: ctx.orgId,
              activityType: "NOTE",
              title: "Web form submission (Recovered)",
              notes: `Enquiry recovered from Supabase fallback leads. Originally submitted at ${fLead.createdAt.toLocaleString("en-IN")}`,
              completedAt: new Date(),
            },
          });

          await prisma.fallbackLead.update({
            where: { id: fLead.id },
            data: { status: "recovered" },
          });
        }
      } catch (err) {
        console.error(`[Lead Sync] Failed to sync fallback lead ID ${fLead.id}:`, err);
      }
    }
  }

  static async list(ctx: RequestContext, filters: LeadFilters) {
    try {
      await this.syncFallbackLeads(ctx);
    } catch (err) {
      console.error("[Lead Sync Error] Failed to sync fallback leads:", err);
    }
    return LeadRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const lead = await LeadRepository.findById(ctx.orgId, id);
    if (!lead) throw new NotFoundError("Lead", id);
    return lead;
  }

  static async create(ctx: RequestContext, input: CreateLeadInput) {
    const { notes, ...data } = input;

    // Race-safe dedup: unique(orgId, phone) means a lead with this phone already
    // exists in the org — surface a clean 409 instead of a 500.
    let lead: Awaited<ReturnType<typeof LeadRepository.create>>;
    try {
      lead = await LeadRepository.create(ctx.orgId, ctx.user.id, data);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        throw new ConflictError("A lead with this phone already exists in this organization");
      }
      throw err;
    }

    // Persist intake notes as a timeline activity so they are never silently dropped
    if (notes) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          orgId: ctx.orgId,
          performedBy: ctx.user.id,
          activityType: "NOTE",
          title: "Intake note",
          notes,
          completedAt: new Date(),
        },
      });
      await prisma.lead.update({
        where: { id: lead.id },
        data: { lastActivityAt: new Date() },
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
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          orgId: ctx.orgId,
          performedBy: ctx.user.id,
          activityType: "STATUS_CHANGE",
          title: `Status → ${input.status}`,
          notes: input.lostReason ?? `Changed from ${existing.status} to ${input.status}`,
          completedAt: new Date(),
          metadata: { oldStatus: existing.status, newStatus: input.status },
        },
      });

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

      await this.recalculateScore(ctx, id, `status:${input.status}`);
      return LeadRepository.findById(ctx.orgId, id);
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

    await prisma.leadActivity.create({
      data: {
        leadId: id,
        orgId: ctx.orgId,
        performedBy: ctx.user.id,
        activityType: "ASSIGNMENT",
        title: `Assigned to ${counselor.name}`,
        notes: `Counselor ${counselor.name} assigned`,
        completedAt: new Date(),
        metadata: { counselorId },
      },
    });

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

    await this.recalculateScore(ctx, id, "assigned");

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
        completedAt: input.completedAt
          ? new Date(input.completedAt)
          : input.activityType === "NOTE" || input.activityType === "CALL" || input.activityType === "EMAIL" || input.activityType === "WHATSAPP" || input.activityType === "SMS" || input.activityType === "MEETING"
            ? new Date()
            : null,
        durationMins: input.durationMins,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        performer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update lead touch + optional follow-up
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        lastActivityAt: new Date(),
        ...(input.dueAt ? { nextFollowUp: new Date(input.dueAt) } : {}),
      },
    });

    await this.recalculateScore(ctx, leadId, `activity:${input.activityType}`);

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

  static async completeActivity(
    ctx: RequestContext,
    leadId: string,
    activityId: string,
    input: { completedAt?: string; outcome?: string } = {},
  ) {
    await this.getById(ctx, leadId);
    const existing = await prisma.leadActivity.findFirst({
      where: { id: activityId, leadId, orgId: ctx.orgId },
    });
    if (!existing) throw new NotFoundError("LeadActivity", activityId);

    const activity = await prisma.leadActivity.update({
      where: { id: activityId },
      data: {
        completedAt: input.completedAt ? new Date(input.completedAt) : new Date(),
        ...(input.outcome !== undefined ? { outcome: input.outcome } : {}),
      },
      include: {
        performer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { lastActivityAt: new Date() },
    });

    return activity;
  }

  static async updateFollowUp(ctx: RequestContext, leadId: string, nextFollowUp: string | null) {
    await this.getById(ctx, leadId);
    return prisma.lead.update({
      where: { id: leadId },
      data: { nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null },
      select: { id: true, nextFollowUp: true },
    });
  }

  /** Schedule a future MEETING activity (dueAt set, not yet completed). */
  static async scheduleMeeting(
    ctx: RequestContext,
    leadId: string,
    input: {
      title?: string;
      dueAt: string;
      durationMins?: number;
      notes?: string;
      outcome?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await this.getById(ctx, leadId);

    const dueAt = new Date(input.dueAt);
    if (Number.isNaN(dueAt.getTime())) {
      const { ValidationError } = await import("@/lib/utils/errors");
      throw new ValidationError([{ message: "dueAt must be a valid datetime" }]);
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        orgId: ctx.orgId,
        performedBy: ctx.user.id,
        activityType: "MEETING",
        title: input.title ?? "Meeting scheduled",
        notes: input.notes,
        outcome: input.outcome,
        dueAt,
        completedAt: null,
        durationMins: input.durationMins,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        performer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { lastActivityAt: new Date(), nextFollowUp: dueAt },
    });

    await this.recalculateScore(ctx, leadId, "activity:MEETING");

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
        activityType: "MEETING",
      },
    });

    return activity;
  }

  /** Simple deterministic score: base + status + activity counts. Caps at 100. */
  static async recalculateScore(ctx: RequestContext, leadId: string, reason?: string) {
    const lead = await this.getById(ctx, leadId);
    const counts = await prisma.leadActivity.groupBy({
      by: ["activityType"],
      where: { leadId, orgId: ctx.orgId },
      _count: { _all: true },
    });

    const byType = Object.fromEntries(counts.map((c) => [c.activityType, c._count._all]));
    let score = 10;
    const statusBoost: Record<string, number> = {
      NEW: 0,
      CONTACTED: 10,
      INTERESTED: 20,
      FOLLOW_UP: 15,
      COUNSELED: 30,
      APPLICATION_SUBMITTED: 40,
      CONVERTED: 90,
      LOST: 0,
    };
    score += statusBoost[lead.status] ?? 0;
    score += Math.min(15, (byType.CALL ?? 0) * 5);
    score += Math.min(10, (byType.EMAIL ?? 0) * 3);
    score += Math.min(10, (byType.WHATSAPP ?? 0) * 3);
    score += Math.min(10, (byType.MEETING ?? 0) * 5);
    score += Math.min(5, (byType.NOTE ?? 0) * 1);
    if (lead.assignedTo) score += 5;
    if (lead.email) score += 5;
    if (lead.courseInterest) score += 5;
    score = Math.max(0, Math.min(100, score));

    if (score === lead.score) return lead;

    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { score },
      }),
      prisma.leadScoreHistory.create({
        data: {
          leadId,
          orgId: ctx.orgId,
          score,
          reason: reason ?? "recalculate",
        },
      }),
    ]);

    return LeadRepository.findById(ctx.orgId, leadId);
  }

  static async convertToAdmission(
    ctx: RequestContext,
    leadId: string,
    input: {
      courseName?: string;
      counselorId?: string;
      campusId?: string;
      feeAmount?: number;
      notes?: string;
    } = {},
  ) {
    const lead = await this.getById(ctx, leadId);
    const { AdmissionService } = await import("@/lib/services/admission.service");
    const { ValidationError } = await import("@/lib/utils/errors");
    if (lead.status === "LOST") {
      throw new ValidationError([{ message: "Cannot convert a lost lead" }]);
    }

    const existingAdmission = await prisma.admission.findFirst({
      where: { leadId, orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
    });
    if (existingAdmission && existingAdmission.stage !== "CANCELLED" && existingAdmission.stage !== "DROPPED") {
      return { admission: existingAdmission, created: false };
    }

    const admission = await AdmissionService.create(ctx, {
      leadId,
      courseName: input.courseName ?? lead.courseInterest ?? undefined,
      counselorId: input.counselorId ?? lead.assignedTo ?? undefined,
      campusId: input.campusId ?? lead.campusId ?? undefined,
      feeAmount: input.feeAmount,
      feeDiscount: 0,
      notes: input.notes,
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "APPLICATION_SUBMITTED",
        lastActivityAt: new Date(),
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId,
        orgId: ctx.orgId,
        performedBy: ctx.user.id,
        activityType: "STATUS_CHANGE",
        title: "Converted to admission",
        notes: `Application ${admission.applicationNo} created`,
        completedAt: new Date(),
        metadata: { admissionId: admission.id },
      },
    });

    await this.recalculateScore(ctx, leadId, "converted_to_admission");

    return { admission, created: true };
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
