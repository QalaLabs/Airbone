import { Inngest } from "inngest";
import type { AppEvent } from "@/types";

const eventKey = process.env.INNGEST_EVENT_KEY ?? "local";
const isInngestConfigured =
  Boolean(process.env.INNGEST_EVENT_KEY) &&
  process.env.INNGEST_EVENT_KEY !== "local";

export const inngest = new Inngest({
  id: "airborne-os",
  name: "Airborne Aviation OS",
  eventKey,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

/** True when a real Inngest event key is configured (not missing / "local"). */
export function isInngestEnabled(): boolean {
  return isInngestConfigured;
}

/**
 * Type-safe event sender. Never throws to callers — lead/request paths stay up
 * when Inngest is absent or misconfigured.
 */
export async function emitEvent(event: AppEvent): Promise<void> {
  if (!isInngestConfigured) {
    return;
  }

  try {
    await inngest.send({
      name: event.name,
      data: {
        ...event.data,
        orgId: event.orgId,
        actorId: event.actorId,
        actorName: event.actorName,
        requestId: event.requestId,
        ipAddress: event.ipAddress,
        timestamp: event.timestamp,
      },
    });
  } catch (err) {
    // Never crash caller — log and continue
    console.error("[Inngest] emitEvent failed", event.name, err);
  }
}
