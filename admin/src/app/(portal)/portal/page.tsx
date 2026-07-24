"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  BookOpen,
  Award,
  ClipboardCheck,
  ArrowRight,
  Megaphone,
  Sparkles,
  ChevronRight,
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { MePayload } from "@/components/portal/types";
import { ProgressRing } from "@/components/portal/progress-ring";
import { DashboardSkeleton } from "@/components/portal/portal-skeleton";
import { cn } from "@/lib/utils";

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        accent
          ? "border-[#c8102e]/25 bg-[#c8102e]/[0.06] hover:bg-[#c8102e]/[0.10]"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]",
      )}
    >
      <Icon className={cn("h-4 w-4", accent ? "text-[#c8102e]" : "text-[#c8102e]")} aria-hidden="true" />
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/50">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-white/30">{sub}</p>}
    </div>
  );
}

// ─── Continue Learning Card ──────────────────────────────────────────────────

function ContinueLearningCard({ data }: { data: MePayload }) {
  const cl = data.continueLearning;
  const firstEnrollment = data.enrollments[0];

  if (!cl && !firstEnrollment) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-white/20" aria-hidden="true" />
        <p className="mt-2 font-medium text-white/60">No courses enrolled yet</p>
        <p className="mt-1 text-sm text-white/35">Contact your instructor to get started.</p>
      </div>
    );
  }

  const courseId = cl?.courseId ?? firstEnrollment?.courseId ?? "";
  const courseTitle = cl?.courseTitle ?? firstEnrollment?.course.title ?? "Course";
  const pct = cl?.percentComplete ?? firstEnrollment?.percentComplete ?? 0;

  return (
    <Link
      href={`/portal/courses/${courseId}`}
      className="group flex items-center gap-5 rounded-2xl border border-[#c8102e]/25 bg-gradient-to-r from-[#c8102e]/[0.08] to-[#0a1a30] p-5 transition-all hover:border-[#c8102e]/50 hover:from-[#c8102e]/[0.14]"
      aria-label={`Continue ${courseTitle} — ${pct}% complete`}
    >
      {/* Ring */}
      <div className="relative shrink-0">
        <ProgressRing value={pct} size={72} strokeWidth={5} label={`${pct}%`} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8102e]/80">
          Continue Learning
        </p>
        <p className="mt-1 truncate text-lg font-semibold text-white">{courseTitle}</p>
        <p className="mt-0.5 text-xs text-white/50">
          {pct === 0 ? "Start your first topic" : pct === 100 ? "Course complete — well done!" : `${pct}% complete`}
        </p>
        {/* Progress bar */}
        <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#c8102e] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="shrink-0">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-[#a00d25] transition-colors">
          Resume
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

// ─── Upcoming Assessments ────────────────────────────────────────────────────

