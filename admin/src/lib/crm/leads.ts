import { crmFetch, crmFetchJson } from "./client";
import { Lead } from "./types";

export async function getLeads(filters?: Record<string, string>): Promise<Lead[]> {
  return crmFetch<Lead[]>("all_endpoints.get_leads", filters);
}

export async function getLead(id: string): Promise<Lead> {
  return crmFetch<Lead>("all_endpoints.get_lead", { name: id });
}

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  return crmFetchJson<Lead>("all_endpoints.create_lead", data as Record<string, unknown>);
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  return crmFetchJson<Lead>("all_endpoints.update_lead", {
    name: id,
    ...data,
  } as Record<string, unknown>);
}

export async function deleteLead(id: string): Promise<void> {
  return crmFetchJson<void>("all_endpoints.delete_lead", { name: id });
}

export async function assignLeadOwner(id: string, ownerId: string): Promise<Lead> {
  return crmFetchJson<Lead>("all_endpoints.assign_lead", { name: id, owner: ownerId });
}
