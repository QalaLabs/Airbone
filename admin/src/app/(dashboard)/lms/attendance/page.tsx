"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { ClipboardCheck, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LmsCourse { id: string; title: string; slug: string }
interface Enrollment {
  id: string; studentId: string; status: string;
  student: { id: string; firstName: string; lastName: string; studentCode: string; email: string };
}

type AttStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

const STATUS_COLORS: Record<AttStatus, string> = {
  PRESENT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  LATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ABSENT: "bg-red-500/15 text-red-400 border-red-500/30",
  EXCUSED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default function LmsAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = React.useState("");
  const [sessionTitle, setSessionTitle] = React.useState("");
  const [heldAt, setHeldAt] = React.useState(new Date().toISOString().slice(0, 16));
  const [records, setRecords] = React.useState<Record<string, AttStatus>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const { data: courses } = useQuery({
    queryKey: ["lms-courses"],
    queryFn: () => apiFetch<LmsCourse[]>("/lms/courses"),
  });

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["lms-enrollments", selectedCourseId],
    queryFn: () => apiFetch<Enrollment[]>(`/lms/enrollments?courseId=${selectedCourseId}`),
    enabled: !!selectedCourseId,
  });

  React.useEffect(() => {
    if (enrollments) {
      const initial: Record<string, AttStatus> = {};
      enrollments.filter((e) => e.status === "ACTIVE").forEach((e) => {
        initial[e.studentId] = "PRESENT";
      });
      setRecords(initial);
      setSubmitted(false);
    }
  }, [enrollments]);

  const markMutation = useMutation({
    mutationFn: () =>
      apiFetch("/lms/attendance", {
        method: "POST",
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: sessionTitle,
          heldAt: new Date(heldAt).toISOString(),
          records: Object.entries(records).map(([studentId, status]) => ({ studentId, status })),
        }),
      }),
    onSuccess: () => {
      toast({ title: "Attendance saved" });
      setSessionTitle("");
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ["lms-enrollments", selectedCourseId] });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const activeStudents = (enrollments ?? []).filter((e) => e.status === "ACTIVE");
  const presentCount = Object.values(records).filter((s) => s === "PRESENT" || s === "LATE").length;

  function setAllStatus(status: AttStatus) {
    const updated: Record<string, AttStatus> = {};
    activeStudents.forEach((e) => { updated[e.studentId] = status; });
    setRecords(updated);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark lecture session attendance for enrolled students."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Course selector */}
        <div>
          <label className="text-xs text-muted-foreground">Course</label>
          <select
            className="mt-1 h-9 w-full rounded-lg border border-border bg-secondary/60 px-3 text-sm"
            value={selectedCourseId}
            onChange={(e) => { setSelectedCourseId(e.target.value); setSubmitted(false); }}
          >
            <option value="">Select course…</option>
            {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {/* Session title */}
        <div>
          <label className="text-xs text-muted-foreground">Session title</label>
          <Input className="mt-1" placeholder="e.g. Navigation & Charts — Lecture 3" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
        </div>

        {/* Date time */}
        <div>
          <label className="text-xs text-muted-foreground">Date & time</label>
          <Input type="datetime-local" className="mt-1" value={heldAt} onChange={(e) => setHeldAt(e.target.value)} />
        </div>
      </div>

      {selectedCourseId && (
        <div className="space-y-3">
          {loadingEnrollments ? (
            <div className="space-y-1.5">
              {[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-card/40" />)}
            </div>
          ) : activeStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No active students enrolled. Enroll students first via the LMS course builder.
            </div>
          ) : (
            <>
              {/* Summary + quick-mark */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {activeStudents.length} students · {presentCount} present/late
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAllStatus("PRESENT")}>
                    <Check className="mr-1 h-3 w-3" /> All present
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAllStatus("ABSENT")}>
                    <X className="mr-1 h-3 w-3" /> All absent
                  </Button>
                </div>
              </div>

              {/* Student roster */}
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-card/60 text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-left">Code</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((e) => (
                      <tr key={e.studentId} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          <p className="font-medium">{e.student.firstName} {e.student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{e.student.email}</p>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{e.student.studentCode}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-center gap-1.5">
                            {(["PRESENT", "LATE", "ABSENT", "EXCUSED"] as AttStatus[]).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setRecords((prev) => ({ ...prev, [e.studentId]: s }))}
                                className={cn(
                                  "rounded-md border px-2 py-1 text-[10px] font-bold uppercase transition-colors",
                                  records[e.studentId] === s ? STATUS_COLORS[s] : "border-border text-muted-foreground/50 hover:border-muted-foreground/50",
                                )}
                              >
                                {s === "EXCUSED" ? "EXC" : s.slice(0, 4)}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={!sessionTitle || Object.keys(records).length === 0 || markMutation.isPending || submitted}
                  onClick={() => markMutation.mutate()}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {markMutation.isPending ? "Saving…" : submitted ? "Saved ✓" : "Save attendance"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
