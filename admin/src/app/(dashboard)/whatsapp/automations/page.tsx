"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Workflow } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface TemplateRef {
  name: string;
  configuredIn?: "interakt";
}

interface Automation {
  id: string;
  code: string;
  name: string;
  triggerLabel: string;
  courseKey: string | null;
  leadSourceGroup: string | null;
  provider: string;
  workflowRef: string | null;
  campaignRef: string | null;
  templates: TemplateRef[];
  isActive: boolean;
  notes: string | null;
  executionPlatform: "interakt";
  controlsExecution: false;
  lastExecutionAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  leadsProcessed: number;
  leadsFailed: number;
  updatedAt: string;
}

export default function WhatsAppAutomationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "automations"],
    queryFn: () => apiFetch<Automation[]>("/whatsapp/automations"),
  });

  const automations = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Automations</h1>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">
          Control plane for Interakt Advanced. Airborne sends <span className="font-mono">lead_created</span> +
          course/source traits. Delays, branches and approved WhatsApp templates run in Interakt — this page
          does not start those workflows via API.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : !automations.length ? (
        <div className="glass-card rounded-2xl p-12 border border-white/10 text-center space-y-2">
          <Workflow className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-white">No Interakt automation mappings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((a) => (
            <AutomationCard
              key={a.id}
              automation={a}
              onSaved={() => queryClient.invalidateQueries({ queryKey: ["whatsapp", "automations"] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AutomationCard({
  automation,
  onSaved,
}: {
  automation: Automation;
  onSaved: () => void;
}) {
  const [workflowRef, setWorkflowRef] = useState(automation.workflowRef ?? "");
  const [campaignRef, setCampaignRef] = useState(automation.campaignRef ?? "");
  const [templateNames, setTemplateNames] = useState(
    automation.templates.map((t) => t.name).join(", "),
  );

  const saveMutation = useMutation({
    mutationFn: (input: { isActive?: boolean; workflowRef?: string | null; campaignRef?: string | null; templates?: TemplateRef[] }) =>
      apiFetch("/whatsapp/automations", {
        method: "PATCH",
        body: JSON.stringify({ id: automation.id, ...input }),
      }),
    onSuccess: () => {
      onSaved();
      toast({ title: "Mapping saved" });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const statusTone =
    automation.lastStatus === "event_sent"
      ? "text-emerald-400"
      : automation.lastStatus === "failed"
        ? "text-rose-400"
        : "text-muted-foreground";

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Workflow className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-white">{automation.name}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${automation.isActive ? "text-emerald-400" : "text-muted-foreground"}`}>
              {automation.isActive ? "Active" : "Disabled"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Interakt</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold">
            Trigger: {automation.triggerLabel}
            {automation.courseKey ? ` · course = ${automation.courseKey}` : ""}
            {automation.leadSourceGroup ? ` · source = ${automation.leadSourceGroup}` : " · source = any"}
          </p>
        </div>
        <Switch
          checked={automation.isActive}
          disabled={saveMutation.isPending}
          onCheckedChange={(isActive) => saveMutation.mutate({ isActive })}
        />
      </div>

      {automation.notes ? (
        <p className="text-[11px] text-muted-foreground leading-relaxed">{automation.notes}</p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        <Stat label="Leads processed" value={String(automation.leadsProcessed)} />
        <Stat label="Failures" value={String(automation.leadsFailed)} tone={automation.leadsFailed ? "text-rose-400" : undefined} />
        <div className="rounded-xl bg-secondary/30 border border-white/5 p-3">
          <p className="text-muted-foreground font-semibold">Last execution</p>
          <p className={`font-bold mt-1 ${statusTone}`}>
            {automation.lastStatus ?? "none"}
            {automation.lastExecutionAt ? ` · ${formatDateTime(automation.lastExecutionAt)}` : ""}
          </p>
          {automation.lastError ? (
            <p className="text-rose-400 mt-1 break-words">{automation.lastError}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Interakt workflow / campaign name
          </span>
          <Input
            value={workflowRef}
            onChange={(e) => setWorkflowRef(e.target.value)}
            placeholder="Paste from Interakt Advanced dashboard"
            className="bg-secondary/40 border-white/10 text-xs"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Interakt campaign id (optional)
          </span>
          <Input
            value={campaignRef}
            onChange={(e) => setCampaignRef(e.target.value)}
            placeholder="Analytics campaign id if you have one"
            className="bg-secondary/40 border-white/10 text-xs"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Templates involved (code names only — variables stay in Interakt)
        </span>
        <Input
          value={templateNames}
          onChange={(e) => setTemplateNames(e.target.value)}
          placeholder="cpl_nurture_d1_welcome_brochure, …"
          className="bg-secondary/40 border-white/10 text-xs"
        />
      </label>

      <Button
        size="sm"
        className="text-xs font-bold"
        disabled={saveMutation.isPending}
        onClick={() =>
          saveMutation.mutate({
            workflowRef: workflowRef.trim() || null,
            campaignRef: campaignRef.trim() || null,
            templates: templateNames
              .split(",")
              .map((n) => n.trim())
              .filter(Boolean)
              .map((name) => ({ name, configuredIn: "interakt" as const })),
          })
        }
      >
        Save mapping
      </Button>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-secondary/30 border border-white/5 p-3">
      <p className="text-muted-foreground font-semibold">{label}</p>
      <p className={`font-bold mt-1 ${tone ?? "text-white"}`}>{value}</p>
    </div>
  );
}
