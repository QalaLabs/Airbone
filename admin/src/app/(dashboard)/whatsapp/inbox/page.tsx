"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Inbox, Send, Search, Archive, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Conversation {
  id: string;
  phone: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  optedOut: boolean;
  archived: boolean;
  lead?: { id: string; name: string; status: string } | null;
}

interface Message {
  id: string;
  direction: "IN" | "OUT";
  body: string;
  status: string;
  errorMsg: string | null;
  campaignId: string | null;
  createdAt: string;
  sender?: { name: string } | null;
}

export default function WhatsAppInboxPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["whatsapp", "conversations", search],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      return apiFetch<Conversation[]>(`/whatsapp/conversations?${params.toString()}`);
    },
    refetchInterval: 15_000,
  });

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["whatsapp", "conversation", selectedId],
    queryFn: () => apiFetch<{ conversation: Conversation; messages: Message[] }>(`/whatsapp/conversations/${selectedId}`),
    enabled: !!selectedId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
    queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversation", selectedId] });
  };

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      apiFetch<{ status: string; errorMsg: string | null }>(`/whatsapp/conversations/${selectedId}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: (res) => {
      setDraft("");
      invalidate();
      if (res.status === "SENT") toast({ title: "Template message accepted by Interakt" });
      else
        toast({
          title: `Not sent (${res.status})`,
          description: res.errorMsg ?? "Interakt rejected the template send.",
          variant: "destructive",
        });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const markReadMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/whatsapp/conversations/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({ markRead: true }),
      }),
    onSuccess: invalidate,
  });

  const archiveMutation = useMutation({
    mutationFn: (archived: boolean) =>
      apiFetch(`/whatsapp/conversations/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({ archived }),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Conversation updated" });
    },
  });

  const list = Array.isArray(conversations) ? conversations : [];
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  const active = thread?.conversation;

  const openConversation = (id: string, unread: number) => {
    setSelectedId(id);
    if (unread > 0) {
      // Mark read on open; the refetch clears the badge.
      apiFetch(`/whatsapp/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ markRead: true }),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inbox</h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">WhatsApp conversations with leads</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search phone or lead…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40 border-white/10 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* Conversation list */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[70vh]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-secondary/20">
            <Inbox className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-white">Conversations</span>
            <span className="ml-auto text-[10px] font-bold text-muted-foreground">{list.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !list.length ? (
              <p className="text-xs text-muted-foreground text-center py-10 font-semibold px-4">
                No conversations yet. Inbound and outbound WhatsApp messages will appear here once a provider is connected.
              </p>
            ) : (
              list.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id, c.unreadCount)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                    selectedId === c.id ? "bg-primary/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{c.lead?.name ?? c.phone}</span>
                    {c.unreadCount > 0 && (
                      <span className="shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.lastMessagePreview ?? c.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {c.optedOut && (
                      <span className="text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 rounded-full">
                        Opted out
                      </span>
                    )}
                    {c.lastMessageAt && (
                      <span className="text-[9px] text-muted-foreground font-semibold">{formatDateTime(c.lastMessageAt)}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="glass-card rounded-2xl border border-white/10 flex flex-col max-h-[70vh]">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-bold text-white">Select a conversation</p>
              <p className="text-xs text-muted-foreground mt-1">Messages you send are delivered through the configured provider.</p>
              <p className="text-[10px] text-amber-400/90 mt-2 max-w-sm mx-auto font-semibold">
                Inbox sends use an approved Interakt WhatsApp template (not free-form text). Optional note is stored in CRM only.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-secondary/20 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{active.lead?.name ?? active.phone}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{active.phone}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-[10px] font-bold"
                  onClick={() => archiveMutation.mutate(!active.archived)}
                >
                  <Archive className="h-3 w-3 mr-1" /> {active.archived ? "Unarchive" : "Archive"}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {threadLoading ? (
                  [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-2/3" />)
                ) : !messages.length ? (
                  <p className="text-xs text-muted-foreground text-center py-8 font-semibold">No messages yet.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.direction === "OUT" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 space-y-1 ${
                          m.direction === "OUT"
                            ? "bg-primary/25 border border-primary/30 rounded-br-sm"
                            : "bg-secondary/50 border border-white/10 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-xs text-white leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>
                        <div className="flex items-center gap-2 justify-end">
                          {m.campaignId && (
                            <span className="text-[9px] font-bold text-violet-400 uppercase">Campaign</span>
                          )}
                          <span
                            className={`text-[9px] font-extrabold uppercase ${
                              m.status === "FAILED" ? "text-rose-400" : "text-muted-foreground"
                            }`}
                            title={m.errorMsg ?? undefined}
                          >
                            {m.status}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{formatDateTime(m.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                className="border-t border-white/10 p-3 flex gap-2 items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) sendMutation.mutate(draft.trim());
                }}
              >
                <Textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    active.optedOut
                      ? "Contact opted out — sending is blocked"
                      : "Optional internal note — sends approved WhatsApp template to contact"
                  }
                  disabled={active.optedOut}
                  className="bg-secondary/40 border-white/10 text-xs resize-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!draft.trim() || active.optedOut || sendMutation.isPending}
                  className="bg-primary text-white text-xs font-bold shrink-0"
                >
                  <Send className="h-3.5 w-3.5 mr-1" /> Send
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
