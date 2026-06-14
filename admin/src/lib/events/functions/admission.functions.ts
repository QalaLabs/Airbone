import { inngest } from "@/lib/events/inngest";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { prisma } from "@/lib/db/client";

// Shared event data shape (all BaseEvent fields are flattened into event.data by emitEvent())
type Base = { orgId: string; actorId: string; actorName: string; requestId: string };

// ─── admission/created ────────────────────────────────────────────────────────

export const onAdmissionCreated = inngest.createFunction(
  { id: "admission-created", name: "On admission created" },
  { event: "admission/created" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      admissionId: string;
      applicationNo: string;
      leadId: string;
      leadName: string;
      campusId?: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "admission.created",
        entityType: "admission",
        entityId: d.admissionId,
        newValue: { applicationNo: d.applicationNo, leadId: d.leadId },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "created",
        objectType: "admission",
        objectId: d.admissionId,
        objectSnapshot: { applicationNo: d.applicationNo, leadName: d.leadName },
        context: { actorName: d.actorName },
      });
    });

    await step.run("notify-admission-team", async () => {
      const template = await prisma.notificationTemplate.findFirst({
        where: { orgId: d.orgId, event: "ADMISSION_STAGE_CHANGED", channel: "EMAIL", isActive: true },
      });
      if (!template) return;

      // Notify counselor assigned to the lead
      const lead = await prisma.lead.findUnique({
        where: { id: d.leadId },
        select: { assignedTo: true, name: true },
      });
      if (!lead?.assignedTo) return;

      const counselor = await prisma.user.findUnique({
        where: { id: lead.assignedTo },
        select: { email: true },
      });
      if (!counselor) return;

      await prisma.notificationLog.create({
        data: {
          orgId: d.orgId,
          templateId: template.id,
          event: "ADMISSION_STAGE_CHANGED",
          channel: "EMAIL",
          recipient: counselor.email,
          status: "PENDING",
          entityType: "admission",
          entityId: d.admissionId,
        },
      });
    });

    return { ok: true };
  },
);

// ─── admission/stage.changed ──────────────────────────────────────────────────

export const onAdmissionStageChanged = inngest.createFunction(
  { id: "admission-stage-changed", name: "On admission stage changed" },
  { event: "admission/stage.changed" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      admissionId: string;
      applicationNo: string;
      fromStage: string;
      toStage: string;
      studentId?: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "admission.stage_changed",
        entityType: "admission",
        entityId: d.admissionId,
        oldValue: { stage: d.fromStage },
        newValue: { stage: d.toStage },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "stage_changed",
        objectType: "admission",
        objectId: d.admissionId,
        objectSnapshot: { applicationNo: d.applicationNo },
        context: { from: d.fromStage, to: d.toStage, actorName: d.actorName },
      });
    });

    // When enrolled: update lead status to CONVERTED
    await step.run("handle-enrollment", async () => {
      if (d.toStage !== "ENROLLED") return;

      const admission = await prisma.admission.findUnique({
        where: { id: d.admissionId },
        select: { leadId: true },
      });
      if (!admission) return;

      await prisma.lead.updateMany({
        where: { id: admission.leadId, orgId: d.orgId },
        data: { status: "CONVERTED", convertedAt: new Date(), score: 100 },
      });
    });

    return { ok: true };
  },
);

// ─── payment/received ─────────────────────────────────────────────────────────

export const onPaymentReceived = inngest.createFunction(
  { id: "payment-received", name: "On payment received" },
  { event: "payment/received" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      paymentId: string;
      admissionId: string;
      studentId?: string;
      amount: string;
      method: string;
      receiptNo?: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "payment.received",
        entityType: "payment",
        entityId: d.paymentId,
        newValue: { amount: d.amount, method: d.method, receiptNo: d.receiptNo },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "payment_received",
        objectType: "payment",
        objectId: d.paymentId,
        objectSnapshot: { amount: d.amount, method: d.method, receiptNo: d.receiptNo },
        targetType: "admission",
        targetId: d.admissionId,
        context: { actorName: d.actorName },
      });
    });

    await step.run("send-payment-receipt", async () => {
      const template = await prisma.notificationTemplate.findFirst({
        where: { orgId: d.orgId, event: "PAYMENT_RECEIVED", channel: "EMAIL", isActive: true },
      });
      if (!template) return;

      // Find student or lead contact
      let recipientEmail: string | null = null;
      if (d.studentId) {
        const student = await prisma.student.findUnique({
          where: { id: d.studentId },
          select: { email: true },
        });
        recipientEmail = student?.email ?? null;
      }
      if (!recipientEmail) {
        const admission = await prisma.admission.findUnique({
          where: { id: d.admissionId },
          select: { lead: { select: { email: true } } },
        });
        recipientEmail = admission?.lead?.email ?? null;
      }
      if (!recipientEmail) return;

      await prisma.notificationLog.create({
        data: {
          orgId: d.orgId,
          templateId: template.id,
          event: "PAYMENT_RECEIVED",
          channel: "EMAIL",
          recipient: recipientEmail,
          status: "PENDING",
          entityType: "payment",
          entityId: d.paymentId,
        },
      });
    });

    return { ok: true };
  },
);

// ─── document/uploaded ────────────────────────────────────────────────────────

export const onDocumentUploaded = inngest.createFunction(
  { id: "document-uploaded", name: "On document uploaded" },
  { event: "document/uploaded" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      documentId: string;
      admissionId?: string;
      studentId?: string;
      documentType: string;
      name: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "document.uploaded",
        entityType: "document",
        entityId: d.documentId,
        newValue: { name: d.name, documentType: d.documentType, admissionId: d.admissionId },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "uploaded",
        objectType: "document",
        objectId: d.documentId,
        objectSnapshot: { name: d.name, documentType: d.documentType },
        targetType: d.admissionId ? "admission" : d.studentId ? "student" : undefined,
        targetId: d.admissionId ?? d.studentId,
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── document/reviewed ────────────────────────────────────────────────────────

export const onDocumentReviewed = inngest.createFunction(
  { id: "document-reviewed", name: "On document reviewed" },
  { event: "document/reviewed" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      documentId: string;
      admissionId?: string;
      studentId?: string;
      status: string;
      reviewedBy: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: `document.${d.status.toLowerCase()}`,
        entityType: "document",
        entityId: d.documentId,
        newValue: { status: d.status, reviewedBy: d.reviewedBy },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: d.status === "APPROVED" ? "approved" : "rejected",
        objectType: "document",
        objectId: d.documentId,
        objectSnapshot: { status: d.status },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);
