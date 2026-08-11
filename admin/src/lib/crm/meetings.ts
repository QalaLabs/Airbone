import { apiFetch } from "@/lib/api";
import type { Meeting, MeetingsData } from "./types";

export async function getMeetings(scope: "upcoming" | "past" | "all" = "upcoming"): Promise<MeetingsData> {
  return apiFetch<MeetingsData>(`/crm/meetings?scope=${scope}`);
}

export interface ScheduleMeetingInput {
  leadId: string;
  title?: string;
  dueAt: string;
  durationMins?: number;
  notes?: string;
  outcome?: string;
  metadata?: Record<string, unknown>;
}

export async function scheduleMeeting(input: ScheduleMeetingInput): Promise<Meeting> {
  return apiFetch<Meeting>("/crm/meetings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
