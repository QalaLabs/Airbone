"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Contact {
  id: string;
  name: string;
  phone: string;
  status: string;
  tags: string[];
  whatsappOptOut: boolean;
  lastActivityAt: string | null;
  whatsappConversations: { id: string; unreadCount: number }[];
}

export default function WhatsAppContactsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "contacts", search, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      return apiFetch<Contact[]>(`/whatsapp/contacts?${params.toString()}`);
    },
  });

  const optOutMutation = useMutation({
    mutationFn: (payload: { id: string; optOut: boolean }) =>
      apiFetch(`/whatsapp/contacts/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({ whatsappOptOut: payload.optOut }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "contacts"] });
      toast({ title: "Contact updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const contacts = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Leads with a phone number. Opted-out contacts are excluded from all sends.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="pl-9 bg-secondary/40 border-white/10 text-xs"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-secondary/20 text-left">
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Contact</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Phone</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Tags</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Last activity</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : !contacts.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-semibold">No contacts found.</p>
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.status.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[9px] font-bold bg-secondary/60 border border-white/10 px-1.5 py-0.5 rounded-full text-muted-foreground">
                            {t}
                          </span>
                        ))}
                        {c.tags.length > 3 && <span className="text-[9px] text-muted-foreground">+{c.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lastActivityAt ? formatDateTime(c.lastActivityAt) : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-[9px] font-extrabold uppercase ${c.whatsappOptOut ? "text-rose-400" : "text-emerald-400"}`}>
                          {c.whatsappOptOut ? "Opted out" : "Active"}
                        </span>
                        <Switch
                          checked={!c.whatsappOptOut}
                          onCheckedChange={(checked) => optOutMutation.mutate({ id: c.id, optOut: !checked })}
                          disabled={optOutMutation.isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-white/10 text-xs font-bold">
          Previous
        </Button>
        <span className="text-[10px] font-bold text-muted-foreground">Page {page}</span>
        <Button size="sm" variant="outline" disabled={contacts.length < 50} onClick={() => setPage((p) => p + 1)} className="border-white/10 text-xs font-bold">
          Next
        </Button>
      </div>
    </div>
  );
}
