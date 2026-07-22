import { crmFetch, crmFetchJson } from "./client";
import { OutreachSequence } from "./types";

export async function getOutreachSequences(filters?: Record<string, string>): Promise<OutreachSequence[]> {
  return crmFetch<OutreachSequence[]>("all_endpoints.get_outreach_sequences", filters);
}

export async function getOutreachSequence(id: string): Promise<OutreachSequence> {
  return crmFetch<OutreachSequence>("all_endpoints.get_outreach_sequence", { name: id });
}

export async function createOutreachSequence(data: Partial<OutreachSequence>): Promise<OutreachSequence> {
  return crmFetchJson<OutreachSequence>("all_endpoints.create_outreach_sequence", data as Record<string, unknown>);
}

export async function pauseOutreachSequence(id: string): Promise<OutreachSequence> {
  return crmFetchJson<OutreachSequence>("all_endpoints.pause_outreach_sequence", { name: id });
}

export async function resumeOutreachSequence(id: string): Promise<OutreachSequence> {
  return crmFetchJson<OutreachSequence>("all_endpoints.resume_outreach_sequence", { name: id });
}

export async function deleteOutreachSequence(id: string): Promise<void> {
  return crmFetchJson<void>("all_endpoints.delete_outreach_sequence", { name: id });
}
