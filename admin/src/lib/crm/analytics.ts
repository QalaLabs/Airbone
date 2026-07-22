import { crmFetch } from "./client";

export async function getSalesAnalytics(): Promise<unknown> {
  return crmFetch<unknown>("all_endpoints.get_sales_analytics");
}

export async function getConversionRate(): Promise<unknown> {
  return crmFetch<unknown>("all_endpoints.get_conversion_rate");
}
