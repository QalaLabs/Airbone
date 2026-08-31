import { prisma } from "@/lib/db/client";
import type { TimelineQuery } from "@/lib/validations/timeline.schema";

// ─── Unified timeline ────────────────────────────────────────────────────────
//
// One chronological stream per entity, merging the three write paths that
// already exist in the system:
//   * activity    — LeadActivity rows (manual + automation-written)
//   * notification— NotificationLog rows (email/WhatsApp/SMS dispatches)
//   * automation  — WorkflowRun lifecycle for the entity
//
// No new tables: this is a read-model over existing data. Storage casing
// conventions differ per source (feed/notification use lowercase object types,
// WorkflowRun stores uppercase) and are mapped here.

export type TimelineKind = "activity" | "notification" | "automation";

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  at: string;
  title: string;
  detail?: string | null;
  status?: string | null;
  channel?: string | null;
  actorName?: string | null;
  workflowName?: string | null;
  /** activity entries only */
  activityType?: string | null;
}

// Feed/notification rows use lowercase singular object types.
const LOWERCASE_TYPE: Record<TimelineQuery["entityType"], string> = {
  LEAD: "lead",
  ADMISSION: "admission",
  PAYMENT: "payment",
  STUDENT: "student",
};

// Per-source fetch window. Merged + sliced for pagination; bounded so a very
// chatty entity cannot blow up the query.
function windowSize(query: TimelineQuery): number {
  return Math.min(query.page * query.limit, 300);
}

export class TimelineService {
  static async getTimeline(orgId: string, query: TimelineQuery): Promise<{
    items: TimelineEntry[];
    total: number;
  }> {
    const lower = LOWERCASE_TYPE[query.entityType];
    const take = windowSize(query);

    // LeadActivity rows are lead-scoped; other entity types have none.
    const activityWhere = query.entityType === "LEAD"
      ? { orgId, leadId: query.entityId }
      : { orgId, id: "00000000-0000-0000-0000-000000000000" };

    const [activities, notifications, runs, activityCount, notificationCount, runCount] =
      await Promise.all([
        prisma.leadActivity.findMany({
          where: activityWhere,
          orderBy: { createdAt: "desc" },
          take,
          select: {
            id: true,
            activityType: true,
            title: true,
            notes: true,
            outcome: true,
            dueAt: true,
            completedAt: true,
            createdAt: true,
            performer: { select: { name: true } },
          },        }),
        prisma.notificationLog.findMany({
          where: { orgId, entityType: lower, entityId: query.entityId },
          orderBy: { createdAt: "desc" },
          take,
          select: {
            id: true,
            event: true,
            channel: true,
            subject: true,
            body: true,
            status: true,
            errorMsg: true,
            recipient: true,
            createdAt: true,
          },
        }),
        prisma.workflowRun.findMany({
          where: { orgId, entityType: query.entityType, entityId: query.entityId },
          orderBy: { startedAt: "desc" },
          take,
          select: {
            id: true,
            status: true,
            error: true,
            stoppedReason: true,
            startedAt: true,
            workflow: { select: { name: true } },
            triggerer: { select: { name: true } },
          },
        }),
        prisma.leadActivity.count({ where: activityWhere }),
        prisma.notificationLog.count({ where: { orgId, entityType: lower, entityId: query.entityId } }),
        prisma.workflowRun.count({ where: { orgId, entityType: query.entityType, entityId: query.entityId } }),
      ]);

    const entries: TimelineEntry[] = [
      ...activities.map((a): TimelineEntry => ({
        id: `activity:${a.id}`,
        kind: "activity",
        at: a.createdAt.toISOString(),
        title: a.title ?? a.activityType.replace(/_/g, " "),
        detail: a.notes,
        status:
          a.activityType === "TASK" ? (a.completedAt ? "DONE" : "OPEN") : (a.outcome ?? null),
        actorName: a.performer?.name ?? null,
        activityType: a.activityType,
      })),
      ...notifications.map((n): TimelineEntry => ({
        id: `notification:${n.id}`,
        kind: "notification",
        at: n.createdAt.toISOString(),
        title: n.event ? n.event.replace(/_/g, " ") : `${n.channel} message`,
        detail: n.subject ?? n.body ?? null,
        status: n.errorMsg ? `${n.status}: ${n.errorMsg}` : n.status,
        channel: n.channel,
        actorName: null,
      })),
      ...runs.map((r): TimelineEntry => ({
        id: `automation:${r.id}`,
        kind: "automation",
        at: r.startedAt.toISOString(),
        title: r.workflow.name,
        detail: r.stoppedReason ?? r.error ?? null,
        status: r.status,
        actorName: r.triggerer?.name ?? null,
        workflowName: r.workflow.name,
      })),
    ];

    entries.sort((a, b) => (a.at < b.at ? 1 : -1));

    const start = (query.page - 1) * query.limit;
    return {
      items: entries.slice(start, start + query.limit),
      total: activityCount + notificationCount + runCount,
    };
  }
}
