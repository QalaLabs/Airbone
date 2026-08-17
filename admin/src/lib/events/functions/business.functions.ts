import { inngest } from "@/lib/events/inngest";
import { ResourceService } from "@/lib/services/resource.service";

// ─── resource/published ───────────────────────────────────────────────────────

export const onResourcePublished = inngest.createFunction(
  { id: "resource-published", name: "On resource published" },
  { event: "resource/published" },
  async () => {
    // Durable audit/activity is owned synchronously by ResourceService.publish
    // and ResourceService.publishScheduledResources (audit "resource.published"
    // + activity "published", null actor for scheduled). No async responsibilities.
    return { ok: true };
  },
);

// ─── resource/status.changed ──────────────────────────────────────────────────

export const onResourceStatusChanged = inngest.createFunction(
  { id: "resource-status-changed", name: "On resource status changed" },
  { event: "resource/status.changed" },
  async () => {
    // Durable activity is owned synchronously by ResourceService.publish
    // (verb "published"/status-lowercase, or null-actor for scheduled).
    // The handler's "status_changed" row duplicated that write. No async responsibilities.
    return { ok: true };
  },
);

// ─── job/published ────────────────────────────────────────────────────────────

export const onJobPublished = inngest.createFunction(
  { id: "job-published", name: "On job published" },
  { event: "job/published" },
  async () => {
    // Durable audit/activity is owned synchronously by JobService.publish
    // (audit "job.published" + activity "published"). No async responsibilities.
    return { ok: true };
  },
);

// ─── job/status.changed ───────────────────────────────────────────────────────

export const onJobStatusChanged = inngest.createFunction(
  { id: "job-status-changed", name: "On job status changed" },
  { event: "job/status.changed" },
  async () => {
    // Durable activity is owned synchronously by JobService.publish
    // (verb "published"/status-lowercase). The handler's "status_changed" row
    // duplicated that write. No async responsibilities.
    return { ok: true };
  },
);

// ─── job_application/submitted ────────────────────────────────────────────────

export const onJobApplicationSubmitted = inngest.createFunction(
  { id: "job-application-submitted", name: "On job application submitted" },
  { event: "job_application/submitted" },
  async () => {
    // Durable audit/activity is owned synchronously by
    // JobApplicationService.submit (audit "job_application.submitted"
    // + activity "submitted"). No async responsibilities.
    return { ok: true };
  },
);

// ─── job_application/status.changed ──────────────────────────────────────────

export const onJobApplicationStatusChanged = inngest.createFunction(
  { id: "job-application-status-changed", name: "On job application status changed" },
  { event: "job_application/status.changed" },
  async () => {
    // Durable audit/activity is owned synchronously by
    // JobApplicationService.updateStatus (audit "job_application.status_changed"
    // + activity "reviewed"). No async responsibilities.
    return { ok: true };
  },
);

// ─── placement/created ────────────────────────────────────────────────────────

export const onPlacementCreated = inngest.createFunction(
  { id: "placement-created", name: "On placement created" },
  { event: "placement/created" },
  async () => {
    // Durable audit/activity is owned synchronously by PlacementService.create
    // (audit "placement.created" + activity "created"). No async responsibilities.
    return { ok: true };
  },
);

// ─── placement/updated ────────────────────────────────────────────────────────

export const onPlacementUpdated = inngest.createFunction(
  { id: "placement-updated", name: "On placement updated" },
  { event: "placement/updated" },
  async () => {
    // Durable audit is owned synchronously by PlacementService.update
    // (audit "placement.updated" + activity "updated"). The handler's
    // "placement.status_changed" record was a duplicate of the same status change.
    // No async responsibilities.
    return { ok: true };
  },
);

// ─── testimonial/submitted ────────────────────────────────────────────────────

export const onTestimonialSubmitted = inngest.createFunction(
  { id: "testimonial-submitted", name: "On testimonial submitted" },
  { event: "testimonial/submitted" },
  async () => {
    // Durable audit is owned synchronously by TestimonialService.create
    // (audit "testimonial.submitted"). No async responsibilities.
    return { ok: true };
  },
);

// ─── testimonial/reviewed ─────────────────────────────────────────────────────

export const onTestimonialReviewed = inngest.createFunction(
  { id: "testimonial-reviewed", name: "On testimonial reviewed" },
  { event: "testimonial/reviewed" },
  async () => {
    // Durable audit/activity is owned synchronously by TestimonialService.review
    // (audit "testimonial.<status>" + activity "approved"/"rejected").
    // No async responsibilities.
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
