"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Plus, Rocket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Campaign {
  id: string;
  name: string;
  message: string;
  templateName: string | null;
  audienceFilter: { tags?: string[]; statuses?: string[] };
  status: "DRAFT" | "LAUNCHING" | "COMPLETED";
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  launchedAt: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<Campaign["status"], string> = {
  DRAFT: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  LAUNCHING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function WhatsAppCampaignsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [statuses, setStatuses] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "campaigns"],
    queryFn: () => apiFetch<Campaign[]>("/whatsapp/campaigns?limit=50"),
    refetchInterval: (query) =>
      (query.state.data ?? []).some((c) => c.status === "LAUNCHING") ? 5_000 : false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["whatsapp", "campaigns"] });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/whatsapp/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name,
          message,
          audienceFilter: {
            ...(tags.trim() && { tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
            ...(statuses.trim() && { statuses: statuses.split(",").map((s) => s.trim()).filter(Boolean) }),
          },
        }),
      }),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setName("");
      setMessage("");
      setTags("");
      setStatuses("");
      toast({ title: "Campaign created" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const launchMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ sentCount: number; failedCount: number; skippedCount: number; totalRecipients: number }>(
        `/whatsapp/campaigns/${id}`,
        { method: "POST" },
      ),
    onSuccess: (res) => {
      invalidate();
      toast({
        title: "Campaign finished",
        description: `${res.sentCount} sent · ${res.failedCount} failed · ${res.skippedCount} skipped of ${res.totalRecipients}`,
      });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const campaigns = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Broadcast a message to a filtered lead audience. Opted-out contacts are always excluded.
          </p>
        </div>
        <Button size="sm" className="bg-primary text-white text-xs font-bold" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !campaigns.length ? (
        <div className="glass-card rounded-2xl p-12 border border-white/10 text-center space-y-2">
          <Send className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-white">No campaigns yet</p>
          <p className="text-xs text-muted-foreground">Create one to broadcast announcements, offers or reminders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    <span className={`text-[9px] font-extrabold uppercase border px-1.5 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xl">{c.message}</p>
                </div>
                {c.status === "DRAFT" && (
                  <Button
                    size="sm"
                    className="bg-primary text-white text-xs font-bold shrink-0"
                    disabled={launchMutation.isPending}
                    onClick={() => launchMutation.mutate(c.id)}
                  >
                    <Rocket className="h-3.5 w-3.5 mr-1" /> Launch
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap text-[10px] font-semibold text-muted-foreground">
                <span>Audience: {c.audienceFilter.tags?.length ? `tags ${c.audienceFilter.tags.join(", ")}` : ""}{c.audienceFilter.tags?.length && c.audienceFilter.statuses?.length ? " · " : ""}{c.audienceFilter.statuses?.length ? `statuses ${c.audienceFilter.statuses.join(", ")}` : ""}</span>
                {c.status === "COMPLETED" && (
                  <span className="text-emerald-400">{c.sentCount} sent</span>
                )}
                {c.status === "COMPLETED" && c.failedCount > 0 && (
                  <span className="text-rose-400">{c.failedCount} failed</span>
                )}
                {c.status === "COMPLETED" && c.skippedCount > 0 && (
                  <span className="text-amber-400">{c.skippedCount} skipped</span>
                )}
                {c.launchedAt && <span>Launched {formatDateTime(c.launchedAt)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">New campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/40 border-white/10 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Message * ({"{{leadName}}"} supported)</Label>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="bg-secondary/40 border-white/10 text-xs resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Audience tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="payer, vip" className="bg-secondary/40 border-white/10 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Audience statuses (comma-separated)</Label>
              <Input value={statuses} onChange={(e) => setStatuses(e.target.value)} placeholder="INTERESTED, FOLLOW_UP" className="bg-secondary/40 border-white/10 text-xs" />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10 text-xs font-bold">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!name.trim() || !message.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="bg-primary text-white text-xs font-bold"
            >
              Create draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
