"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ClipboardCheck } from "lucide-react";
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

const STATUS_STYLE: Record<string, string> = {
  PRESENT: "bg-emerald-500/15 text-emerald-400",
  LATE: "bg-amber-500/15 text-amber-400",
  ABSENT: "bg-red-500/15 text-red-400",
  EXCUSED: "bg-blue-500/15 text-blue-400",
};

export default function PortalAttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  const records = data?.attendance ?? [];
  const percent = data?.attendancePercent ?? 0;
  const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Attendance</h1>
        <p className="mt-1 text-sm text-white/50">Your lecture attendance history</p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{percent}%</p>
          <p className="mt-1 text-xs text-white/50">Attendance rate</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{present}</p>
          <p className="mt-1 text-xs text-white/50">Sessions attended</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-bold text-white">{records.length}</p>
          <p className="mt-1 text-xs text-white/50">Total sessions</p>
        </div>
      </div>

      {/* Progress bar */}
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

      {isLoading && (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.03]" />)}
        </div>
      )}

      {/* Records table */}
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
