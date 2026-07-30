"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, Calendar, User, MessageSquare,
  PhoneCall, Clock, FileText, Sparkles, Plus, CheckCircle2,
  UserPlus, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface LeadAdmission {
  id: string;
  applicationNo: string;
  stage: string;
  courseName?: string | null;
  batchName?: string | null;
  feePaid?: string | number | null;
  feeBalance?: string | number | null;
  feeFinal?: string | number | null;
}

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  status: string;
  source: string;
  score: number;
  courseInterest?: string | null;
  city?: string | null;
  nextFollowUp?: string | null;
  lastActivityAt?: string | null;
  convertedAt?: string | null;
  lostReason?: string | null;
  assignedTo?: string | null;
  counselor?: { id: string; name: string; email?: string | null } | null;
  admissions?: LeadAdmission[];
  scoreHistory?: { id: string; score: number; reason?: string | null; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

interface LeadActivity {
  id: string;
  activityType: string;
  title?: string | null;
  notes?: string | null;
  outcome?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  durationMins?: number | null;
  performer?: { id: string; name: string } | null;
  createdAt: string;
}

interface CounselorOption {
  id: string;
  name: string;
  role: string;
}

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "COUNSELED",
  "APPLICATION_SUBMITTED",
  "CONVERTED",
  "LOST",
] as const;

const ACTIVITY_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "WHATSAPP",
  "SMS",
  "MEETING",
  "TASK",
] as const;

const activitySchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  title: z.string().max(500).optional(),
  notes: z.string().min(2, "Add a short note").max(5000),
  outcome: z.string().max(255).optional(),
  dueAt: z.string().optional(),
  durationMins: z.coerce.number().min(0).max(1440).optional(),
});

type ActivityForm = z.infer<typeof activitySchema>;

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  NOTE: MessageSquare,
  CALL: PhoneCall,
  EMAIL: Mail,
  WHATSAPP: MessageSquare,
  SMS: Phone,
  MEETING: Calendar,
  TASK: CheckCircle2,
  FOLLOW_UP: Clock,
  STATUS_CHANGE: Sparkles,
  ASSIGNMENT: UserPlus,
  SYSTEM: FileText,
};

