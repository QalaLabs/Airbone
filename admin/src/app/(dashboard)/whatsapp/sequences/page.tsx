"use client";

import { useQuery } from "@tanstack/react-query";
import { Route, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface Sequence {
  id: string;
  name: string;
  code: string;
  description: string | null;
  triggerEvent: string;
  stepCount: number;
  updatedAt: string;
}

export default function WhatsAppSequencesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "sequences"],
    queryFn: () => apiFetch<Sequence[]>("/whatsapp/sequences"),
  });

  const sequences = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sequences</h1>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">
          Multi-day nurture journeys built on the workflow engine (code prefix <span className="font-mono">seq-</span>)
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !sequences.length ? (
        <div className="glass-card rounded-2xl p-12 border border-white/10 text-center space-y-2">
          <Route className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-white">No sequences yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Seed the demo pack with <span className="font-mono">npm run db:seed:workflows</span> — it includes the
            21-day WhatsApp nurture sequence (Day 0/3/5/7/10/14/18/21).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    <Route className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{s.code}</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                  {s.stepCount} steps
                </span>
              </div>
              {s.description && <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>}
              <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" /> Trigger: {s.triggerEvent.replace(/_/g, " ")}
                </span>
                <span>Updated {formatDateTime(s.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
