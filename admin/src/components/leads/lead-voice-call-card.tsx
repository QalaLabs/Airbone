"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PhoneCall,
  Bot,
  RotateCw,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Volume2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Ban,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface CallingJobData {
  id: string;
  status: string;
  attemptCount: number;
  providerCallId: string | null;
  scheduledAt: string;
  callStartedAt: string | null;
  callAnsweredAt: string | null;
  callCompletedAt: string | null;
  initiationLatencyMs: number | null;
  durationSecs: number | null;
  callOutcome: string | null;
  recordingUrl: string | null;
  transcript: string | null;
  summary: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
}

interface AgentCallStatusResponse {
  leadId: string;
  phone: string;
  hasPhone: boolean;
  autoCallingEnabled: boolean;
  doNotCall: boolean;
  latestCallStatus: string | null;
  latestCallOutcome: string | null;
  lastCallAt: string | null;
  lastCallDuration: number | null;
  callAttemptCount: number;
  lastCallSummary: string | null;
  voiceAssistantConfigured: boolean;
  activeCallsCount: number;
  maxConcurrentCalls: number;
  callingJobs: CallingJobData[];
  recentCalls: {
    id: string;
    title: string | null;
    outcome: string | null;
    durationMins: number | null;
    createdAt: string;
    metadata: any;
  }[];
}