function priorityFromScore(score: number) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"timeline" | "tasks" | "comms" | "scoring">("timeline");
  const [logOpen, setLogOpen] = React.useState(false);
  const [logDefaultType, setLogDefaultType] = React.useState<(typeof ACTIVITY_TYPES)[number]>("NOTE");
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [counselorId, setCounselorId] = React.useState("");
  const [followUp, setFollowUp] = React.useState("");
  const [lostReason, setLostReason] = React.useState("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => apiFetch<Lead>(`/leads/${id}`),
    enabled: !!id,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead", id, "activities"],
    queryFn: () => apiFetch<LeadActivity[]>(`/leads/${id}/activities?limit=50`),
    enabled: !!id,
  });

  const { data: counselors } = useQuery({
    queryKey: ["users", "counselors"],
    queryFn: async () => {
      try {
        return await apiFetch<CounselorOption[]>(`/users?limit=50`);
      } catch {
        return [] as CounselorOption[];
      }
    },
  });

  React.useEffect(() => {
    if (lead?.nextFollowUp) {
      setFollowUp(lead.nextFollowUp.slice(0, 16));
    }
  }, [lead?.nextFollowUp]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lead", id] });
    queryClient.invalidateQueries({ queryKey: ["lead", id, "activities"] });
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { status: string; lostReason?: string }) =>
      apiFetch(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Status updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { activityType: "NOTE", notes: "" },
  });

  const activityType = watch("activityType");

  const openLog = (type: (typeof ACTIVITY_TYPES)[number] = "NOTE") => {
    setLogDefaultType(type);
    reset({ activityType: type, notes: "", title: "", outcome: "", dueAt: "" });
    setValue("activityType", type);
    setLogOpen(true);
  };

  const addActivityMutation = useMutation({
    mutationFn: (body: ActivityForm) => {
      const payload: Record<string, unknown> = {
        activityType: body.activityType,
        title: body.title || undefined,
        notes: body.notes,
        outcome: body.outcome || undefined,
        durationMins: body.durationMins || undefined,
      };
      if (body.dueAt) {
        payload.dueAt = new Date(body.dueAt).toISOString();
      }
      return apiFetch(`/leads/${id}/activities`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Activity logged" });
      setLogOpen(false);
      reset();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (activityId: string) =>
      apiFetch(`/leads/${id}/activities/${activityId}`, {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Task completed" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: (cid: string) =>
      apiFetch(`/leads/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ counselorId: cid }),
      }),
    onSuccess: () => {
      invalidate();
      setAssignOpen(false);
      toast({ title: "Counselor assigned" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const followUpMutation = useMutation({
    mutationFn: (value: string | null) =>
      apiFetch(`/leads/${id}/follow-up`, {
        method: "PATCH",
        body: JSON.stringify({ nextFollowUp: value }),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Follow-up saved" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const convertMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ admission: { id: string; applicationNo: string }; created: boolean }>(`/leads/${id}/convert`, {
        method: "POST",
        body: JSON.stringify({
          courseName: lead?.courseInterest ?? undefined,
          counselorId: lead?.assignedTo ?? undefined,
        }),
      }),
    onSuccess: (res) => {
      invalidate();
      toast({
        title: res.created ? "Admission created" : "Admission already exists",
        description: res.admission.applicationNo,
      });
      router.push(`/admissions?id=${res.admission.id}`);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const activityList = Array.isArray(activities) ? activities : [];
  const tasks = activityList.filter((a) => a.activityType === "TASK");
  const openTasks = tasks.filter((a) => !a.completedAt);
  const comms = activityList.filter((a) =>
    ["CALL", "EMAIL", "WHATSAPP", "SMS", "MEETING"].includes(a.activityType),
  );
  const pipeline = ["NEW", "CONTACTED", "COUNSELED", "APPLICATION_SUBMITTED", "CONVERTED"];
  const statusIndex = pipeline.indexOf(lead?.status ?? "NEW");
  const primaryAdmission = lead?.admissions?.[0];
  const counselorOptions = (Array.isArray(counselors) ? counselors : []).filter((u) =>
    ["ADMIN", "SUPER_ADMIN", "COUNSELOR", "TEACHER"].includes(u.role),
  );

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground font-semibold">Lead not found.</p>
        <Button variant="ghost" onClick={() => router.push("/leads")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to leads
        </Button>
      </div>
    );
  }

  const priority = priorityFromScore(lead.score ?? 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/leads")} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{lead.name}</h1>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Score: {lead.score ?? 0}
              </span>
              <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                {priority}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Created {formatDate(lead.createdAt)} · Source: {(lead.source ?? "").replace(/_/g, " ")}
              {lead.nextFollowUp ? ` · Follow-up ${formatDateTime(lead.nextFollowUp)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground font-semibold">
            <span>Status</span>
            <Select
              value={lead.status}
              onValueChange={(v) => {
                if (v === "LOST" && !lostReason.trim()) {
                  toast({ title: "Lost reason required", description: "Enter a lost reason below first.", variant: "destructive" });
                  return;
                }
                updateStatusMutation.mutate({
                  status: v,
                  lostReason: v === "LOST" ? lostReason : undefined,
                });
              }}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-48 bg-secondary/60 border-white/10 text-white font-bold text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10 text-xs">
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" className="border-white/10 text-xs font-bold" onClick={() => setAssignOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
          </Button>
          <Button
            size="sm"
            className="bg-primary text-white text-xs font-bold"
            onClick={() => convertMutation.mutate()}
            disabled={convertMutation.isPending || lead.status === "LOST"}
          >
            <GraduationCap className="h-3.5 w-3.5 mr-1" /> Convert to Admission
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center max-w-xl">
        <Input
          placeholder="Lost reason (required when marking LOST)"
          value={lostReason}
          onChange={(e) => setLostReason(e.target.value)}
          className="bg-secondary/40 border-white/10 text-xs"
        />
      </div>
      {lead.lostReason ? (
        <p className="text-xs text-rose-400 font-semibold">Current lost reason: {lead.lostReason}</p>
      ) : null}

      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "timeline" as const, label: "Timeline", icon: Clock },
          { id: "tasks" as const, label: `Tasks (${openTasks.length})`, icon: CheckCircle2 },
          { id: "comms" as const, label: "Calls / Email / WhatsApp", icon: PhoneCall },
          { id: "scoring" as const, label: "Scoring", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-primary/20 text-white border-primary/30"
                  : "text-muted-foreground hover:bg-white/5 border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="h-4 w-4 text-primary" /> Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Info label="Email" value={lead.email || "-"} icon={Mail} />
              <Info label="Phone" value={lead.phone} icon={Phone} mono />
              <Info label="Course interest" value={lead.courseInterest || "-"} />
              <Info label="Counselor" value={lead.counselor?.name || "Unassigned"} />
              <Info label="City" value={lead.city || "-"} />
              <Info
                label="Last activity"
                value={lead.lastActivityAt ? formatDateTime(lead.lastActivityAt) : "-"}
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pipeline</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {pipeline.map((st, idx) => {
                  const isDone = statusIndex >= 0 && idx <= statusIndex;
                  return (
                    <div
                      key={st}
                      className={`p-2 rounded-xl border text-center ${
                        isDone
                          ? "bg-primary/20 border-primary/30 text-white"
                          : "bg-secondary/30 border-white/5 text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] font-bold block">{st.replace(/_/g, " ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {activeTab === "timeline" && (
            <TimelineCard
              title="Activity timeline"
              loading={activitiesLoading}
              items={activityList}
              onAdd={() => openLog("NOTE")}
              onComplete={(aid) => completeTaskMutation.mutate(aid)}
              quickActions
              onQuick={(t) => openLog(t)}
            />
          )}

          {activeTab === "tasks" && (
            <TimelineCard
              title="Tasks"
              loading={activitiesLoading}
              items={tasks}
              onAdd={() => openLog("TASK")}
              onComplete={(aid) => completeTaskMutation.mutate(aid)}
              empty="No tasks yet."
            />
          )}

          {activeTab === "comms" && (
            <TimelineCard
              title="Communication log"
              loading={activitiesLoading}
              items={comms}
              onAdd={() => openLog("CALL")}
              onComplete={(aid) => completeTaskMutation.mutate(aid)}
              empty="No calls, emails, or WhatsApp logs yet."
              quickActions
              onQuick={(t) => openLog(t)}
              quickTypes={["CALL", "EMAIL", "WHATSAPP", "SMS", "MEETING"]}
            />
          )}

          {activeTab === "scoring" && (
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">Score history</h2>
              <p className="text-sm text-white font-bold">Current score: {lead.score ?? 0}</p>
              {!lead.scoreHistory?.length ? (
                <p className="text-xs text-muted-foreground">No score history yet. Logging activities updates score.</p>
              ) : (
                <div className="space-y-2">
                  {lead.scoreHistory.map((h) => (
                    <div key={h.id} className="flex justify-between text-xs p-3 rounded-xl bg-secondary/30 border border-white/5">
                      <span className="text-white font-bold">{h.score}</span>
                      <span className="text-muted-foreground">{h.reason || "-"}</span>
                      <span className="text-muted-foreground">{formatDateTime(h.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/10 pb-3">
              Follow-up
            </h3>
            <Input
              type="datetime-local"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="bg-secondary/40 border-white/10 text-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="text-xs font-bold flex-1"
                onClick={() =>
                  followUpMutation.mutate(followUp ? new Date(followUp).toISOString() : null)
                }
                disabled={followUpMutation.isPending}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold border-white/10"
                onClick={() => {
                  setFollowUp("");
                  followUpMutation.mutate(null);
                }}
              >
                Clear
              </Button>
            </div>
            <Button size="sm" variant="outline" className="w-full border-white/10 text-xs font-bold" onClick={() => openLog("TASK")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Schedule task
            </Button>
          </div>

          {primaryAdmission ? (
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/10 pb-3">
                Admission
              </h3>
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Application</span>
                <p className="text-sm font-bold text-white mt-0.5">{primaryAdmission.applicationNo}</p>
              </div>
              <StatusBadge status={primaryAdmission.stage} domain="admission" />
              <Button variant="outline" className="w-full border-white/10 text-xs font-bold" asChild>
                <a href={`/admissions?id=${primaryAdmission.id}`}>Open admission</a>
              </Button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white">No admission yet</h3>
              <p className="text-xs text-muted-foreground">Convert this lead to start the admissions workflow.</p>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">Metadata</h3>
            <div>
              <span className="text-muted-foreground block font-semibold">Lead ID</span>
              <span className="font-mono text-white font-bold break-all">{lead.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-semibold">Updated</span>
              <span className="text-white font-bold">{formatDateTime(lead.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Log activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => addActivityMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Type</Label>
              <select
                className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/40 px-3 py-1 text-xs font-semibold"
                {...register("activityType")}
                defaultValue={logDefaultType}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Title (optional)</Label>
              <Input className="bg-secondary/40 border-white/10 text-xs" {...register("title")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Notes *</Label>
              <Textarea rows={4} className="bg-secondary/40 border-white/10 text-xs" {...register("notes")} />
              {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Outcome (optional)</Label>
              <Input className="bg-secondary/40 border-white/10 text-xs" {...register("outcome")} />
            </div>
            {(activityType === "TASK" || activityType === "MEETING") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Due at</Label>
                <Input type="datetime-local" className="bg-secondary/40 border-white/10 text-xs" {...register("dueAt")} />
              </div>
            )}
            {activityType === "CALL" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Duration (minutes)</Label>
                <Input type="number" className="bg-secondary/40 border-white/10 text-xs" {...register("durationMins")} />
              </div>
            )}
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setLogOpen(false)} className="border-white/10 text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={addActivityMutation.isPending} className="bg-primary text-white text-xs font-bold">
                {addActivityMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-sm glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Assign counselor</DialogTitle>
          </DialogHeader>
          <Select value={counselorId} onValueChange={setCounselorId}>
            <SelectTrigger className="bg-secondary/60 border-white/10 text-xs">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10 text-xs">
              {counselorOptions.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              className="text-xs font-bold"
              disabled={!counselorId || assignMutation.isPending}
              onClick={() => assignMutation.mutate(counselorId)}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  mono?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className={`flex items-center gap-2 text-sm font-bold text-white ${mono ? "font-mono" : ""}`}>
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
        {value}
      </div>
    </div>
  );
}

function TimelineCard({
  title,
  loading,
  items,
  onAdd,
  onComplete,
  empty = "No timeline activities logged yet.",
  quickActions,
  onQuick,
  quickTypes = ["NOTE", "CALL", "EMAIL", "WHATSAPP", "TASK"],
}: {
  title: string;
  loading: boolean;
  items: LeadActivity[];
  onAdd: () => void;
  onComplete: (id: string) => void;
  empty?: string;
  quickActions?: boolean;
  onQuick?: (t: (typeof ACTIVITY_TYPES)[number]) => void;
  quickTypes?: (typeof ACTIVITY_TYPES)[number][];
}) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-3 flex-wrap">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> {title}
        </h2>
        <div className="flex gap-2 flex-wrap">
          {quickActions && onQuick
            ? quickTypes.map((t) => (
                <Button key={t} size="sm" variant="outline" className="border-white/10 text-[10px] font-bold" onClick={() => onQuick(t)}>
                  {t}
                </Button>
              ))
            : null}
          <Button size="sm" onClick={onAdd} className="bg-primary text-white text-xs font-bold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !items.length ? (
        <p className="text-xs text-muted-foreground text-center py-8 font-semibold">{empty}</p>
      ) : (
        <div className="space-y-4">
          {items.map((act) => {
            const Icon = ACTIVITY_ICONS[act.activityType] ?? FileText;
            const openTask = act.activityType === "TASK" && !act.completedAt;
            return (
              <div key={act.id} className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs font-bold text-white">
                      {act.title || act.activityType.replace(/_/g, " ")}
                      {openTask ? " · open" : act.completedAt && act.activityType === "TASK" ? " · done" : ""}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">{formatDateTime(act.createdAt)}</span>
                  </div>
                  {act.notes ? <p className="text-xs text-muted-foreground leading-relaxed">{act.notes}</p> : null}
                  {act.outcome ? <p className="text-[10px] text-emerald-400 mt-1">Outcome: {act.outcome}</p> : null}
                  {act.dueAt ? <p className="text-[10px] text-amber-400 mt-1">Due {formatDateTime(act.dueAt)}</p> : null}
                  {act.performer ? (
                    <p className="text-[10px] text-primary font-semibold mt-1">Logged by {act.performer.name}</p>
                  ) : null}
                  {openTask ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 text-[10px] font-bold border-white/10"
                      onClick={() => onComplete(act.id)}
                    >
                      Mark complete
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
