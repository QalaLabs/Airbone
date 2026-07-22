import { crmFetch } from "./client";

export async function getLeadPipeline(): Promise<unknown> {
  return crmFetch<unknown>("sales.get_lead_pipeline");
}

export async function getConversionRate(): Promise<unknown> {
  return crmFetch<unknown>("sales.get_conversion_rate");
}

export async function getRevenueSummary(): Promise<unknown> {
  return crmFetch<unknown>("sales.get_revenue_summary");
}

export async function getSalesDashboard(): Promise<unknown> {
  return crmFetch<unknown>("all_endpoints.get_sales_dashboard");
}
