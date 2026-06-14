import { inngest } from "@/lib/events/inngest";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { ResourceService } from "@/lib/services/resource.service";

type Base = { orgId: string; actorId: string; actorName: string; requestId: string };

// ─── resource/published ───────────────────────────────────────────────────────

export const onResourcePublished = inngest.createFunction(
  { id: "resource-published", name: "On resource published" },
  { event: "resource/published" },
  async ({ event, step }) => {
    const d = event.data as Base & { resourceId: string; slug: string; title: string; type: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "resource.published",
        entityType: "resource",
        entityId: d.resourceId,
        newValue: { slug: d.slug, title: d.title, type: d.type },
      });
    });

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "published",
        objectType: "resource",
        objectId: d.resourceId,
        objectSnapshot: { title: d.title, type: d.type },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── resource/status.changed ──────────────────────────────────────────────────

export const onResourceStatusChanged = inngest.createFunction(
  { id: "resource-status-changed", name: "On resource status changed" },
  { event: "resource/status.changed" },
  async ({ event, step }) => {
    const d = event.data as Base & { resourceId: string; slug: string; fromStatus: string; toStatus: string };

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "status_changed",
        objectType: "resource",
        objectId: d.resourceId,
        objectSnapshot: { slug: d.slug, status: d.toStatus },
        context: { from: d.fromStatus, to: d.toStatus, actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── job/published ────────────────────────────────────────────────────────────

export const onJobPublished = inngest.createFunction(
  { id: "job-published", name: "On job published" },
  { event: "job/published" },
  async ({ event, step }) => {
    const d = event.data as Base & { jobId: string; slug: string; title: string; hiringPartnerId?: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "job.published",
        entityType: "job",
        entityId: d.jobId,
        newValue: { slug: d.slug, title: d.title },
      });
    });

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "published",
        objectType: "job",
        objectId: d.jobId,
        objectSnapshot: { title: d.title, slug: d.slug },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── job/status.changed ───────────────────────────────────────────────────────

export const onJobStatusChanged = inngest.createFunction(
  { id: "job-status-changed", name: "On job status changed" },
  { event: "job/status.changed" },
  async ({ event, step }) => {
    const d = event.data as Base & { jobId: string; slug: string; fromStatus: string; toStatus: string };

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "status_changed",
        objectType: "job",
        objectId: d.jobId,
        objectSnapshot: { slug: d.slug, status: d.toStatus },
        context: { from: d.fromStatus, to: d.toStatus, actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── job_application/submitted ────────────────────────────────────────────────

export const onJobApplicationSubmitted = inngest.createFunction(
  { id: "job-application-submitted", name: "On job application submitted" },
  { event: "job_application/submitted" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      applicationId: string;
      jobId: string;
      jobTitle: string;
      applicantName: string;
      applicantEmail: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "job_application.submitted",
        entityType: "job_application",
        entityId: d.applicationId,
        newValue: { jobId: d.jobId, applicantEmail: d.applicantEmail },
      });
    });

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "submitted",
        objectType: "job_application",
        objectId: d.applicationId,
        objectSnapshot: { applicantName: d.applicantName, jobTitle: d.jobTitle },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── job_application/status.changed ──────────────────────────────────────────

export const onJobApplicationStatusChanged = inngest.createFunction(
  { id: "job-application-status-changed", name: "On job application status changed" },
  { event: "job_application/status.changed" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      applicationId: string;
      jobId: string;
      fromStatus: string;
      toStatus: string;
      applicantEmail: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "job_application.status_changed",
        entityType: "job_application",
        entityId: d.applicationId,
        oldValue: { status: d.fromStatus },
        newValue: { status: d.toStatus },
      });
    });

    return { ok: true };
  },
);

// ─── placement/created ────────────────────────────────────────────────────────

export const onPlacementCreated = inngest.createFunction(
  { id: "placement-created", name: "On placement created" },
  { event: "placement/created" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      placementId: string;
      studentId: string;
      jobTitle: string;
      hiringPartnerId?: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "placement.created",
        entityType: "placement",
        entityId: d.placementId,
        newValue: { studentId: d.studentId, jobTitle: d.jobTitle },
      });
    });

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "created",
        objectType: "placement",
        objectId: d.placementId,
        objectSnapshot: { jobTitle: d.jobTitle, studentId: d.studentId },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── placement/updated ────────────────────────────────────────────────────────

export const onPlacementUpdated = inngest.createFunction(
  { id: "placement-updated", name: "On placement updated" },
  { event: "placement/updated" },
  async ({ event, step }) => {
    const d = event.data as Base & { placementId: string; studentId: string; status: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "placement.status_changed",
        entityType: "placement",
        entityId: d.placementId,
        newValue: { status: d.status },
      });
    });

    return { ok: true };
  },
);

// ─── testimonial/submitted ────────────────────────────────────────────────────

export const onTestimonialSubmitted = inngest.createFunction(
  { id: "testimonial-submitted", name: "On testimonial submitted" },
  { event: "testimonial/submitted" },
  async ({ event, step }) => {
    const d = event.data as Base & { testimonialId: string; authorName: string; courseId?: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "testimonial.submitted",
        entityType: "testimonial",
        entityId: d.testimonialId,
        newValue: { authorName: d.authorName, courseId: d.courseId },
      });
    });

    return { ok: true };
  },
);

// ─── testimonial/reviewed ─────────────────────────────────────────────────────

export const onTestimonialReviewed = inngest.createFunction(
  { id: "testimonial-reviewed", name: "On testimonial reviewed" },
  { event: "testimonial/reviewed" },
  async ({ event, step }) => {
    const d = event.data as Base & { testimonialId: string; status: string; reviewedBy: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: `testimonial.${d.status.toLowerCase()}`,
        entityType: "testimonial",
        entityId: d.testimonialId,
        newValue: { status: d.status, reviewedBy: d.reviewedBy },
      });
    });

    await step.run("write-activity", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: d.status === "APPROVED" ? "approved" : "rejected",
        objectType: "testimonial",
        objectId: d.testimonialId,
        objectSnapshot: { status: d.status },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── Scheduled resource publisher ─────────────────────────────────────────────

export const onBusinessScheduledCheck = inngest.createFunction(
  { id: "business-scheduled-check", name: "Business scheduled content publisher" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    const resourcesPublished = await step.run("publish-scheduled-resources", async () => {
      return ResourceService.publishScheduledResources();
    });
    return { resourcesPublished };
  },
);
