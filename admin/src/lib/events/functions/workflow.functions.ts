import { inngest } from "@/lib/events/inngest";
import { TRIGGERABLE_INNGEST_EVENTS, WORKFLOW_RUN_EVENT } from "@/lib/events/catalog";
import { matchAndStartRuns } from "@/lib/workflow/engine";
import { executeRun } from "@/lib/workflow/runner";

// ─── Workflow engine — event fan-out ─────────────────────────────────────────
//
// Subscribes to every triggerable business event. For each one it finds active
// workflows whose trigger matches, evaluates trigger conditions against a fresh
// entity snapshot, and creates exactly one deduped WorkflowRun per matching
// workflow, then hands each run to the executor below.
//
// The matcher is a single memoized step: on retry it either replays the stored
// result or re-runs atomically — dedup happens at the DB unique index, so
// duplicate deliveries can never double-start a workflow.

export const onEventMatchWorkflows = inngest.createFunction(
  { id: "workflow-match-event", name: "Workflow engine — match event" },
  TRIGGERABLE_INNGEST_EVENTS.map((eventName) => ({ event: eventName })),
  async ({ event, step }) => {
    const d = event.data as {
      orgId: string;
      actorId?: string;
      actorName?: string;
      requestId?: string;
      [key: string]: unknown;
    };

    const result = await step.run("match-and-start", async () =>
      matchAndStartRuns({
        orgId: d.orgId,
        rawEventName: event.name,
        actorId: d.actorId,
        actorName: d.actorName,
        requestId: d.requestId,
        data: event.data as Record<string, unknown>,
      }),
    );

    return result;
  },
);

// ─── Workflow engine — run executor ──────────────────────────────────────────
//
// Durable, resumable execution of a single WorkflowRun. All durability lives
// inside executeRun (step memoization + persisted cursor + chunked waits), so
// this handler must NOT wrap it in another step.run — nested steps are illegal
// in Inngest.
//
// Business failures (entity gone, invalid config) are recorded on the run and
// returned normally; only infrastructure errors throw and consume retries.

export const onWorkflowRunRequested = inngest.createFunction(
  { id: "workflow-run-executor", name: "Workflow engine — execute run", retries: 5 },
  { event: WORKFLOW_RUN_EVENT },
  async ({ event, step }) => {
    const { runId } = event.data as { runId: string };
    return executeRun(runId, step);
  },
);
