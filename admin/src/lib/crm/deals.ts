import { apiFetch } from "@/lib/api";
import type { DealData } from "./types";

export async function getDealsData(): Promise<DealData> {
  return apiFetch<DealData>("/crm/deals");
}
