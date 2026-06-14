import { Inngest } from "inngest";
import type { AppEvent } from "@/types";

export const inngest = new Inngest({
  id: "airborne-os",
  name: "Airborne Aviation OS",
  eventKey: process.env.INNGEST_EVENT_KEY ?? "local",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// Type-safe event sender
export async function emitEvent(event: AppEvent): Promise<void> {
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
