"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlugZap, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface Settings {
  providerConfigured: boolean;
  providerName: string;
  envProvider: string | null;
  whatsappNotifications: boolean;
  webhookUrl: string;
  webhookConfigured: boolean;
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
              {data.providerConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-white">
                  {data.providerConfigured ? `Configured via "${data.providerName}"` : "No provider configured"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Set <span className="font-mono">WHATSAPP_PROVIDER=mock</span> for local testing or{" "}
                  <span className="font-mono">interakt</span> (plus API credentials) for production. Current value:{" "}
                  <span className="font-mono">{data.envProvider ?? "unset"}</span>. Until configured, all sends are
                  recorded as NOT_CONFIGURED — nothing is faked.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-primary" /> Inbound webhook
            </h2>
            <div className="space-y-2">
              <p className="text-xs font-bold text-white">
                {data.webhookConfigured ? "Configured" : "Not configured"}
              </p>
              <p className="text-[11px] text-muted-foreground break-all font-mono bg-secondary/30 rounded-lg p-2.5 border border-white/5">
                {data.webhookUrl}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Point your WhatsApp provider here. Set <span className="font-mono">WHATSAPP_WEBHOOK_SECRET</span> and
                send it as the <span className="font-mono">x-webhook-secret</span> header (or{" "}
                <span className="font-mono">?secret=</span>). For Meta Cloud API verification set{" "}
                <span className="font-mono">WHATSAPP_WEBHOOK_VERIFY_TOKEN</span>. Inbound messages thread into the
                inbox, opt-out keywords stop all automations, and replies fire the{" "}
                <span className="font-mono">whatsapp.replied</span> workflow trigger.
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
