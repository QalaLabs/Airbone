"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  CheckCircle2,
  Lock,
  FileText,
  Play,
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { PlayerPayload, FlatTopic, PlayerContent } from "@/components/portal/types";
import { CourseSidebar } from "@/components/portal/course-sidebar";
import { QuizModal } from "@/components/portal/quiz-modal";
import { PlayerSkeleton } from "@/components/portal/portal-skeleton";

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-[#c8102e] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${value}% complete`}
      />
    </div>
  );
}

// ─── Content Viewer ───────────────────────────────────────────────────────────

function ContentViewer({ content }: { content: PlayerContent }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-white/70">
          {content.type === "VIDEO" ? (
            <Play className="h-3.5 w-3.5 text-[#c8102e]" aria-hidden="true" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-[#c8102e]" aria-hidden="true" />
          )}
          <span className="font-medium">{content.title}</span>
          <span className="rounded-sm bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
            {content.type}
          </span>
          {content.duration && (
            <span className="text-white/30">{Math.round(content.duration / 60)} min</span>
          )}
        </div>
        {(content.type === "PDF" || content.type === "NOTES") && (
          <a
            href={content.url}
            target="_blank"
            rel="noreferrer"
            download
            className="flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[10px] text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            Download
          </a>
        )}
      </div>
      {content.type === "VIDEO" ? (
        <video
          controls
          className="max-h-[62vh] w-full bg-black"
          src={content.url}
          preload="metadata"
          aria-label={content.title}
        >
          <track kind="captions" />
        </video>
      ) : (
        <iframe
          title={content.title}
          src={content.url}
          className="h-[65vh] w-full bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}

// ─── Mobile Drawer Toggle ────────────────────────────────────────────────────

function MobileDrawerToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? "Close course outline" : "Open course outline"}
      className="lg:hidden flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
    >
      {open ? "Hide" : "Show"} Outline
      <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} aria-hidden="true" />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoursePlayerPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const queryClient = useQueryClient();

  const [activeTopicId, setActiveTopicId] = React.useState<string | null>(null);
  const [quizModuleId, setQuizModuleId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lms-player", courseId],
    queryFn: () => apiFetch<PlayerPayload>(`/lms/me/courses/${courseId}`),
  });

  const progressMap = React.useMemo(() => {
    const map = new Map<string, { completed: boolean; percent: number }>();
    data?.progress.forEach((p) => map.set(p.topicId, p));
    return map;
  }, [data?.progress]);

  const unlocked = React.useMemo(
    () => new Set(data?.unlockedModuleIds ?? []),
    [data?.unlockedModuleIds],
  );
  const bookmarked = React.useMemo(
    () => new Set(data?.bookmarkedTopicIds ?? []),
    [data?.bookmarkedTopicIds],
  );

  const flatTopics = React.useMemo<FlatTopic[]>(() => {
    const list: FlatTopic[] = [];
    data?.course.stages.forEach((stage) =>
      stage.modules.forEach((mod) => {
        const locked = !unlocked.has(mod.id);
        mod.chapters.forEach((ch) =>
          ch.topics.forEach((topic) =>
            list.push({
              topicId: topic.id,
              topicTitle: topic.title,
              moduleId: mod.id,
              moduleTitle: mod.title,
              chapterId: ch.id,
              chapterTitle: ch.title,
              stageTitle: stage.title,
              locked,
              contents: topic.contents,
            }),
          ),
        );
      }),
    );
    return list;
  }, [data, unlocked]);

  // Auto-select first incomplete unlocked topic
  React.useEffect(() => {
    if (!activeTopicId && flatTopics.length) {
      const resume =
        flatTopics.find((t) => !t.locked && !progressMap.get(t.topicId)?.completed) ??
        flatTopics.find((t) => !t.locked) ??
        flatTopics[0];
      setActiveTopicId(resume?.topicId ?? null);
    }
  }, [flatTopics, activeTopicId, progressMap]);

  const active = flatTopics.find((t) => t.topicId === activeTopicId) ?? null;
  const activeIdx = flatTopics.findIndex((t) => t.topicId === activeTopicId);
  const prevTopic = activeIdx > 0 ? flatTopics[activeIdx - 1] : null;
  const nextTopic =
    activeIdx >= 0 && activeIdx < flatTopics.length - 1 ? flatTopics[activeIdx + 1] : null;

  const completedCount = Array.from(progressMap.values()).filter((p) => p.completed).length;
  const progressPercent =
    flatTopics.length > 0 ? Math.round((completedCount / flatTopics.length) * 100) : 0;

  const markDone = useMutation({
    mutationFn: () =>
      apiFetch("/lms/me/progress", {
        method: "POST",
        body: JSON.stringify({ topicId: activeTopicId, completed: true, percent: 100 }),
      }),
    onSuccess: async () => {
      toast({ title: "Topic marked complete" });
      await queryClient.invalidateQueries({ queryKey: ["lms-player", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["lms-me"] });
      if (nextTopic && !nextTopic.locked) {
        setActiveTopicId(nextTopic.topicId);
      }
    },
    onError: (err: Error) =>
      toast({ title: "Failed to save", description: err.message, variant: "destructive" }),
  });

  const toggleBookmark = useMutation({
    mutationFn: () =>
      apiFetch("/lms/me/bookmarks", {
        method: "POST",
        body: JSON.stringify({ topicId: activeTopicId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lms-player", courseId] });
    },
    onError: (err: Error) =>
      toast({ title: "Bookmark failed", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return <PlayerSkeleton />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
        <p className="mt-2 font-semibold text-red-200">{(error as Error).message}</p>
        <p className="mt-1 text-sm text-red-200/60">Make sure you are enrolled in this course.</p>
        <Link href="/portal" className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!data) return null;

  // Check if all topics in active module are done (for quiz CTA)
  const activeModuleTopics = active ? flatTopics.filter((t) => t.moduleId === active.moduleId) : [];
  const allModTopicsDone =
    activeModuleTopics.length > 0 &&
    activeModuleTopics.every((t) => progressMap.get(t.topicId)?.completed);
  const activeModuleAssessment = active
    ? data.assessments.find((a) => a.moduleId === active.moduleId)
    : null;
  const activeModuleAttempts = active
    ? data.quizAttempts.filter((q) => q.moduleId === active.moduleId).length
    : 0;
  const activeModuleObj = active
    ? data.course.stages.flatMap((s) => s.modules).find((m) => m.id === active.moduleId)
    : null;
  const canTakeQuiz =
    active &&
    !active.locked &&
    allModTopicsDone &&
    activeModuleAssessment?.status !== "PASS" &&
    !!activeModuleObj &&
    activeModuleAttempts < activeModuleObj.maxAttempts;

  const isCompleted = active ? (progressMap.get(active.topicId)?.completed ?? false) : false;
  const isBookmarked = activeTopicId ? bookmarked.has(activeTopicId) : false;

  return (
    <>
      {quizModuleId && (
        <QuizModal
          moduleId={quizModuleId}
          courseId={courseId}
          onClose={() => setQuizModuleId(null)}
          onPass={() => {
            setQuizModuleId(null);
            void queryClient.invalidateQueries({ queryKey: ["lms-player", courseId] });
          }}
        />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Link href="/portal" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <Link href="/portal/courses" className="hover:text-white transition-colors">
                My Courses
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span className="text-white/70">{data.course.title}</span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-white">{data.course.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={progressPercent} className="max-w-[200px]" />
              <span className="text-xs text-white/50">
                {progressPercent}% &nbsp;·&nbsp; {completedCount}/{flatTopics.length} topics
              </span>
            </div>
          </div>
          <MobileDrawerToggle open={drawerOpen} onToggle={() => setDrawerOpen((v) => !v)} />
        </div>

        {/* Layout: sidebar + content */}
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sidebar — hidden on mobile unless drawer open */}
          <div className={cn(!drawerOpen && "hidden lg:block")}>
            <CourseSidebar
              data={data}
              flatTopics={flatTopics}
              activeTopicId={activeTopicId}
              onTopicSelect={(id) => {
                setActiveTopicId(id);
                setDrawerOpen(false);
              }}
              onQuizOpen={(id) => setQuizModuleId(id)}
              progressMap={progressMap}
              unlocked={unlocked}
              bookmarked={bookmarked}
            />
          </div>

          {/* Content panel */}
          <main className="min-h-[60vh] rounded-xl border border-white/10 bg-white/[0.02]">
            {!active && (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-white/40">Select a topic from the outline to begin.</p>
              </div>
            )}

            {active?.locked && (
              <div className="flex h-64 flex-col items-center justify-center gap-4 text-center p-6">
                <Lock className="h-12 w-12 text-amber-400/50" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-white/80">Module Locked</p>
                  <p className="mt-1 text-sm text-white/45 max-w-xs">
                    Pass the assessment for the previous module to unlock this content.
                  </p>
                </div>
              </div>
            )}

            {active && !active.locked && (
              <div className="p-5 space-y-5">
                {/* Breadcrumb + actions */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/35">
                      {active.stageTitle}
                      <span className="mx-1.5 text-white/20">›</span>
                      {active.moduleTitle}
                      <span className="mx-1.5 text-white/20">›</span>
                      {active.chapterTitle}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">{active.topicTitle}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ask AI */}
                    <Link
                      href={`/portal/assistant?${new URLSearchParams({
                        ...(data.course.title ? { course: data.course.title } : {}),
                        chapter: active.chapterTitle,
                        topic: active.topicTitle,
                      }).toString()}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60 hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 hover:text-white transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#c8102e]" aria-hidden="true" />
                      Ask AI
                    </Link>

                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={() => activeTopicId && toggleBookmark.mutate()}
                      disabled={toggleBookmark.isPending}
                      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                      aria-pressed={isBookmarked}
                      className={cn(
                        "rounded-lg border p-2 transition-colors",
                        isBookmarked
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-white/15 text-white/40 hover:border-amber-500/40 hover:text-amber-400",
                      )}
                    >
                      <BookmarkIcon
                        className={cn("h-4 w-4", isBookmarked && "fill-current")}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* Content blocks */}
                {active.contents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-white/20" aria-hidden="true" />
                    <p className="mt-2 text-sm text-white/40">
                      No study materials uploaded for this topic yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {active.contents.map((c) => (
                      <ContentViewer key={c.id} content={c} />
                    ))}
                  </div>
                )}

                {/* Navigation + actions footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  {/* Prev / Next */}
                  <div className="flex gap-2">
                    {prevTopic && (
                      <button
                        type="button"
                        onClick={() => setActiveTopicId(prevTopic.topicId)}
                        disabled={prevTopic.locked}
                        className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60 hover:bg-white/5 disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Previous
                      </button>
                    )}
                    {nextTopic && (
                      <button
                        type="button"
                        onClick={() => !nextTopic.locked && setActiveTopicId(nextTopic.topicId)}
                        disabled={nextTopic.locked}
                        className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60 hover:bg-white/5 disabled:opacity-40 transition-colors"
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-2">
                    {canTakeQuiz && (
                      <button
                        type="button"
                        onClick={() => setQuizModuleId(active.moduleId)}
                        className="rounded-lg border border-[#c8102e]/50 bg-[#c8102e]/10 px-4 py-2 text-sm font-semibold text-[#c8102e] hover:bg-[#c8102e]/20 transition-colors"
                      >
                        Take Assessment
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={markDone.isPending || isCompleted}
                      onClick={() => markDone.mutate()}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                        isCompleted
                          ? "bg-emerald-600/20 text-emerald-400 cursor-default"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60",
                      )}
                    >
                      {markDone.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          Saving…
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Completed
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
