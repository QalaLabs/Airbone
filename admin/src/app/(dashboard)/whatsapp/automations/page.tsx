"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Workflow, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface Automation {
  id: string;
  name: string;
  code: string | null;
  triggerEvent: string;
  updatedAt: string;
}

export default function WhatsAppAutomationsPage() {
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
          Active workflows that send WhatsApp messages or react to WhatsApp events
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !automations.length ? (
        <div className="glass-card rounded-2xl p-12 border border-white/10 text-center space-y-2">
          <Workflow className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-white">No WhatsApp automations yet</p>
          <p className="text-xs text-muted-foreground">
            Create a workflow with a SEND_WHATSAPP step or seed the demo pack with{" "}
            <span className="font-mono">npm run db:seed:workflows</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((a) => (
            <Link
              key={a.id}
              href="/settings"
              className="glass-card rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:border-primary/40 transition-colors group"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Workflow className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{a.name}</p>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                  Trigger: {a.triggerEvent.replace(/_/g, " ")}
                  {a.code ? ` · ${a.code}` : ""}
                </p>
              </div>
              <span className="hidden sm:block text-[10px] text-muted-foreground font-semibold shrink-0">
                {formatDateTime(a.updatedAt)}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
