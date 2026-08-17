import { inngest } from "@/lib/events/inngest";
import { NotificationService } from "@/lib/services/notification.service";
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

    // Durable audit/activity is owned synchronously by AdmissionService.create.

    await step.run("notify-admission-team", async () => {
      // Notify counselor assigned to the lead
      const lead = await prisma.lead.findUnique({
        where: { id: d.leadId },
        select: { assignedTo: true, name: true },
      });
      if (!lead?.assignedTo) return;

      const counselor = await prisma.user.findUnique({
        where: { id: lead.assignedTo },
        select: { email: true, name: true },
      });
      if (!counselor?.email) return;

      await NotificationService.dispatch({
        orgId: d.orgId,
        event: "ADMISSION_STAGE_CHANGED",
        channel: "EMAIL",
        recipient: counselor.email,
        variables: {
          counselorName: counselor.name,
          leadName: lead.name,
          applicationNo: d.applicationNo,
        },
        entityType: "admission",
        entityId: d.admissionId,
      });
    });

    return { ok: true };
  },
);

// ─── admission/stage.changed ──────────────────────────────────────────────────

export const onAdmissionStageChanged = inngest.createFunction(
  { id: "admission-stage-changed", name: "On admission stage changed" },
  { event: "admission/stage.changed" },
  async () => {
    // Durable audit/activity AND enrollment lead-conversion are owned synchronously
    // by AdmissionService.changeStage (audit "admission.stage_changed", activity
    // "stage_changed", and the lead -> CONVERTED + student ACTIVE updates).
    // No remaining async responsibilities; handler retained to preserve the event contract.
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

    // Durable audit/activity is owned synchronously by PaymentService.create
    // (audit "payment.recorded" + activity "recorded_payment").

    await step.run("send-payment-receipt", async () => {
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

      await NotificationService.dispatch({
        orgId: d.orgId,
        event: "PAYMENT_RECEIVED",
        channel: "EMAIL",
        recipient: recipientEmail,
        variables: {
          amount: d.amount,
          method: d.method,
          receiptNo: d.receiptNo ?? "",
        },
        entityType: "payment",
        entityId: d.paymentId,
      });
    });

    return { ok: true };
  },
);

// ─── document/uploaded ────────────────────────────────────────────────────────

export const onDocumentUploaded = inngest.createFunction(
  { id: "document-uploaded", name: "On document uploaded" },
  { event: "document/uploaded" },
  async () => {
    // Durable audit/activity is owned synchronously by DocumentService.upload
    // (audit "document.uploaded" + activity "uploaded"). No async responsibilities.
    return { ok: true };
  },
);

// ─── document/reviewed ────────────────────────────────────────────────────────

export const onDocumentReviewed = inngest.createFunction(
  { id: "document-reviewed", name: "On document reviewed" },
  { event: "document/reviewed" },
  async () => {
    // Durable audit/activity is owned synchronously by DocumentService.review
    // (audit "document.approved/rejected" + activity "approved/rejected").
    // No async responsibilities.
    return { ok: true };
  },
);
