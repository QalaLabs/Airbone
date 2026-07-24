"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ClipboardCheck, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MePayload {
  attendance: Array<{
    id: string;
    status: string;
    markedAt?: string;
    session?: { title: string; heldAt: string; courseId: string };
  }>;
  attendancePercent: number;
}

interface AttendanceBreakdown {
  overallPercent: number;
  overallTotal: number;
  overallPresent: number;
  monthly: Array<{ month: string; percent: number; total: number; present: number }>;
  bySubject: Array<{ subject: string; percent: number; total: number; present: number }>;
}

const STATUS_STYLE: Record<string, string> = {
  PRESENT: "bg-emerald-500/15 text-emerald-400",
  LATE: "bg-amber-500/15 text-amber-400",
  ABSENT: "bg-red-500/15 text-red-400",
  EXCUSED: "bg-blue-500/15 text-blue-400",
};

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default function PortalAttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  const { data: breakdown, isLoading: loadingBreakdown } = useQuery({
    queryKey: ["lms-attendance-breakdown"],
    queryFn: () => apiFetch<AttendanceBreakdown>("/lms/me/attendance-breakdown"),
  });

  const records = data?.attendance ?? [];
  const percent = breakdown?.overallPercent ?? data?.attendancePercent ?? 0;
  const present = breakdown?.overallPresent ?? records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const total = breakdown?.overallTotal ?? records.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Attendance</h1>
        <p className="mt-1 text-sm text-white/50">Your lecture attendance history and breakdown</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{percent}%</p>
          <p className="mt-1 text-xs text-white/50">Overall attendance</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{present}</p>
          <p className="mt-1 text-xs text-white/50">Sessions attended</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{total}</p>
          <p className="mt-1 text-xs text-white/50">Total sessions</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-full bg-white/10 h-2">
        <div
          className={cn("h-full rounded-full transition-all", percent >= 75 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500")}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent < 75 && (
        <p className="text-xs text-amber-400">
          Your attendance is below 75%. Please attend sessions regularly to remain eligible for assessments.
        </p>
      )}

      {!loadingBreakdown && breakdown && (
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart3 className="h-4 w-4 text-[#c8102e]" />
              Monthly breakdown
            </h2>
            {breakdown.monthly.length === 0 ? (
              <p className="text-xs text-white/40">No monthly data yet.</p>
            ) : (
              <div className="space-y-2">
                {breakdown.monthly.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs text-white/50">{formatMonth(m.month)}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[#c8102e]" style={{ width: `${m.percent}%` }} />
                    </div>
                    <span className="text-xs text-white/60 w-16 text-right">{m.percent}% ({m.present}/{m.total})</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart3 className="h-4 w-4 text-[#c8102e]" />
              By subject
            </h2>
            {breakdown.bySubject.length === 0 ? (
              <p className="text-xs text-white/40">No subject data yet.</p>
            ) : (
              <div className="space-y-2">
                {breakdown.bySubject.map((s) => (
                  <div key={s.subject} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-xs text-white/50">{s.subject}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.percent}%` }} />
                    </div>
                    <span className="text-xs text-white/60 w-16 text-right">{s.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.03]" />)}
        </div>
      )}

      {!isLoading && (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center">
                    <ClipboardCheck className="mx-auto h-8 w-8 text-white/15" />
                    <p className="mt-2 text-sm text-white/40">No attendance sessions logged yet.</p>
                  </td>
                </tr>
              )}
              {records.map((a) => (
                <tr key={a.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/80">{a.session?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {a.session?.heldAt
                      ? new Date(a.session.heldAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", STATUS_STYLE[a.status] ?? "text-white/50")}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
