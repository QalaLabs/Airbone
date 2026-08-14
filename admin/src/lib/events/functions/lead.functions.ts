import { inngest } from "@/lib/events/inngest";
import { NotificationService } from "@/lib/services/notification.service";
import { prisma } from "@/lib/db/client";

// ─── lead/created ─────────────────────────────────────────────────────────

export const onLeadCreated = inngest.createFunction(
  { id: "lead-created", name: "On lead created" },
  { event: "lead/created" },
  async ({ event, step }) => {
    const { orgId, leadId, leadName } = event.data as {
      orgId: string; actorId: string; actorName: string; requestId: string;
      ipAddress?: string; leadId: string; leadName: string; source: string; courseInterest?: string;
    };

    // Durable audit/activity is owned synchronously by the lead creation paths
    // (public route / LeadService.create / fallback recovery). This handler only
    // owns async automation: score calculation + notifications.

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
      const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { phone: true } });
      if (!lead?.phone) return;

      await NotificationService.dispatch({
        orgId,
        event: "NEW_LEAD",
        channel: "WHATSAPP",
        recipient: lead.phone,
        variables: { leadName },
        entityType: "lead",
        entityId: leadId,
      });
    });

    return { ok: true, leadId };
  },
);

// ─── lead/status.changed ─────────────────────────────────────────────────

export const onLeadStatusChanged = inngest.createFunction(
  { id: "lead-status-changed", name: "On lead status changed" },
  { event: "lead/status.changed" },
  async () => {
    // Durable audit/activity AND score/conversion behavior are owned
    // synchronously by LeadService.update (audit "lead.status_changed" +
    // activity "status_changed" + recalculateScore). The handler previously
    // duplicated those writes and raced the sync score path. No async
    // responsibilities remain.
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

    // Durable audit/activity is owned synchronously by LeadService.assign
    // (audit "lead.assigned" + activity "assigned"). This handler only owns the
    // asynchronous counselor notification.

    await step.run("notify-counselor", async () => {
      const [counselor, lead] = await Promise.all([
        prisma.user.findUnique({
          where: { id: d.counselorId },
          select: { email: true, name: true },
        }),
        prisma.lead.findUnique({
          where: { id: d.leadId },
          select: { phone: true, courseInterest: true },
        }),
      ]);
      if (!counselor?.email) return;

      await NotificationService.dispatch({
        orgId: d.orgId,
        event: "LEAD_ASSIGNED",
        channel: "EMAIL",
        recipient: counselor.email,
        variables: {
          counselorName: counselor.name,
          leadName: d.leadName,
          leadPhone: lead?.phone ?? "",
          courseInterest: lead?.courseInterest ?? "",
        },
        entityType: "lead",
        entityId: d.leadId,
      });
    });

    return { ok: true };
  },
);

// ─── lead/activity.created ───────────────────────────────────────────────

export const onLeadActivityCreated = inngest.createFunction(
  { id: "lead-activity-created", name: "On lead activity created" },
  { event: "lead/activity.created" },
  async () => {
    // Durable audit/activity and the lastActivityAt touch are owned synchronously
    // by LeadService.createActivity / LeadService.scheduleMeeting (audit
    // "lead_activity.created" + activity "logged_activity"). The handler's
    // lastActivityAt update duplicated the sync write. No async responsibilities.
    return { ok: true };
  },
);
