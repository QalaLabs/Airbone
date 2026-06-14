import { inngest } from "@/lib/events/inngest";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { prisma } from "@/lib/db/client";

// ─── lead/created ─────────────────────────────────────────────────────────

export const onLeadCreated = inngest.createFunction(
  { id: "lead-created", name: "On lead created" },
  { event: "lead/created" },
  async ({ event, step }) => {
    const { orgId, actorId, actorName, requestId, ipAddress, leadId, leadName, source, courseInterest } = event.data as {
      orgId: string; actorId: string; actorName: string; requestId: string;
      ipAddress?: string; leadId: string; leadName: string; source: string; courseInterest?: string;
    };

    // Write audit log
    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId,
        userId: actorId,
        requestId,
        ipAddress,
        action: "lead.created",
        entityType: "lead",
        entityId: leadId,
        newValue: { leadName, source, courseInterest },
      });
    });

    // Write activity feed
    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId,
        actorId,
        verb: "created",
        objectType: "lead",
        objectId: leadId,
        objectSnapshot: { name: leadName, source, courseInterest },
        context: { actorName },
      });
    });

    // Recalculate lead score
    await step.run("recalculate-score", async () => {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { email: true, city: true, courseInterest: true, source: true, utmCampaign: true },
      });
      if (!lead) return;

      let score = 0;
      if (lead.email) score += 20;
      if (lead.city) score += 10;
      if (lead.courseInterest) score += 30;
      if (["GOOGLE_ADS", "FACEBOOK_ADS", "BROCHURE_DOWNLOAD", "COURSE_PAGE"].includes(lead.source)) score += 25;
      if (lead.utmCampaign) score += 15;
      score = Math.min(score, 100);

      await prisma.lead.update({ where: { id: leadId }, data: { score } });
      await prisma.leadScoreHistory.create({
        data: { leadId, orgId, score, reason: "Initial score on creation" },
      });
    });

    // Send welcome notification to lead (WhatsApp)
    await step.run("notify-lead-whatsapp", async () => {
      const [template, lead] = await Promise.all([
        prisma.notificationTemplate.findUnique({
          where: { orgId_event_channel: { orgId, event: "NEW_LEAD", channel: "WHATSAPP" } },
        }),
        prisma.lead.findUnique({ where: { id: leadId }, select: { phone: true } }),
      ]);
      if (!template?.isActive || !lead?.phone) return;

      await prisma.notificationLog.create({
        data: {
          orgId,
          templateId: template.id,
          event: "NEW_LEAD",
          channel: "WHATSAPP",
          recipient: lead.phone,
          status: "PENDING",
          entityType: "lead",
          entityId: leadId,
        },
      });
      // Actual dispatch via WATI happens in notification worker (Sprint 5)
    });

    return { ok: true, leadId };
  },
);

// ─── lead/status.changed ─────────────────────────────────────────────────

export const onLeadStatusChanged = inngest.createFunction(
  { id: "lead-status-changed", name: "On lead status changed" },
  { event: "lead/status.changed" },
  async ({ event, step }) => {
    const d = event.data as {
      orgId: string; actorId: string; actorName: string; requestId: string;
      ipAddress?: string; leadId: string; leadName: string;
      oldStatus: string; newStatus: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        ipAddress: d.ipAddress,
        action: "lead.status_changed",
        entityType: "lead",
        entityId: d.leadId,
        oldValue: { status: d.oldStatus },
        newValue: { status: d.newStatus },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "status_changed",
        objectType: "lead",
        objectId: d.leadId,
        objectSnapshot: { name: d.leadName },
        context: { from: d.oldStatus, to: d.newStatus, actorName: d.actorName },
      });
    });

    await step.run("recalculate-score", async () => {
      if (d.newStatus === "CONVERTED") {
        await prisma.lead.update({
          where: { id: d.leadId },
          data: { convertedAt: new Date(), score: 100 },
        });
      }
    });

    return { ok: true };
  },
);

// ─── lead/assigned ───────────────────────────────────────────────────────

export const onLeadAssigned = inngest.createFunction(
  { id: "lead-assigned", name: "On lead assigned" },
  { event: "lead/assigned" },
  async ({ event, step }) => {
    const d = event.data as {
      orgId: string; actorId: string; actorName: string; requestId: string;
      ipAddress?: string; leadId: string; leadName: string;
      counselorId: string; counselorName: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "lead.assigned",
        entityType: "lead",
        entityId: d.leadId,
        newValue: { counselorId: d.counselorId, counselorName: d.counselorName },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "assigned",
        objectType: "lead",
        objectId: d.leadId,
        objectSnapshot: { name: d.leadName },
        context: { counselorId: d.counselorId, counselorName: d.counselorName },
      });
    });

    await step.run("notify-counselor", async () => {
      const template = await prisma.notificationTemplate.findUnique({
        where: { orgId_event_channel: { orgId: d.orgId, event: "LEAD_ASSIGNED", channel: "EMAIL" } },
      });
      if (!template?.isActive) return;

      const counselor = await prisma.user.findUnique({
        where: { id: d.counselorId },
        select: { email: true },
      });
      if (!counselor) return;

      await prisma.notificationLog.create({
        data: {
          orgId: d.orgId,
          templateId: template.id,
          event: "LEAD_ASSIGNED",
          channel: "EMAIL",
          recipient: counselor.email,
          status: "PENDING",
          entityType: "lead",
          entityId: d.leadId,
        },
      });
    });

    return { ok: true };
  },
);

// ─── lead/activity.created ───────────────────────────────────────────────

export const onLeadActivityCreated = inngest.createFunction(
  { id: "lead-activity-created", name: "On lead activity created" },
  { event: "lead/activity.created" },
  async ({ event, step }) => {
    const d = event.data as {
      orgId: string; actorId: string; actorName: string; requestId: string;
      leadId: string; leadName: string; activityId: string; activityType: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "lead_activity.created",
        entityType: "lead_activity",
        entityId: d.activityId,
        newValue: { leadId: d.leadId, type: d.activityType },
      });
    });

    await step.run("update-lead-last-activity", async () => {
      await prisma.lead.update({
        where: { id: d.leadId },
        data: { lastActivityAt: new Date() },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "logged_activity",
        objectType: "lead",
        objectId: d.leadId,
        objectSnapshot: { name: d.leadName },
        context: { activityType: d.activityType, actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);
