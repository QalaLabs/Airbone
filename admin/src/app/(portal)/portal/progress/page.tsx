"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { MePayload } from "@/components/portal/types";
import { ProgressRing } from "@/components/portal/progress-ring";
import { CardSkeleton, TextSkeleton } from "@/components/portal/portal-skeleton";
import {
  BookOpen,
  Award,
  CheckCircle2,
  ClipboardCheck,
  BarChart3,
  ChevronRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ProgressSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading progress…">
      <div className="space-y-2">
        <TextSkeleton className="h-3 w-20" />
        <TextSkeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} className="h-32" />)}
      </div>
      <CardSkeleton className="h-48" />
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <Icon className={`h-5 w-5 ${color ?? "text-[#c8102e]"}`} aria-hidden="true" />
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-white/70">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-white/35">{sub}</p>}
    </div>
  );
}

export default function PortalProgressPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  if (isLoading) return <ProgressSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm">
        <p className="font-semibold text-red-200">Unable to load progress data</p>
        <p className="mt-1 text-red-200/60">Please try refreshing the page.</p>
      </div>
    );
  }

  const passedCount = data.assessments.filter((a) => a.status === "PASS").length;
  const totalAssessments = data.assessments.length;
  const presentCount = data.attendance.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE",
  ).length;

  // Compute streak: consecutive days with a quiz attempt or progress update
  // Use quizAttempts dates as a proxy for activity
  const activityDates = new Set(
    data.quizAttempts.map((qa) =>
      new Date(qa.createdAt).toDateString(),
    ),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (activityDates.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Upcoming assessments (not passed, attempts remaining)
  const upcomingAssessments = data.assessments.filter(
    (a) => a.status !== "PASS" && a.attempts < a.module.maxAttempts,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
          Progress Report
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          {data.student.firstName}&apos;s Progress
        </h1>
        <p className="mt-1 text-sm text-white/45">
          A snapshot of your learning journey at Airborne Aviation
        </p>
      </section>

      {/* Stat tiles */}
      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Progress statistics"
      >
        <StatTile
          icon={BookOpen}
          label="Courses enrolled"
          value={data.enrollments.length}
          sub={`${data.enrollments.filter((e) => e.percentComplete === 100).length} completed`}
        />
        <StatTile
          icon={CheckCircle2}
          label="Topics completed"
          value={data.completedTopics}
          color="text-emerald-400"
        />
        <StatTile
          icon={Award}
          label="Assessments passed"
          value={passedCount}
          sub={totalAssessments > 0 ? `${totalAssessments} total · ${Math.round((passedCount / totalAssessments) * 100)}% pass rate` : undefined}
          color="text-emerald-400"
        />
        <StatTile
          icon={ClipboardCheck}
          label="Attendance"
          value={`${data.attendancePercent}%`}
          sub={`${presentCount} of ${data.attendance.length} sessions`}
          color={data.attendancePercent >= 75 ? "text-emerald-400" : "text-amber-400"}
        />
        <StatTile
          icon={Award}
          label="Certificates earned"
          value={data.certificates.length}
          color="text-emerald-400"
        />
        {streak > 0 ? (
          <StatTile
            icon={TrendingUp}
            label="Activity streak"
            value={`${streak} day${streak !== 1 ? "s" : ""}`}
            sub="Consecutive days with activity"
            color="text-amber-400"
          />
        ) : (
          <StatTile
            icon={TrendingUp}
            label="Activity streak"
            value="—"
            sub="Complete an assessment to start your streak"
            color="text-white/30"
          />
        )}
      </section>

      {/* Per-course progress */}
      {data.enrollments.length > 0 && (
        <section className="space-y-4" aria-labelledby="course-progress-heading">
          <h2 id="course-progress-heading" className="flex items-center gap-2 text-base font-semibold text-white">
            <BarChart3 className="h-4 w-4 text-[#c8102e]" aria-hidden="true" />
            Course Progress
          </h2>
          <div className="space-y-3">
            {data.enrollments.map((e) => {
              const pct = e.percentComplete;
              return (
                <Link
                  key={e.id}
                  href={`/portal/courses/${e.courseId}`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 hover:bg-white/[0.06] transition-colors"
                >
                  <ProgressRing value={pct} size={52} strokeWidth={4.5} label={`${pct}%`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{e.course.title}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct === 100 ? "bg-emerald-500" : "bg-[#c8102e]",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {pct === 100
                        ? "Course complete"
                        : pct === 0
                          ? "Not started"
                          : `${pct}% complete`}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/25" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming assessments */}
      {upcomingAssessments.length > 0 && (
        <section className="space-y-3" aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="flex items-center gap-2 text-base font-semibold text-white">
            <FileText className="h-4 w-4 text-amber-400" aria-hidden="true" />
            Pending Assessments
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {upcomingAssessments.map((a) => (
              <div
                key={a.moduleId}
                className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4"
              >
                <p className="font-medium text-white">{a.module.title}</p>
                <p className="mt-1 text-xs text-white/50">
                  Pass ≥ {a.module.passPercent}%
                  &nbsp;·&nbsp; {a.module.maxAttempts - a.attempts} attempt
                  {a.module.maxAttempts - a.attempts !== 1 ? "s" : ""} remaining
                </p>
                {a.attempts > 0 && (
                  <p className="mt-0.5 text-xs text-amber-400/80">
                    Last score: {a.score}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Attendance warning */}
      {data.attendancePercent < 75 && data.attendance.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4 text-sm text-amber-300">
          <p className="font-semibold">Attendance below 75%</p>
          <p className="mt-1 text-amber-300/70">
            Your current attendance is {data.attendancePercent}%. Please attend sessions regularly to
            remain eligible for assessments and certification.
          </p>
        </div>
      )}

      {/* Certificates */}
      {data.certificates.length > 0 && (
        <section className="space-y-3" aria-labelledby="certs-progress-heading">
          <h2 id="certs-progress-heading" className="flex items-center gap-2 text-base font-semibold text-white">
            <Award className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            Certificates Earned
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.certificates.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4"
              >
                <Award className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{c.title}</p>
                  <p className="text-xs text-white/45">{c.course?.title}</p>
                  {c.issuedAt && (
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Issued{" "}
                      {new Date(c.issuedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/portal/certificates"
            className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
          >
            View all certificates <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}
