import { crmFetch, crmFetchJson } from "./client";

export interface LeadSourceIntegration {
  name: string;
  integration_name: string;
  integration_type: string;
  status: string;
  last_sync?: string;
}

export interface FacebookPage {
  name: string;
  page_id: string;
  page_name?: string;
  last_synced?: string;
}

export interface LeadSourceIntegrationsResponse {
  integrations: LeadSourceIntegration[];
  facebook_pages: FacebookPage[];
}

export async function getLeadSourceIntegrations(): Promise<LeadSourceIntegrationsResponse> {
  return crmFetch<LeadSourceIntegrationsResponse>("all_endpoints.get_lead_source_integrations");
}

export async function resyncFacebookLeads(pageId: string): Promise<{ forms: number; synced: number }> {
  return crmFetchJson<{ forms: number; synced: number }>("all_endpoints.resync_facebook_leads", { page_id: pageId });
}

export interface FacebookOAuthPage {
  id: string;
  name?: string;
  access_token?: string;
}

export interface FacebookOAuthExchangeResult {
  meta_account: string;
  pages: FacebookOAuthPage[];
}

export async function facebookOAuthExchange(code: string, redirectUri: string): Promise<FacebookOAuthExchangeResult> {
  return crmFetchJson<FacebookOAuthExchangeResult>("all_endpoints.facebook_oauth_exchange", {
    code,
    redirect_uri: redirectUri,
  });
}

export async function connectFacebookPage(
  metaAccount: string,
  pageId: string,
  pageName: string | undefined,
  pageAccessToken: string | undefined
): Promise<{ name: string; page_id: string; page_name?: string }> {
  return crmFetchJson("all_endpoints.connect_facebook_page", {
    meta_account: metaAccount,
    page_id: pageId,
    page_name: pageName || "",
    page_access_token: pageAccessToken || "",
  });
}

/** Must match the redirect_uri used when starting the OAuth dialog in getFacebookOAuthUrl(). */
export function getFacebookRedirectUri(): string {
  return `${window.location.origin}/crm/integrations/facebook/callback`;
}

/**
 * Meta requires the app id + a whitelisted redirect URI to be configured in the
 * Facebook App dashboard before this URL will work. Both come from env vars —
 * nothing is hardcoded here.
 */
export function getFacebookOAuthUrl(): string | null {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  if (!appId) return null;
  const scope = "pages_show_list,pages_manage_ads,leads_retrieval,pages_manage_metadata";
  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(getFacebookRedirectUri())}&scope=${encodeURIComponent(scope)}&response_type=code`;
}

/**
 * Google Ads Lead Form Extensions are pulled via the Google Ads API (see
 * qala_omni.integrations.google_ads_bridge on the backend), which requires a
 * developer token + OAuth client configured via env vars. Not wired to a live
 * endpoint yet — surfaced here so the settings UI can show real status instead
 * of a fake "connected" state.
 */
export function isGoogleLeadFormsConfigured(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_CONFIGURED === "true";
}
