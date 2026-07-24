"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { MePayload } from "@/components/portal/types";
import {
  PortalPageHeader,
  GlassCard,
  EmptyState,
  MotionSection,
  StatTile,
  ProgressBar,
  StatusPill,
} from "@/components/portal/portal-ui";
import { TextSkeleton, CardSkeleton } from "@/components/portal/portal-skeleton";
import {
  User,
  Mail,
  Hash,
  BookOpen,
  Award,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";

export default function PortalProfilePage() {
  const { data: session } = useSession();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <TextSkeleton className="h-8 w-40" />
        <CardSkeleton className="h-48" />
      </div>
    );
  }

  if (isError || !data) {
    return <EmptyState icon={User} title="Unable to load profile" />;
  }

  const s = data.student;
  const initials = `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase() || "S";

  return (
    <MotionSection>
      <PortalPageHeader
        eyebrow="Cadet profile"
        title={`${s.firstName} ${s.lastName}`}
        description="Your academy identity, enrollment snapshot, and learning vitals."
      />

      <GlassCard hero className="mb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[var(--ab-red)] text-2xl font-bold text-white shadow-[0_12px_40px_var(--ab-red-glow)]">
            {initials}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="ab-display text-2xl text-white">
                {s.firstName} {s.lastName}
              </h2>
              <StatusPill tone="brand">Student</StatusPill>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-[var(--ab-gold)]" aria-hidden="true" />
                {s.studentCode}
              </span>
              {(s.email || session?.user?.email) && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[var(--ab-gold)]" aria-hidden="true" />
                  {s.email || session?.user?.email}
                </span>
              )}
            </div>
          </div>
          <Link href="/portal/assistant" className="ab-btn ab-btn-primary px-4 py-2.5">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Ask AI Tutor
          </Link>
        </div>
      </GlassCard>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatTile icon={BookOpen} label="Courses enrolled" value={data.enrollments.length} />
        <StatTile
          icon={ClipboardCheck}
          label="Attendance"
          value={`${data.attendancePercent}%`}
          accent
        />
        <StatTile icon={Award} label="Certificates" value={data.certificates.length} />
      </div>

      <GlassCard>
        <p className="ab-eyebrow mb-3">Learning vitals</p>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-white/50">Topics completed</span>
              <span className="font-semibold text-white">{data.completedTopics}</span>
            </div>
            <ProgressBar
              value={
                data.enrollments[0]?.percentComplete ??
                (data.completedTopics > 0 ? Math.min(100, data.completedTopics * 5) : 0)
              }
            />
          </div>
          {data.continueLearning && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                Continue learning
              </p>
              <p className="mt-1 text-sm font-medium text-white">{data.continueLearning.courseTitle}</p>
              <ProgressBar value={data.continueLearning.percentComplete} className="mt-2" />
            </div>
          )}
        </div>
      </GlassCard>
    </MotionSection>
  );
}
