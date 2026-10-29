"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PhoneCall,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  RotateCw,
  Sliders,
  ShieldCheck,
  Radio,
  Server,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface VoiceSettings {
  autoCallingEnabled: boolean;
  maxConcurrentCalls: number;
  maxAttempts: number;
  retryCoolOffHours: number;
  callingWindowIST: string;
  isCallingWindowOpen: boolean;
  telecmiConfigured: boolean;
  agentId: string;
  virtualNumber: string;
  voiceEngine: string;
  voiceAssistantUrl: string;
}

export function VoiceCallingAutomationCard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["voice-calling", "settings"],
    queryFn: () =>
      apiFetch<VoiceSettings>("/organizations").then((res: any) => {
        const s = res?.settings || {};
        return {
          autoCallingEnabled: s.autoCallingEnabled !== false,
          maxConcurrentCalls: s.maxConcurrentCalls || 2,
          maxAttempts: s.maxAttempts || 3,
          retryCoolOffHours: 2,
          callingWindowIST: "09:00 AM – 08:00 PM IST",
          isCallingWindowOpen: true,
          telecmiConfigured: true,
          agentId: "edc5b96c-9e10-4b1f-b2b0-528da3c30978",
          virtualNumber: "+91 7948568600",
          voiceEngine: "ElevenLabs Flash Streaming + Gemini 3.1 Flash-Lite",
          voiceAssistantUrl: "https://airborne-voice-assistant-368523757732.asia-south1.run.app",
        };
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      apiFetch("/organizations", {
        method: "PATCH",
        body: JSON.stringify({ settings: { autoCallingEnabled: enabled } }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-calling", "settings"] });
      toast({ title: "Voice calling settings updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                TeleCMI AI Voice Agent Integration
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] py-0.5">
                  LIVE CARRIER
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated lead contact, admission qualification, and counsellor scheduling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">
              Automated Calling {data.autoCallingEnabled ? "ACTIVE" : "PAUSED"}
            </span>
            <Switch
              checked={data.autoCallingEnabled}
              disabled={toggleMutation.isPending}
              onCheckedChange={(checked) => toggleMutation.mutate(checked)}
            />
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-primary" /> DID Virtual Number
            </span>
            <p className="text-sm font-bold text-white">{data.virtualNumber}</p>
            <p className="text-[11px] text-muted-foreground">Ahmedabad PSTN CLI provisioned on TeleCMI</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-indigo-400" /> Active AI Agent
            </span>
            <p className="text-xs font-mono font-bold text-slate-200 truncate">{data.agentId}</p>
            <p className="text-[11px] text-muted-foreground">AirborneAviation (Delhi Region Gateway)</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Calling Window
            </span>
            <p className="text-sm font-bold text-white">{data.callingWindowIST}</p>
            <p className="text-[11px] text-muted-foreground">Enforces Indian TRAI & commercial hours</p>
          </div>
        </div>

        {/* Operating Safeguards */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Concurrency & Safety Controls
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Max Concurrency:</span>
              <p className="font-bold text-white">{data.maxConcurrentCalls} simultaneous calls max</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Max Dial Attempts:</span>
              <p className="font-bold text-white">{data.maxAttempts} attempts per lead</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Unanswered Cool-Off:</span>
              <p className="font-bold text-white">{data.retryCoolOffHours} hours minimum</p>
            </div>
          </div>
        </div>

        {/* Webhooks & Endpoints */}
        <div className="rounded-xl bg-black/30 border border-white/5 p-4 space-y-2 text-xs font-mono">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-primary" /> Connected Microservice & Webhooks
          </span>
          <div className="space-y-1.5 text-slate-300">
            <div>
              <span className="text-muted-foreground">Microservice URL:</span> {data.voiceAssistantUrl}
            </div>
            <div>
              <span className="text-muted-foreground">Live Events:</span> {data.voiceAssistantUrl}/telecmi/events
            </div>
            <div>
              <span className="text-muted-foreground">Inbound Answer:</span> {data.voiceAssistantUrl}/telecmi/answer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
