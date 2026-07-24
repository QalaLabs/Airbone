"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { BookOpen, Award, ClipboardCheck, ArrowRight, Megaphone, Sparkles, ChevronRight } from "lucide-react";

interface MePayload {
  student: { id: string; firstName: string; lastName: string; studentCode: string };
  enrollments: Array<{
    id: string; courseId: string;
    course: { id: string; title: string; slug: string };
  }>;
  progress: Array<{ topicId: string; completed: boolean; percent: number }>;
  assessments: Array<{ moduleId: string; status: string; score: number; attempts: number }>;
  certificates: Array<{ id: string; title: string; certificateNo: string; issuedAt?: string | null; course?: { title: string } }>;
  attendance: Array<{ id: string; status: string; markedAt?: string; session?: { title: string; heldAt: string } }>;
  attendancePercent: number;
  completedTopics: number;
  announcements: Array<{ id: string; title: string; body: string; publishedAt: string | null; courseId?: string | null }>;
  bookmarks: Array<{ id: string; topic: { id: string; title: string } }>;
  quizAttempts: Array<{ moduleId: string; score: number; passed: boolean; createdAt: string }>;
}

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#c8102e" strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: number | string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="h-4 w-4 text-[#c8102e]" />
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-white/30">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />;
}

export default function PortalDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="grid gap-3 sm:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
        <p className="font-medium text-red-200">Could not load portal data</p>
        <p className="mt-1 text-red-200/70">{(error as Error).message}</p>
        <p className="mt-2 text-white/50">
          Staff must provision portal access (link CRM Student → User) before login works fully.
        </p>
        <button type="button" className="mt-3 underline text-white/70 hover:text-white" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const passedTests = data?.assessments.filter((a) => a.status === "PASS").length ?? 0;

  // Continue learning: first incomplete enrolled course topic (heuristic)
  const firstEnrollment = data?.enrollments[0];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          {data?.student.firstName} {data?.student.lastName}
        </h1>
        <p className="mt-1 text-sm text-white/55">Student ID: {data?.student.studentCode}</p>
      </section>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled courses" value={data?.enrollments.length ?? 0} icon={BookOpen} />
        <StatCard
          label="Topics completed"
          value={data?.completedTopics ?? 0}
          icon={ClipboardCheck}
        />
        <StatCard label="Assessments passed" value={passedTests} icon={Award} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <ProgressRing value={data?.attendancePercent ?? 0} />
            <span className="absolute text-xs font-bold text-white">{data?.attendancePercent ?? 0}%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Attendance</p>
            <p className="text-xs text-white/50">{data?.attendance.length ?? 0} sessions logged</p>
          </div>
        </div>
      </section>

      {/* Continue Learning */}
      {firstEnrollment && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Continue learning</h2>
          </div>
          <Link
            href={`/portal/courses/${firstEnrollment.courseId}`}
            className="mt-3 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07] transition-colors group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c8102e]/20">
              <BookOpen className="h-5 w-5 text-[#c8102e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{firstEnrollment.course.title}</p>
              <p className="mt-0.5 text-xs text-white/50">
                {data?.completedTopics ?? 0} topics completed
              </p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#c8102e]" style={{ width: "0%" }} />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
          </Link>
        </section>
      )}

      {/* My Courses */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">My courses</h2>
          <Link href="/portal/courses" className="text-xs text-white/50 hover:text-white flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {(data?.enrollments.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-2 text-sm text-white/50">No courses enrolled yet. Contact your instructor.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {data?.enrollments.slice(0, 3).map((e) => (
              <Link
                key={e.id}
                href={`/portal/courses/${e.courseId}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-[#c8102e] shrink-0" />
                  <span className="text-sm text-white/90">{e.course.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Announcements */}
      {(data?.announcements.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#c8102e]" /> Announcements
          </h2>
          <div className="space-y-2">
            {data?.announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{a.title}</p>
                <p className="mt-1 text-sm text-white/60 line-clamp-2">{a.body}</p>
                {a.publishedAt && (
                  <p className="mt-1.5 text-[10px] text-white/30">
                    {new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bookmarks */}
      {(data?.bookmarks.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">Bookmarked topics</h2>
          <div className="flex flex-wrap gap-2">
            {data?.bookmarks.map((b) => (
              <span key={b.id} className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                {b.topic.title}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {(data?.certificates.length ?? 0) > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Certificates</h2>
            <Link href="/portal/certificates" className="text-xs text-white/50 hover:text-white">View all</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {data?.certificates.slice(0, 2).map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                <Award className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{c.title}</p>
                  <p className="text-xs text-white/50">{c.course?.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI shortcut */}
      <section>
        <Link
          href="/portal/assistant"
          className="flex items-center gap-3 rounded-2xl border border-[#c8102e]/25 bg-[#c8102e]/[0.06] p-4 hover:bg-[#c8102e]/[0.10] transition-colors"
        >
          <Sparkles className="h-5 w-5 text-[#c8102e]" />
          <div>
            <p className="font-medium text-white">AI Study Assistant</p>
            <p className="text-xs text-white/50">Ask about DGCA topics, nav, air law…</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-white/30" />
        </Link>
      </section>
    </div>
  );
}
