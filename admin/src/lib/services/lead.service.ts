import { LeadRepository } from "@/lib/repositories/lead.repository";
import { emitEvent } from "@/lib/events/inngest";
import { emitLeadCreated } from "@/lib/automation/emit-lead-created";
import { prisma } from "@/lib/db/client";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import type { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";
import type { CreateLeadInput, UpdateLeadInput, LeadFilters, CreateActivityInput } from "@/lib/validations/lead.schema";
import type { RequestContext } from "@/types";
import type { LeadStatus, LeadSource } from "@prisma/client";
import { isLostStatus } from "@/lib/leads/lead-status";

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
    await this.syncPendingFallbackLeads(ctx.orgId);
  }

  /**
   * Cron/Inngest-safe recovery entry point. Resolves the org by slug directly
   * (no user session), so it can run as a scheduled Inngest function.
   * Idempotent: concurrent runs converge on the same recovered rows and can
   * never create duplicate leads (unique(orgId, phone) + P2002 handling).
   */
  static async syncFallbackLeadsCron(): Promise<{
    synced: number;
    duplicates: number;
    failed: number;
  }> {
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });
    if (!org) return { synced: 0, duplicates: 0, failed: 0 };
    return this.syncPendingFallbackLeads(org.id);
  }

  private static async syncPendingFallbackLeads(orgId: string) {
    const pending = await prisma.fallbackLead.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });

    const result = { synced: 0, duplicates: 0, failed: 0 };
    if (pending.length === 0) return result;

    console.log(
      JSON.stringify({
        event: "lead_fallback_sync_started",
        pending: pending.length,
        timestamp: new Date().toISOString(),
      }),
    );

    for (const fLead of pending) {
      try {
        const phone = fLead.phone.trim();
        const existing = await prisma.lead.findFirst({
          where: { orgId, phone },
        });

        if (existing) {
          await this.markFallbackRecovered(fLead.id);

          await prisma.leadActivity.create({
            data: {
              leadId: existing.id,
              orgId,
              activityType: "NOTE",
              title: "Duplicate fallback enquiry",
              notes: `Enquiry from fallback store recovered. Originally submitted at ${fLead.createdAt.toISOString()}`,
              completedAt: new Date(),
            },
          });

          result.duplicates++;
        } else {
          const sourceEnum = this.resolveSource(fLead.source || "");
          const lead = await prisma.lead.create({
            data: {
              orgId,
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
              orgId,
              activityType: "NOTE",
              title: "Web form submission (Recovered)",
              notes: `Enquiry recovered from Supabase fallback leads. Originally submitted at ${fLead.createdAt.toLocaleString("en-IN")}`,
              completedAt: new Date(),
            },
          });

          // Durable audit/activity for the successful conversion — exactly once,
          // owned by the sync recovery path. Null actor (system recovery action).
          await AuditService.write({
            orgId,
            action: "lead.created",
            entityType: "lead",
            entityId: lead.id,
            newValue: { name: lead.name, phone, source: sourceEnum, recoveredFromFallback: true },
          });

          await ActivityFeedService.write({
            orgId,
            verb: "created",
            objectType: "lead",
            objectId: lead.id,
            objectSnapshot: { name: lead.name, source: sourceEnum },
            context: { actorName: "Public form (recovered)", recoveredFromFallback: true },
          });

          await this.markFallbackRecovered(fLead.id);
          await emitLeadCreated({
            orgId,
            leadId: lead.id,
            leadName: lead.name,
            source: sourceEnum,
            courseInterest: lead.courseInterest,
            actorName: "Public form (recovered)",
          });
          result.synced++;
        }
      } catch (err) {
        const isP2002 =
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: string }).code === "P2002";

        if (isP2002) {
          // A concurrent run created this lead first — converge on recovery.
          const raced = await prisma.lead.findFirst({
            where: { orgId, phone: fLead.phone.trim() },
            select: { id: true },
          });
          if (raced) {
            await this.markFallbackRecovered(fLead.id);
            await prisma.leadActivity
              .create({
                data: {
                  leadId: raced.id,
                  orgId,
                  activityType: "NOTE",
                  title: "Duplicate fallback enquiry",
                  notes: `Enquiry from fallback store recovered. Originally submitted at ${fLead.createdAt.toISOString()}`,
                  completedAt: new Date(),
                },
              })
              .catch(() => undefined);
            result.duplicates++;
            continue;
          }
        }

        result.failed++;
        // Keep the record pending so a later run retries it; bump retry_count
        // so stuck rows are visible in the fallback_leads table.
        await prisma.fallbackLead
          .update({
            where: { id: fLead.id },
            data: { retryCount: { increment: 1 } },
          })
          .catch(() => undefined);
        console.error(
          JSON.stringify({
            event: "lead_fallback_sync_failed",
            fallbackLeadId: fLead.id,
            reason: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString(),
          }),
        );
      }
    }

    console.log(
      JSON.stringify({
        event: "lead_fallback_sync_succeeded",
        synced: result.synced,
        duplicates: result.duplicates,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      }),
    );
    return result;
  }

  private static async markFallbackRecovered(id: string) {
    await prisma.fallbackLead.update({
      where: { id },
      data: { status: "recovered" },
    });
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

    // Durable audit/activity owned by the sync path (Inngest-independent)
    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "lead.created",
      entityType: "lead",
      entityId: lead.id,
      newValue: { name: lead.name, source: lead.source, phone: lead.phone },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "lead",
      objectId: lead.id,
      objectSnapshot: { name: lead.name, source: lead.source },
      context: { actorName: ctx.user.name },
    });

    // Emit event — notification/automation only (durable audit is sync above)
    await emitLeadCreated({
      orgId: ctx.orgId,
      leadId: lead.id,
      leadName: lead.name,
      source: lead.source,
      courseInterest: lead.courseInterest,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      ipAddress: ctx.ipAddress,
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

      // Durable audit/activity owned by the sync status path (Inngest-independent)
      await AuditService.write({
        orgId: ctx.orgId,
        userId: ctx.user.id,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
        action: "lead.status_changed",
        entityType: "lead",
        entityId: id,
        oldValue: { status: existing.status },
        newValue: { status: input.status as LeadStatus },
      });

      await ActivityFeedService.write({
        orgId: ctx.orgId,
        actorId: ctx.user.id,
        verb: "status_changed",
        objectType: "lead",
        objectId: id,
        objectSnapshot: { name: updated.name },
        context: { from: existing.status, to: input.status as LeadStatus, actorName: ctx.user.name },
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

    // Durable audit/activity owned by the sync assignment path (Inngest-independent)
    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "lead.assigned",
      entityType: "lead",
      entityId: id,
      newValue: { counselorId, counselorName: counselor.name },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "assigned",
      objectType: "lead",
      objectId: id,
      objectSnapshot: { name: lead.name },
      context: { counselorId, counselorName: counselor.name, actorName: ctx.user.name },
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

    // Durable audit/activity owned by the sync activity path (Inngest-independent)
    const leadName = (await LeadRepository.findById(ctx.orgId, leadId))?.name ?? "";

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "lead_activity.created",
      entityType: "lead_activity",
      entityId: activity.id,
      newValue: { leadId, type: activity.activityType },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "logged_activity",
      objectType: "lead",
      objectId: leadId,
      objectSnapshot: { name: leadName },
      context: { activityType: activity.activityType, actorName: ctx.user.name },
    });

    await emitEvent({
      name: "lead/activity.created",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        leadId,
        leadName,
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

    // Durable audit/activity owned by the sync scheduling path (Inngest-independent)
    const leadName = (await LeadRepository.findById(ctx.orgId, leadId))?.name ?? "";

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "lead_activity.created",
      entityType: "lead_activity",
      entityId: activity.id,
      newValue: { leadId, type: "MEETING" },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "logged_activity",
      objectType: "lead",
      objectId: leadId,
      objectSnapshot: { name: leadName },
      context: { activityType: "MEETING", actorName: ctx.user.name },
    });

    await emitEvent({
      name: "lead/activity.created",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        leadId,
        leadName,
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
      CONNECTED: 15,
      CALL_BACK: 20,
      PROSPECT: 45,
      WON: 90,
      NOT_CONNECTED: 0,
      RINGING: 0,
      NOT_REACHABLE: 0,
      SWITCHED_OFF: 0,
      VOICEMAIL: 0,
      INCOMING_BARD: 0,
      OUT_OF_SERVICE: 0,
      NOT_AWARE: 0,
      NOT_CONTACTABLE: 0,
      LOCATION_OUT_OF_SCOPE: 0,
      LANGUAGE_BARRIER: 0,
      PRICE_HIGH: 0,
      JOINED_OTHERS: 0,
      NOT_ELIGIBLE: 0,
      INVALID_NUMBER: 0,
      TEST_LEAD: 0,
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
    if (isLostStatus(lead.status)) {
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
