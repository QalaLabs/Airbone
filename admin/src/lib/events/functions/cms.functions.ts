import { inngest } from "@/lib/events/inngest";
import { PageService } from "@/lib/services/page.service";
import { CourseService } from "@/lib/services/course.service";

// ─── media/uploaded ───────────────────────────────────────────────────────────

export const onMediaUploaded = inngest.createFunction(
  { id: "media-uploaded", name: "On media uploaded" },
  { event: "media/uploaded" },
  async () => {
    // Durable audit/activity is owned synchronously by MediaService.upload/register.
    // This handler is retained to preserve the event contract; no side effects here.
    return { ok: true };
  },
);

// ─── media/replaced ───────────────────────────────────────────────────────────

export const onMediaReplaced = inngest.createFunction(
  { id: "media-replaced", name: "On media replaced" },
  { event: "media/replaced" },
  async () => {
    // Durable audit/activity is owned synchronously by MediaService.replace
    // (audit "media.replaced" + activity "replaced"). No async responsibilities.
    return { ok: true };
  },
);

// ─── media/deleted ────────────────────────────────────────────────────────────

export const onMediaDeleted = inngest.createFunction(
  { id: "media-deleted", name: "On media deleted" },
  { event: "media/deleted" },
  async () => {
    // Durable audit/activity is owned synchronously by MediaService.delete
    // (audit "media.deleted" + activity "deleted"). No async responsibilities.
    return { ok: true };
  },
);

// ─── page/published ───────────────────────────────────────────────────────────

export const onPagePublished = inngest.createFunction(
  { id: "page-published", name: "On page published" },
  { event: "page/published" },
  async () => {
    // Durable audit/activity is owned synchronously by PageService.publish and
    // PageService.publishScheduledPages (audit "page.published" + activity
    // "published", null actor for scheduled). No async responsibilities.
    return { ok: true };
  },
);

// ─── page/status.changed ──────────────────────────────────────────────────────

export const onPageStatusChanged = inngest.createFunction(
  { id: "page-status-changed", name: "On page status changed" },
  { event: "page/status.changed" },
  async () => {
    // Durable activity is owned synchronously by PageService.publish
    // (verb "published"/status-lowercase, or null-actor for scheduled).
    // The handler's "status_changed" row duplicated that write. No async responsibilities.
    return { ok: true };
  },
);

// ─── course/published ─────────────────────────────────────────────────────────

export const onCoursePublished = inngest.createFunction(
  { id: "course-published", name: "On course published" },
  { event: "course/published" },
  async () => {
    // Durable audit/activity is owned synchronously by CourseService.publish,
    // CourseService.publishScheduledCourses, and CourseService.create (created
    // as PUBLISHED). No async responsibilities.
    return { ok: true };
  },
);

// ─── course/status.changed ────────────────────────────────────────────────────

export const onCourseStatusChanged = inngest.createFunction(
  { id: "course-status-changed", name: "On course status changed" },
  { event: "course/status.changed" },
  async () => {
    // Durable activity is owned synchronously by CourseService.publish
    // (verb "published"/status-lowercase, or null-actor for scheduled).
    // The handler's "status_changed" row duplicated that write. No async responsibilities.
    return { ok: true };
  },
);

// ─── content/version.created ──────────────────────────────────────────────────

export const onContentVersionCreated = inngest.createFunction(
  { id: "content-version-created", name: "On content version created" },
  { event: "content/version.created" },
  async () => {
    // The user-visible durable audit is owned synchronously by the rollback
    // services (PageService.rollback → "page.rolled_back" and
    // CourseService.rollback → "course.rolled_back"). This event is emitted for
    // contract/automation purposes only; the handler adds no durable side effects.
    return { ok: true };
  },
);

// ─── cms/scheduled.check (cron every 5 min) ───────────────────────────────────

export const onCmsScheduledCheck = inngest.createFunction(
  { id: "cms-scheduled-check", name: "CMS scheduled content publisher" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    const pagesPublished = await step.run("publish-scheduled-pages", async () => {
      return PageService.publishScheduledPages();
    });

    const coursesPublished = await step.run("publish-scheduled-courses", async () => {
      return CourseService.publishScheduledCourses();
    });

    return { pagesPublished, coursesPublished };
  },
);