export function LeadVoiceCallCard({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["lead", leadId, "agent-call"],
    queryFn: () => apiFetch<AgentCallStatusResponse>(`/leads/${leadId}/agent-call`),
    refetchInterval: 5000, // Poll every 5s if in active call state
  });

  const actionMutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch<{ success: boolean; message: string }>(`/leads/${leadId}/agent-call`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId, "agent-call"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId, "activities"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId, "timeline"] });
      toast({
        title: "Action Succeeded",
        description: res.message,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Action Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const status = (data.latestCallStatus || "NOT_CALLED").toUpperCase();
  const isCalling = ["PROCESSING", "INITIATED", "RINGING", "ANSWERED"].includes(status);
  const isCompleted = status === "COMPLETED";
  const isQueued = status === "QUEUED";
  const isFailed = status === "FAILED" || status === "RETRY_SCHEDULED";
  const isDnd = data.doNotCall;

  const latestJob = data.callingJobs[0];
  const recording = latestJob?.recordingUrl || data.recentCalls.find((c) => c.metadata?.recording_url)?.metadata?.recording_url;
  const transcript = latestJob?.transcript || data.recentCalls.find((c) => c.metadata?.transcript)?.metadata?.transcript;
  const summary = data.lastCallSummary || latestJob?.summary;

  const latencySeconds = latestJob?.initiationLatencyMs ? (latestJob.initiationLatencyMs / 1000).toFixed(1) : null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              TeleCMI AI Voice Agent
              {isCalling && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Autonomous outbound qualifying & admission counseling
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isDnd ? (
            <Badge variant="destructive" className="gap-1 text-xs px-2.5 py-0.5">
              <Ban className="h-3 w-3" /> DO NOT CALL (DND)
            </Badge>
          ) : isCalling ? (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 text-xs px-2.5 py-0.5 animate-pulse">
              <PhoneCall className="h-3 w-3 animate-spin" /> {status}
            </Badge>
          ) : isCompleted ? (
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 gap-1 text-xs px-2.5 py-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> COMPLETED
            </Badge>
          ) : isQueued ? (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1 text-xs px-2.5 py-0.5">
              <Clock className="h-3 w-3" /> QUEUED
            </Badge>
          ) : isFailed ? (
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 gap-1 text-xs px-2.5 py-0.5">
              <AlertTriangle className="h-3 w-3" /> {status}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground border-white/10 text-xs px-2.5 py-0.5">
              NOT YET DIALED
            </Badge>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Attempts</span>
          <p className="text-white font-bold text-sm mt-0.5">
            {data.callAttemptCount} / 3
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Duration</span>
          <p className="text-white font-bold text-sm mt-0.5">
            {data.lastCallDuration ? `${data.lastCallDuration}s` : "—"}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Last Outcome</span>
          <p className="text-white font-bold text-sm mt-0.5">
            {data.latestCallOutcome || "—"}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Initiation Latency</span>
          <p className="text-white font-bold text-sm mt-0.5">
            {latencySeconds ? `${latencySeconds}s` : "—"}
          </p>
        </div>
      </div>

      {/* Call Summary (if available) */}
      {summary && (
        <div className="space-y-2 rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-3.5 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <Sparkles className="h-3.5 w-3.5" /> AI Conversation Summary
          </div>
          <p className="text-slate-200 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Audio Recording Player (if available) */}
      {recording && (
        <div className="space-y-1.5 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs">
          <div className="flex items-center justify-between font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-white">
              <Volume2 className="h-3.5 w-3.5 text-primary" /> Call Recording
            </span>
            <a
              href={recording}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              Direct Link ↗
            </a>
          </div>
          <audio controls className="w-full h-8 mt-2" src={recording}>
            Your browser does not support audio element.
          </audio>
        </div>
      )}

      {/* Transcript Accordion */}
      {transcript && (
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-3.5 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-bold text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" /> Dialogue Transcript
            </span>
            {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showTranscript && (
            <div className="p-3.5 bg-black/30 text-xs font-mono text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed border-t border-white/5">
              {transcript}
            </div>
          )}
        </div>
      )}

      {/* Controls & Actions Toolbar */}
      <div className="space-y-3 pt-1 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Automated calling toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={data.autoCallingEnabled}
              disabled={actionMutation.isPending}
              onCheckedChange={(checked) =>
                actionMutation.mutate({ action: "toggle_auto_calling", enabled: checked })
              }
            />
            <span className="text-xs font-medium text-slate-300">
              Automated Calls {data.autoCallingEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* DND Toggle Button */}
          <Button
            size="sm"
            variant="outline"
            disabled={actionMutation.isPending}
            onClick={() => actionMutation.mutate({ action: "set_do_not_call", doNotCall: !data.doNotCall })}
            className={`h-7 px-2.5 text-xs font-semibold border-white/10 ${
              data.doNotCall ? "text-emerald-400 hover:text-emerald-300" : "text-rose-400 hover:text-rose-300"
            }`}
          >
            {data.doNotCall ? (
              <>
                <Check className="h-3 w-3 mr-1" /> Remove DND
              </>
            ) : (
              <>
                <Ban className="h-3 w-3 mr-1" /> Mark Do Not Call (DND)
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            disabled={actionMutation.isPending || isCalling || data.doNotCall}
            onClick={() => actionMutation.mutate({ action: "call_now" })}
            className="flex-1 h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm gap-1.5"
          >
            {actionMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PhoneCall className="h-3.5 w-3.5" />
            )}
            {isCalling ? "Call Active..." : "Trigger AI Call Now"}
          </Button>

          {(isFailed || status === "NO_ANSWER" || status === "BUSY") && !data.doNotCall && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionMutation.isPending || isCalling}
              onClick={() => actionMutation.mutate({ action: "retry" })}
              className="h-8 text-xs font-semibold border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" /> Retry Call
            </Button>
          )}

          {data.callingJobs.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
              className="h-8 text-xs text-muted-foreground hover:text-white"
            >
              History ({data.callingJobs.length})
            </Button>
          )}
        </div>
      </div>

      {/* Calling Jobs History Sub-panel */}
      {showHistory && data.callingJobs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Call Attempt History ({data.callingJobs.length})
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {data.callingJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Attempt #{job.attemptCount}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-white/10">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatDateTime(job.createdAt)} {job.durationSecs ? `· ${job.durationSecs}s` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-300">
                    {job.callOutcome || "—"}
                  </span>
                  {job.initiationLatencyMs && (
                    <div className="text-[10px] text-emerald-400">
                      {(job.initiationLatencyMs / 1000).toFixed(1)}s latency
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
