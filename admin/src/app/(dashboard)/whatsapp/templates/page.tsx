"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Template {
  id: string;
  event: string;
  name: string;
  body: string;
  variables: string[];
  isActive: boolean;
  updatedAt: string;
}

// NotificationEvent values relevant to WhatsApp messaging.
const EVENTS = [
  "NEW_LEAD",
  "LEAD_ASSIGNED",
  "WORKFLOW_TRIGGERED",
  "ADMISSION_CREATED",
  "PAYMENT_SUCCESS",
  "PAYMENT_REMINDER",
  "DOCUMENT_PENDING",
  "BATCH_STARTING",
] as const;

export default function WhatsAppTemplatesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [event, setEvent] = React.useState<string>(EVENTS[0]);
  const [name, setName] = React.useState("");
  const [body, setBody] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "templates"],
    queryFn: () => apiFetch<Template[]>("/whatsapp/templates"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["whatsapp", "templates"] });

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/whatsapp/templates", {
        method: "POST",
        body: JSON.stringify({ event, name, body, isActive: true }),
      }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setName("");
      setBody("");
      toast({ title: "Template saved" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/whatsapp/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Template deleted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const templates = Array.isArray(data) ? data : [];
  const detectedVars = Array.from(new Set(Array.from(body.matchAll(/\{\{\s*(\w+)\s*\}\}/g), (m) => m[1])));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Templates</h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            One template per event. Variables use <span className="font-mono">{"{{name}}"}</span> syntax.
          </p>
        </div>
        <Button size="sm" className="bg-primary text-white text-xs font-bold" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New template
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !templates.length ? (
        <div className="glass-card rounded-2xl p-12 border border-white/10 text-center space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-white">No WhatsApp templates yet</p>
          <p className="text-xs text-muted-foreground">
            Without an active template for an event, sends are skipped and logged honestly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{t.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{t.event}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!t.isActive && (
                    <span className="text-[9px] font-extrabold uppercase bg-slate-500/20 text-slate-300 border border-slate-500/30 px-1.5 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-rose-400"
                    onClick={() => deleteMutation.mutate(t.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-secondary/30 rounded-xl p-3 border border-white/5 line-clamp-4">
                {t.body}
              </p>
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                <span>{t.variables.length ? `Variables: ${t.variables.join(", ")}` : "No variables"}</span>
                <span>{formatDateTime(t.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">New template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Event</Label>
              <Select value={event} onValueChange={setEvent}>
                <SelectTrigger className="bg-secondary/40 border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/10 text-xs">
                  {EVENTS.map((e) => (
                    <SelectItem key={e} value={e}>{e.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/40 border-white/10 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Body *</Label>
              <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi {{leadName}}…" className="bg-secondary/40 border-white/10 text-xs resize-none" />
              {detectedVars.length > 0 && (
                <p className="text-[10px] text-primary font-semibold">Detected variables: {detectedVars.join(", ")}</p>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-xs font-bold">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!name.trim() || !body.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="bg-primary text-white text-xs font-bold"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
