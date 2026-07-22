"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, RefreshCw, Webhook as WebhookIcon, FileSpreadsheet, Globe, UserPlus } from "lucide-react";
import {
  getLeadSourceIntegrations,
  resyncFacebookLeads,
  getFacebookOAuthUrl,
  isGoogleLeadFormsConfigured,
} from "@/lib/crm/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

function StatusBadge({ status }: { status: "connected" | "pending" | "not_configured" }) {
  const map = {
    connected: { label: "Connected", cls: "bg-emerald-500" },
    pending: { label: "Pending Sync", cls: "bg-amber-500" },
    not_configured: { label: "Not Configured", cls: "bg-gray-500" },
  } as const;
  const s = map[status];
  return <Badge className={`${s.cls} text-white border-none text-[10px]`}>{s.label}</Badge>;
}

export default function CRMIntegrationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["crm-lead-source-integrations"],
    queryFn: () => getLeadSourceIntegrations(),
  });

  const resyncMutation = useMutation({
    mutationFn: (pageId: string) => resyncFacebookLeads(pageId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["crm-lead-source-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast({ title: "Facebook resync complete", description: `${res.synced} lead(s) synced from ${res.forms} form(s).` });
    },
    onError: (e: unknown) =>
      toast({ title: "Resync failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const fbPages = data?.facebook_pages ?? [];
  const oauthUrl = typeof window !== "undefined" ? getFacebookOAuthUrl() : null;
  const googleConfigured = isGoogleLeadFormsConfigured();

  if (isLoading) return <div className="p-6 text-white text-xs">Loading integrations...</div>;
  if (error) return <div className="p-6 text-red-500 font-bold">Error: {error instanceof Error ? error.message : String(error)}</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Lead Source Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect and monitor every channel that feeds leads into the CRM.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Facebook Lead Ads */}
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              Facebook Lead Ads
            </CardTitle>
            <StatusBadge status={fbPages.length > 0 ? "connected" : "not_configured"} />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Real-time sync via Meta webhook (leadgen) + manual resync per page. Requires
              a connected Qala Meta Account and registered Qala Facebook Page.
            </p>
            {fbPages.length > 0 ? (
              <div className="space-y-2">
                {fbPages.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-lg border border-white/10 p-2.5">
                    <div>
                      <p className="text-xs font-semibold text-white">{p.page_name || p.page_id}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Last synced: {p.last_synced ? new Date(p.last_synced).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] border-white/10"
                      disabled={resyncMutation.isPending}
                      onClick={() => resyncMutation.mutate(p.page_id)}
                    >
                      <RefreshCw className="mr-1.5 h-3 w-3" />
                      Resync
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-400">No Facebook pages registered yet.</p>
            )}
            <Button
              size="sm"
              className="w-full text-xs h-8"
              disabled={!oauthUrl}
              onClick={() => oauthUrl && window.open(oauthUrl, "_blank", "noopener,noreferrer")}
            >
              {oauthUrl ? "Connect Facebook Page" : "Set NEXT_PUBLIC_FACEBOOK_APP_ID to enable"}
            </Button>
          </CardContent>
        </Card>

        {/* Google Lead Forms */}
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-500" />
              Google Ads Lead Forms
            </CardTitle>
            <StatusBadge status={googleConfigured ? "connected" : "not_configured"} />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Pulls Lead Form Extension submissions via Google Ads API, preserving GCLID
              and UTM parameters for campaign attribution.
            </p>
            <p className="text-xs text-amber-400">
              {googleConfigured
                ? "Configured via backend Qala Integration record."
                : "Requires Google Ads developer token + OAuth client on the backend (qala_omni.integrations.google_ads_bridge). Not wired to a live sync endpoint yet — backend work pending."}
            </p>
          </CardContent>
        </Card>

        {/* Website Forms */}
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              Website Forms
            </CardTitle>
            <StatusBadge status="connected" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Marketing site contact/enquiry forms create leads with source=&quot;Website&quot;
              via the existing lead submission pipeline.
            </p>
          </CardContent>
        </Card>

        {/* Manual + CSV */}
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-purple-500" />
              Manual &amp; CSV Import
            </CardTitle>
            <StatusBadge status="connected" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Add Lead and Import CSV are live on the{" "}
              <a href="/crm/leads" className="underline text-white">Leads</a> page.
            </p>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card className="bg-card border-white/10 shadow-lg md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <WebhookIcon className="h-4 w-4 text-primary" />
              Webhooks
            </CardTitle>
            <StatusBadge status="connected" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Register this URL as the Meta App webhook callback (subscribe to the{" "}
              <code className="text-white">leadgen</code> field). Verify token is read from{" "}
              <code className="text-white">meta_webhook_verify_token</code> in site config, not hardcoded.
            </p>
            <code className="block rounded-lg border border-white/10 bg-secondary/40 p-2.5 text-[11px] text-white break-all">
              {process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000"}/api/method/qala_omni.sync.webhook.meta_webhook
            </code>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Handles comments, mentions, messages, feed, and leadgen events.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
