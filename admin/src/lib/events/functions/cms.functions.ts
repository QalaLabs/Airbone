import { inngest } from "@/lib/events/inngest";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { PageService } from "@/lib/services/page.service";
import { CourseService } from "@/lib/services/course.service";

type Base = { orgId: string; actorId: string; actorName: string; requestId: string };

// ─── media/uploaded ───────────────────────────────────────────────────────────

export const onMediaUploaded = inngest.createFunction(
  { id: "media-uploaded", name: "On media uploaded" },
  { event: "media/uploaded" },
  async ({ event, step }) => {
    const d = event.data as Base & { assetId: string; name: string; mimeType: string; folderId?: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "media.uploaded",
        entityType: "media_asset",
        entityId: d.assetId,
        newValue: { name: d.name, mimeType: d.mimeType, folderId: d.folderId },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "uploaded",
        objectType: "media_asset",
        objectId: d.assetId,
        objectSnapshot: { name: d.name, mimeType: d.mimeType },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── media/replaced ───────────────────────────────────────────────────────────

export const onMediaReplaced = inngest.createFunction(
  { id: "media-replaced", name: "On media replaced" },
  { event: "media/replaced" },
  async ({ event, step }) => {
    const d = event.data as Base & { assetId: string; oldFileKey: string; newFileKey: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "media.replaced",
        entityType: "media_asset",
        entityId: d.assetId,
        oldValue: { fileKey: d.oldFileKey },
        newValue: { fileKey: d.newFileKey },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "replaced",
        objectType: "media_asset",
        objectId: d.assetId,
        objectSnapshot: { newFileKey: d.newFileKey },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── media/deleted ────────────────────────────────────────────────────────────

export const onMediaDeleted = inngest.createFunction(
  { id: "media-deleted", name: "On media deleted" },
  { event: "media/deleted" },
  async ({ event, step }) => {
    const d = event.data as Base & { assetId: string; name: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "media.deleted",
        entityType: "media_asset",
        entityId: d.assetId,
        oldValue: { name: d.name },
      });
    });

    return { ok: true };
  },
);

// ─── page/published ───────────────────────────────────────────────────────────

export const onPagePublished = inngest.createFunction(
  { id: "page-published", name: "On page published" },
  { event: "page/published" },
  async ({ event, step }) => {
    const d = event.data as Base & { pageId: string; slug: string; version: number; versionId: string };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "page.published",
        entityType: "page",
        entityId: d.pageId,
        newValue: { slug: d.slug, version: d.version, versionId: d.versionId },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "published",
        objectType: "page",
        objectId: d.pageId,
        objectSnapshot: { slug: d.slug, version: d.version },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── page/status.changed ──────────────────────────────────────────────────────

export const onPageStatusChanged = inngest.createFunction(
  { id: "page-status-changed", name: "On page status changed" },
  { event: "page/status.changed" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      pageId: string;
      slug: string;
      fromStatus: string;
      toStatus: string;
      version: number;
      scheduledAt?: string;
    };

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "status_changed",
        objectType: "page",
        objectId: d.pageId,
        objectSnapshot: { slug: d.slug, status: d.toStatus },
        context: { from: d.fromStatus, to: d.toStatus, actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── course/published ─────────────────────────────────────────────────────────

export const onCoursePublished = inngest.createFunction(
  { id: "course-published", name: "On course published" },
  { event: "course/published" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      courseId: string;
      slug: string;
      title: string;
      version: number;
      versionId: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "course.published",
        entityType: "course",
        entityId: d.courseId,
        newValue: { slug: d.slug, version: d.version, versionId: d.versionId },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "published",
        objectType: "course",
        objectId: d.courseId,
        objectSnapshot: { title: d.title, slug: d.slug, version: d.version },
        context: { actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── course/status.changed ────────────────────────────────────────────────────

export const onCourseStatusChanged = inngest.createFunction(
  { id: "course-status-changed", name: "On course status changed" },
  { event: "course/status.changed" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      courseId: string;
      slug: string;
      title: string;
      fromStatus: string;
      toStatus: string;
      scheduledAt?: string;
    };

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "status_changed",
        objectType: "course",
        objectId: d.courseId,
        objectSnapshot: { title: d.title, slug: d.slug, status: d.toStatus },
        context: { from: d.fromStatus, to: d.toStatus, actorName: d.actorName },
      });
    });

    return { ok: true };
  },
);

// ─── content/version.created ──────────────────────────────────────────────────

export const onContentVersionCreated = inngest.createFunction(
  { id: "content-version-created", name: "On content version created" },
  { event: "content/version.created" },
  async ({ event, step }) => {
    const d = event.data as Base & {
      entityType: "page" | "course";
      entityId: string;
      version: number;
      versionId: string;
      notes?: string;
    };

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "content.version_created",
        entityType: d.entityType,
        entityId: d.entityId,
        newValue: { version: d.version, versionId: d.versionId, notes: d.notes },
      });
    });

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
