"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { ClipboardCheck, Plus, X, Check, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface LmsCourse { id: string; title: string; slug: string }
interface BatchRow { id: string; name: string; type: string }
interface Enrollment {
  id: string; studentId: string; status: string;
  student: { id: string; firstName: string; lastName: string; studentCode: string; email: string };
}
interface AttSession {
  id: string;
  title: string;
  heldAt: string;
  subjectTag?: string | null;
  batch?: { id: string; name: string } | null;
  records: Array<{
    id: string;
    status: string;
    notes?: string | null;
    student: { firstName: string; lastName: string; studentCode: string };
  }>;
}

type AttStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface StudentRecord {
  status: AttStatus;
  notes: string;
}

const STATUS_COLORS: Record<AttStatus, string> = {
  PRESENT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  LATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ABSENT: "bg-red-500/15 text-red-400 border-red-500/30",
  EXCUSED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default function LmsAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = React.useState("");
  const [batchId, setBatchId] = React.useState("");
  const [subjectTag, setSubjectTag] = React.useState("");
  const [sessionTitle, setSessionTitle] = React.useState("");
  const [heldAt, setHeldAt] = React.useState(new Date().toISOString().slice(0, 16));
  const [records, setRecords] = React.useState<Record<string, StudentRecord>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  const { data: courses } = useQuery({
    queryKey: ["lms-courses"],
    queryFn: () => apiFetch<LmsCourse[]>("/lms/courses"),
  });

  const { data: batches } = useQuery({
    queryKey: ["lms-batches", selectedCourseId],
    queryFn: () => apiFetch<BatchRow[]>(`/lms/batches?courseId=${selectedCourseId}`),
    enabled: !!selectedCourseId,
  });

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["lms-enrollments", selectedCourseId],
    queryFn: () => apiFetch<Enrollment[]>(`/lms/enrollments?courseId=${selectedCourseId}`),
    enabled: !!selectedCourseId,
  });

  const { data: history } = useQuery({
    queryKey: ["lms-attendance-history", selectedCourseId, batchId],
    queryFn: () => {
      const params = new URLSearchParams({ courseId: selectedCourseId });
      if (batchId) params.set("batchId", batchId);
      return apiFetch<AttSession[]>(`/lms/attendance?${params}`);
    },
    enabled: !!selectedCourseId && showHistory,
  });

  React.useEffect(() => {
    if (enrollments) {
      const initial: Record<string, StudentRecord> = {};
      enrollments.filter((e) => e.status === "ACTIVE").forEach((e) => {
        initial[e.studentId] = { status: "PRESENT", notes: "" };
      });
      setRecords(initial);
      setSubmitted(false);
    }
  }, [enrollments]);

  React.useEffect(() => {
    setBatchId("");
  }, [selectedCourseId]);

  const markMutation = useMutation({
    mutationFn: () =>
      apiFetch("/lms/attendance", {
        method: "POST",
        body: JSON.stringify({
          courseId: selectedCourseId,
          batchId: batchId || null,
          subjectTag: subjectTag || null,
          title: sessionTitle,
          heldAt: new Date(heldAt).toISOString(),
          records: Object.entries(records).map(([studentId, rec]) => ({
            studentId,
            status: rec.status,
            notes: rec.notes || undefined,
          })),
        }),
      }),
    onSuccess: () => {
      toast({ title: "Attendance saved" });
      setSessionTitle("");
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ["lms-enrollments", selectedCourseId] });
      void queryClient.invalidateQueries({ queryKey: ["lms-attendance-history", selectedCourseId] });
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const activeStudents = (enrollments ?? []).filter((e) => e.status === "ACTIVE");
  const presentCount = Object.values(records).filter((s) => s.status === "PRESENT" || s.status === "LATE").length;

  function setAllStatus(status: AttStatus) {
    const updated: Record<string, StudentRecord> = {};
    activeStudents.forEach((e) => { updated[e.studentId] = { status, notes: records[e.studentId]?.notes ?? "" }; });
    setRecords(updated);
  }

  function setStatus(studentId: string, status: AttStatus) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { status, notes: prev[studentId]?.notes ?? "" },
    }));
  }

  function setNotes(studentId: string, notes: string) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { status: prev[studentId]?.status ?? "PRESENT", notes },
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark lecture session attendance for enrolled students."
        action={
          selectedCourseId ? (
            <Button variant="outline" size="sm" onClick={() => setShowHistory((v) => !v)}>
              <History className="mr-1.5 h-4 w-4" />
              {showHistory ? "Hide history" : "Show history"}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <div>
          <label className="text-xs text-muted-foreground">Batch (optional)</label>
          <select
            className="mt-1 h-9 w-full rounded-lg border border-border bg-secondary/60 px-3 text-sm"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            disabled={!selectedCourseId}
          >
            <option value="">All batches</option>
            {(batches ?? []).map((b) => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Subject tag (optional)</label>
          <Input className="mt-1" placeholder="e.g. Navigation" value={subjectTag} onChange={(e) => setSubjectTag(e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Session title</label>
          <Input className="mt-1" placeholder="e.g. Navigation & Charts — Lecture 3" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Date & time</label>
          <Input type="datetime-local" className="mt-1" value={heldAt} onChange={(e) => setHeldAt(e.target.value)} />
        </div>
      </div>

      {showHistory && selectedCourseId && (
        <div className="space-y-2 rounded-xl border border-border bg-card/40 p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4" /> Attendance history
          </h3>
          {(history ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(history ?? []).map((s) => (
                <div key={s.id} className="rounded-lg border border-border bg-card/60 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.heldAt).toLocaleString("en-IN")}
                        {s.batch ? ` · ${s.batch.name}` : ""}
                        {s.subjectTag ? ` · ${s.subjectTag}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.records.length} records</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-card/60 text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-left">Code</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-left">Notes / reason</th>
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
                                onClick={() => setStatus(e.studentId, s)}
                                className={cn(
                                  "rounded-md border px-2 py-1 text-[10px] font-bold uppercase transition-colors",
                                  records[e.studentId]?.status === s ? STATUS_COLORS[s] : "border-border text-muted-foreground/50 hover:border-muted-foreground/50",
                                )}
                              >
                                {s === "EXCUSED" ? "EXC" : s.slice(0, 4)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Input
                            className="h-7 text-xs"
                            placeholder="Optional note"
                            value={records[e.studentId]?.notes ?? ""}
                            onChange={(ev) => setNotes(e.studentId, ev.target.value)}
                          />
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
