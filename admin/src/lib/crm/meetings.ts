import { crmFetch, crmFetchJson } from "./client";
import { Meeting } from "./types";

export async function getMeetings(filters?: Record<string, string>): Promise<Meeting[]> {
  return crmFetch<Meeting[]>("all_endpoints.get_meetings", filters);
}

export async function getMeeting(id: string): Promise<Meeting> {
  return crmFetch<Meeting>("all_endpoints.get_meeting", { name: id });
}

export async function scheduleMeeting(data: Partial<Meeting>): Promise<Meeting> {
  return crmFetchJson<Meeting>("all_endpoints.schedule_meeting", data as Record<string, unknown>);
}

export async function updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
  return crmFetchJson<Meeting>("all_endpoints.update_meeting", {
    name: id,
    ...data,
  } as Record<string, unknown>);
}

export async function cancelMeeting(id: string): Promise<void> {
  return crmFetchJson<void>("all_endpoints.cancel_meeting", { name: id });
}
