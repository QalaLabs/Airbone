"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

interface Analytics {
  days: number;
  totals: {
    in: number;
    out: number;
    sent: number;
    failed: number;
    deliveryRate: number | null;
  };
  byDay: { day: string; direction: string; count: number }[];
  topTemplates: { templateName: string | null; count: number }[];
  engagement: {
    conversationsContacted: number;
    conversationsReplied: number;
    responseRate: number | null;
    optedOutConversations: number;
  };
  sequences: {
    code: string;
    name: string;
    started: number;
    completed: number;
    stopped: number;
    failed: number;
  }[];
  attribution: {
    enrolledTotal: number;
    enrolledWithWhatsApp: number;
    whatsappShare: number | null;
  };
}

export default function WhatsAppAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "analytics"],
    queryFn: () => apiFetch<Analytics>("/whatsapp/analytics?days=7"),
  });

  const maxDayCount = Math.max(1, ...(data?.byDay ?? []).map((d) => d.count));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">Last {data?.days ?? 7} days of WhatsApp activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sent", value: data?.totals.sent ?? 0, tone: "text-emerald-400" },
          { label: "Failed", value: data?.totals.failed ?? 0, tone: "text-rose-400" },
          { label: "Received", value: data?.totals.in ?? 0, tone: "text-violet-400" },
          {
            label: "Delivery rate",
            value: data?.totals.deliveryRate === null || data === undefined ? "—" : `${data.totals.deliveryRate}%`,
            tone: "text-sky-400",
          },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <p className={`text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Response rate", value: data?.engagement.responseRate === null || data === undefined ? "—" : `${data.engagement.responseRate}%`, tone: "text-emerald-400" },
          { label: "Conversations replied", value: data?.engagement.conversationsReplied ?? 0, tone: "text-white" },
          { label: "Opted out (all time)", value: data?.engagement.optedOutConversations ?? 0, tone: "text-rose-400" },
          {
            label: "WhatsApp share of enrollments",
            value: data?.attribution.whatsappShare === null || data === undefined ? "—" : `${data.attribution.whatsappShare}%`,
            tone: "text-sky-400",
          },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <p className={`text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Sequence funnel</h2>
          {!data?.sequences.length ? (
            <p className="text-xs text-muted-foreground text-center py-8 font-semibold">
              No WhatsApp workflow runs in this window yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.sequences.map((s) => (
                <div key={s.code} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-white truncate">{s.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">{s.code}</span>
                  </div>
                  <div className="flex h-5 overflow-hidden rounded-lg border border-white/10">
                    {s.completed > 0 && (
                      <div className="bg-emerald-500/70" style={{ width: `${(s.completed / s.started) * 100}%` }} title={`${s.completed} completed`} />
                    )}
                    {s.stopped > 0 && (
                      <div className="bg-slate-500/60" style={{ width: `${(s.stopped / s.started) * 100}%` }} title={`${s.stopped} stopped (enrolled / opted out)`} />
                    )}
                    {s.failed > 0 && (
                      <div className="bg-rose-500/70" style={{ width: `${(s.failed / s.started) * 100}%` }} title={`${s.failed} failed`} />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                    <span>{s.started} started</span>
                    <span className="text-emerald-400">{s.completed} completed</span>
                    <span>{s.stopped} stopped</span>
                    {s.failed > 0 && <span className="text-rose-400">{s.failed} failed</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Enrollment attribution</h2>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-extrabold text-white">{data?.attribution.enrolledWithWhatsApp ?? 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-semibold">
                of {data?.attribution.enrolledTotal ?? 0} enrolled leads have a WhatsApp conversation
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary shrink-0" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-white/10 pt-3">
            Attribution is conversational, not last-click: it counts enrolled leads that were ever reached on
            WhatsApp. Pair it with the response rate above to judge sequence quality.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Messages per day</h2>
          {!data?.byDay.length ? (
            <p className="text-xs text-muted-foreground text-center py-8 font-semibold">No message traffic yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(
                data.byDay.reduce<Record<string, number>>((acc, d) => {
                  acc[d.day] = (acc[d.day] ?? 0) + d.count;
                  return acc;
                }, {}),
              ).map(([day, count]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground w-20 shrink-0">{day.slice(5)}</span>
                  <div className="flex-1 h-4 rounded-lg bg-secondary/30 overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-primary to-emerald-500"
                      style={{ width: `${Math.round((count / maxDayCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Top templates</h2>
          {!data?.topTemplates.length ? (
            <div className="text-center py-8 space-y-2">
              <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground font-semibold">No templated sends yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.topTemplates.map((t) => (
                <div key={t.templateName} className="flex items-center justify-between text-xs p-3 rounded-xl bg-secondary/30 border border-white/5">
                  <span className="font-mono text-white truncate">{t.templateName}</span>
                  <span className="font-bold text-primary shrink-0 ml-3">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
