import { apiFetch } from "@/lib/api";
import type { AnalyticsData } from "./types";

export async function getAnalytics(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>("/crm/analytics");
}
