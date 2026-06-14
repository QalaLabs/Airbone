"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, Calendar, User, Globe, MessageSquare,
  CheckCircle, PhoneCall, Clock, FileText, Edit2, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  courseInterest?: string;
  notes?: string;
  assignedTo?: { id: string; name: string };
  admission?: { id: string; applicationNo: string; stage: string };
  createdAt: string;
  updatedAt: string;
}

interface LeadActivity {
  id: string;
  type: string;
  description: string;
  createdBy?: { name: string };
  createdAt: string;
}

const LEAD_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "FOLLOW_UP", "CONVERTED", "LOST"];

const activitySchema = z.object({
  type: z.string().min(1),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

type ActivityForm = z.infer<typeof activitySchema>;

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  NOTE: MessageSquare,
  CALL: PhoneCall,
  EMAIL: Mail,
  MEETING: Calendar,
  FOLLOW_UP: Clock,
  OTHER: FileText,
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addActivityOpen, setAddActivityOpen] = React.useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => apiFetch<Lead>(`/leads/${id}`),
    enabled: !!id,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead", id, "activities"],
    queryFn: () => apiFetch<{ items: LeadActivity[] }>(`/leads/${id}/activities`),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      apiFetch(`/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Status updated" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: "NOTE" },
  });

  const addActivityMutation = useMutation({
    mutationFn: (body: ActivityForm) =>
      apiFetch(`/leads/${id}/activities`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id, "activities"] });
      toast({ title: "Activity added" });
      setAddActivityOpen(false);
      reset();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Lead not found</p>
        <Button variant="ghost" onClick={() => router.push("/leads")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/leads")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">Lead created {formatDate(lead.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={lead.status}
            onValueChange={(v) => updateStatusMutation.mutate(v)}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {lead.email}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {lead.phone}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Source</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    {lead.source.replace(/_/g, " ")}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Course Interest</p>
                  <p className="text-sm font-medium">{lead.courseInterest ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={lead.status} domain="lead" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <p className="text-sm font-medium">{lead.assignedTo?.name ?? "Unassigned"}</p>
                </div>
              </div>
              {lead.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm text-foreground">{lead.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Admission Link */}
          {lead.admission && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Linked Admission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{lead.admission.applicationNo}</p>
                    <StatusBadge status={lead.admission.stage} domain="admission" className="mt-1" />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/admissions?id=${lead.admission.id}`}>View Admission</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setAddActivityOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !activities?.items.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">No activities yet</p>
              ) : (
                <div className="relative space-y-0">
                  {activities.items.map((activity, i) => {
                    const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
                    return (
                      <div key={activity.id} className="flex gap-3 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          {i < (activities.items.length - 1) && (
                            <div className="mt-1 w-px flex-1 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">{activity.type.replace(/_/g, " ")}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(activity.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          {activity.createdBy && (
                            <p className="text-xs text-muted-foreground mt-1">by {activity.createdBy.name}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Created", value: formatDate(lead.createdAt) },
                { label: "Last Updated", value: formatDate(lead.updatedAt) },
                { label: "Lead ID", value: lead.id.slice(0, 8) + "..." },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => addActivityMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("type")}
              >
                {["NOTE", "CALL", "EMAIL", "MEETING", "FOLLOW_UP", "OTHER"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the activity..."
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddActivityOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addActivityMutation.isPending}>
                {addActivityMutation.isPending ? "Adding..." : "Add Activity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing Plus import fix
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
