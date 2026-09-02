"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlugZap, CheckCircle2, XCircle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface Settings {
  provider: string;
  providerConfigured: boolean;
  providerName: string;
  envProvider: string | null;
  connected: boolean;
  configurationStatus: string;
  credentialsMasked: { apiKey: string | null } | null;
  whatsappNotifications: boolean;
  webhookUrl: string;
  webhookConfigured: boolean;
  webhookAuth: string;
}

interface HealthResult {
  ok: boolean;
  live: boolean;
  provider: string;
  status?: number;
  error?: string;
}

export default function WhatsAppSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "settings"],
    queryFn: () => apiFetch<Settings>("/whatsapp/settings"),
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      apiFetch("/whatsapp/settings", {
        method: "PATCH",
        body: JSON.stringify({ whatsappNotifications: enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: () => apiFetch<HealthResult>("/whatsapp/settings", { method: "POST" }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "settings"] });
      toast({
        title: result.live ? "Interakt connected" : result.ok ? "Provider reachable (not live)" : "Connection failed",
        description: result.live
          ? "A real Get Users request against api.interakt.ai succeeded."
          : result.error ?? `HTTP ${result.status ?? "n/a"}`,
        variant: result.live ? "default" : "destructive",
      });
    },
    onError: (err: Error) => toast({ title: "Test failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Settings</h1>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">Provider configuration and feature flags</p>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-primary" /> Provider
            </h2>
            <div className="flex items-center gap-3">
              {data.connected ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-amber-400 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">
                  {data.connected
                    ? `Connected via "${data.providerName}"`
                    : data.providerConfigured
                      ? `Configured via "${data.providerName}" — not live`
                      : "No provider configured"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Provider <span className="font-mono">{data.provider}</span> · status{" "}
                  <span className="font-mono">{data.configurationStatus}</span> · env{" "}
                  <span className="font-mono">{data.envProvider ?? "unset"}</span>. Set{" "}
                  <span className="font-mono">WHATSAPP_PROVIDER=mock</span> for local testing or{" "}
                  <span className="font-mono">interakt</span> plus <span className="font-mono">INTERAKT_API_KEY</span>{" "}
                  for production. Live Interakt is never claimed until a real API call succeeds.
                </p>
                {data.credentialsMasked?.apiKey && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    API key <span className="font-mono">{data.credentialsMasked.apiKey}</span>
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold shrink-0"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
              >
                <Activity className="h-3.5 w-3.5" />
                {testMutation.isPending ? "Testing…" : "Test connection"}
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-primary" /> Inbound webhook
            </h2>
            <div className="space-y-2">
              <p className="text-xs font-bold text-white">
                {data.webhookConfigured ? "Configured" : "Not configured"} · auth{" "}
                <span className="font-mono">{data.webhookAuth}</span>
              </p>
              <p className="text-[11px] text-muted-foreground break-all font-mono bg-secondary/30 rounded-lg p-2.5 border border-white/5">
                {data.webhookUrl}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Point Interakt Developer Settings here. Interakt signs the body with HMAC-SHA256 in{" "}
                <span className="font-mono">Interakt-Signature</span> (secret ={" "}
                <span className="font-mono">INTERAKT_WEBHOOK_SECRET</span> or{" "}
                <span className="font-mono">WHATSAPP_WEBHOOK_SECRET</span>). Generic/Meta providers still send{" "}
                <span className="font-mono">x-webhook-secret</span>. Inbound replies thread into the inbox; STOP
                keywords set opt-out and halt marketing workflows.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Features</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-white">WhatsApp notifications</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Master switch for templated WhatsApp sends across the platform
                </p>
              </div>
              <Switch
                checked={data.whatsappNotifications}
                onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                disabled={toggleMutation.isPending}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
