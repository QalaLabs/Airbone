import { crmFetch, crmFetchJson } from "./client";
import { Deal } from "./types";

export async function getDeals(filters?: Record<string, string>): Promise<Deal[]> {
  return crmFetch<Deal[]>("all_endpoints.get_deals", filters);
}

export async function getDeal(id: string): Promise<Deal> {
  return crmFetch<Deal>("all_endpoints.get_deal", { name: id });
}

export async function createDeal(data: Partial<Deal>): Promise<Deal> {
  return crmFetchJson<Deal>("all_endpoints.create_deal", data as Record<string, unknown>);
}

export async function updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
  return crmFetchJson<Deal>("all_endpoints.update_deal", {
    name: id,
    ...data,
  } as Record<string, unknown>);
}

export async function updateDealStage(id: string, stage: string): Promise<Deal> {
  return crmFetchJson<Deal>("all_endpoints.update_deal_stage", { name: id, deal_stage: stage });
}