function UpcomingAssessments({ data }: { data: MePayload }) {
  const upcoming = data.assessments.filter(
    (a) => a.status !== "PASS" && a.attempts < a.module.maxAttempts,
  );

  if (upcoming.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="upcoming-heading">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-amber-400" aria-hidden="true" />
        <h2 id="upcoming-heading" className="text-base font-semibold text-white">
          Upcoming Assessments
        </h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
          {upcoming.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {upcoming.slice(0, 4).map((a) => {
          const attemptsLeft = a.module.maxAttempts - a.attempts;
          return (
            <div
              key={a.moduleId}
              className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{a.module.title}</p>
                <p className="mt-0.5 text-[11px] text-white/50">
                  Pass ≥ {a.module.passPercent}% · {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left
                </p>
                {a.attempts > 0 && (
                  <p className="mt-0.5 text-[11px] text-amber-400/80">Last score: {a.score}%</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Recent Activity ─────────────────────────────────────────────────────────

function RecentActivity({ data }: { data: MePayload }) {
  type ActivityItem = {
    id: string;
    type: "progress" | "quiz" | "attendance";
    label: string;
    sub: string;
    date: string;
    pass?: boolean;
  };

  const items: ActivityItem[] = [];

  data.quizAttempts.slice(0, 3).forEach((qa) => {
    items.push({
      id: `qa-${qa.moduleId}-${qa.createdAt}`,
      type: "quiz",
      label: `Assessment attempt`,
      sub: `Score: ${qa.score}% · ${qa.passed ? "Passed" : "Not passed"}`,
      date: qa.createdAt,
      pass: qa.passed,
    });
  });

  data.attendance.slice(0, 3).forEach((att) => {
    items.push({
      id: att.id,
      type: "attendance",
      label: att.session?.title ?? "Session attended",
      sub: att.status,
      date: att.markedAt ?? att.session?.heldAt ?? "",
      pass: att.status === "PRESENT" || att.status === "LATE",
    });
  });

  items.sort((a, b) => (b.date > a.date ? 1 : -1));
  const recent = items.slice(0, 6);

  if (recent.length === 0) return null;

  const iconMap = {
    progress: <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
    quiz: <FileText className="h-4 w-4 text-[#c8102e]" aria-hidden="true" />,
    attendance: <ClipboardCheck className="h-4 w-4 text-blue-400" aria-hidden="true" />,
  };

  return (
    <section className="space-y-3" aria-labelledby="activity-heading">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-white/50" aria-hidden="true" />
        <h2 id="activity-heading" className="text-base font-semibold text-white">Recent Activity</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        {recent.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm",
              i !== 0 && "border-t border-white/5",
            )}
          >
            <div className="shrink-0">{iconMap[item.type]}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-white/80">{item.label}</p>
              <p className="text-[11px] text-white/40">{item.sub}</p>
            </div>
            {item.date && (
              <p className="shrink-0 text-[10px] text-white/30">
                {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── My Courses List ─────────────────────────────────────────────────────────

function MyCoursesList({ data }: { data: MePayload }) {
  return (
    <section className="space-y-3" aria-labelledby="courses-heading">
      <div className="flex items-center justify-between">
        <h2 id="courses-heading" className="text-base font-semibold text-white">My Courses</h2>
        <Link
          href="/portal/courses"
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      {data.enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-white/20" aria-hidden="true" />
          <p className="mt-2 text-sm text-white/50">No courses enrolled yet. Contact your instructor.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {data.enrollments.slice(0, 4).map((e) => (
            <Link
              key={e.id}
              href={`/portal/courses/${e.courseId}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-colors"
            >
              <div className="shrink-0">
                <ProgressRing value={e.percentComplete} size={36} strokeWidth={3.5} label={`${e.percentComplete}%`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/90">{e.course.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {e.percentComplete === 100 ? "Completed" : e.percentComplete === 0 ? "Not started" : `${e.percentComplete}% complete`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/25" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Announcements ──────────────────────────────────────────────────────────

function AnnouncementsSection({ data }: { data: MePayload }) {
  if (data.announcements.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="ann-heading">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-[#c8102e]" aria-hidden="true" />
        <h2 id="ann-heading" className="text-base font-semibold text-white">Announcements</h2>
      </div>
      <div className="space-y-2">
        {data.announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium text-white">{a.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-white/60">{a.body}</p>
            {a.publishedAt && (
              <p className="mt-1.5 text-[10px] text-white/30">
                {new Date(a.publishedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Certificates Strip ──────────────────────────────────────────────────────

function CertificatesStrip({ data }: { data: MePayload }) {
  if (data.certificates.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="certs-heading">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <h2 id="certs-heading" className="text-base font-semibold text-white">
            Certificates Earned
          </h2>
        </div>
        <Link href="/portal/certificates" className="text-xs text-white/50 hover:text-white transition-colors">
          View all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {data.certificates.slice(0, 4).map((c) => (
          <div
            key={c.id}
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3"
          >
            <Award className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-white">{c.title}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{c.course?.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function PortalDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm">
        <p className="font-semibold text-red-200">Could not load portal data</p>
        <p className="mt-1 text-red-200/70">{(error as Error).message}</p>
        <p className="mt-2 text-white/50 text-xs">
          Staff must provision portal access (link CRM Student → User) before this dashboard loads.
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const passedCount = data.assessments.filter((a) => a.status === "PASS").length;
  const hasActivity =
    data.quizAttempts.length > 0 || data.attendance.length > 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
          Welcome back
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          {data.student.firstName} {data.student.lastName}
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Student ID: <span className="font-mono">{data.student.studentCode}</span>
        </p>
      </section>

      {/* Stats row */}
      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Key statistics"
      >
        <StatCard
          label="Enrolled courses"
          value={data.enrollments.length}
          icon={BookOpen}
        />
        <StatCard
          label="Topics completed"
          value={data.completedTopics}
          icon={CheckCircle2}
        />
        <StatCard
          label="Assessments passed"
          value={passedCount}
          icon={Award}
        />
        {/* Attendance ring card */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06] transition-colors">
          <ProgressRing
            value={data.attendancePercent}
            size={56}
            strokeWidth={4.5}
            label={`${data.attendancePercent}%`}
            color={
              data.attendancePercent >= 75
                ? "#34d399"
                : data.attendancePercent >= 50
                  ? "#f59e0b"
                  : "#c8102e"
            }
          />
          <div>
            <p className="text-sm font-semibold text-white">Attendance</p>
            <p className="mt-0.5 text-xs text-white/50">
              {data.attendance.length} session{data.attendance.length !== 1 ? "s" : ""} logged
            </p>
            {data.attendancePercent < 75 && (
              <p className="mt-0.5 text-[10px] text-amber-400/80">Below 75%</p>
            )}
          </div>
        </div>
      </section>

      {/* Continue Learning hero */}
      <section aria-labelledby="cl-heading">
        <h2 id="cl-heading" className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
          <Clock className="h-4 w-4 text-[#c8102e]" aria-hidden="true" />
          Resume Where You Left Off
        </h2>
        <ContinueLearningCard data={data} />
      </section>

      {/* Upcoming Assessments */}
      <UpcomingAssessments data={data} />

      {/* Progress link */}
      <div className="flex gap-3">
        <Link
          href="/portal/progress"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <BarChart3 className="h-4 w-4 text-[#c8102e]" aria-hidden="true" />
          View full progress report
          <ChevronRight className="ml-auto h-4 w-4 text-white/30" aria-hidden="true" />
        </Link>
        <Link
          href="/portal/assistant"
          className="flex items-center gap-2 rounded-xl border border-[#c8102e]/25 bg-[#c8102e]/[0.06] px-4 py-3 text-sm text-white/70 hover:bg-[#c8102e]/[0.12] hover:text-white transition-colors"
        >
          <Sparkles className="h-4 w-4 text-[#c8102e]" aria-hidden="true" />
          AI Study Assistant
          <ChevronRight className="ml-auto h-4 w-4 text-white/30" aria-hidden="true" />
        </Link>
      </div>

      {/* Announcements */}
      <AnnouncementsSection data={data} />

      {/* Certificates strip */}
      <CertificatesStrip data={data} />

      {/* Recent activity */}
      {hasActivity && <RecentActivity data={data} />}

      {/* My Courses */}
      <MyCoursesList data={data} />
    </div>
  );
}
