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
  Award,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Content {
  id: string; title: string; type: "PDF" | "VIDEO" | "NOTES"; url: string; duration?: number | null;
}
interface Topic { id: string; title: string; contents: Content[] }
interface Chapter { id: string; title: string; topics: Topic[] }
interface Module {
  id: string; title: string; passPercent: number; maxAttempts: number;
  chapters: Chapter[];
}
interface Stage { id: string; title: string; modules: Module[] }
interface PlayerPayload {
  course: { id: string; title: string; stages: Stage[] };
  progress: Array<{ topicId: string; completed: boolean; percent: number }>;
  assessments: Array<{ moduleId: string; status: string; score: number; attempts: number }>;
  unlockedModuleIds: string[];
  bookmarkedTopicIds: string[];
  quizAttempts: Array<{ moduleId: string; score: number; passed: boolean; attemptNumber: number; createdAt: string }>;
}
interface QuizPayload {
  module: { id: string; title: string; passPercent: number; maxAttempts: number };
  questions: Array<{ id: string; stem: string; options: Array<{ id: string; text: string }>; order: number; points: number }>;
  attemptsUsed: number;
  attemptsRemaining: number;
}
interface QuizResult {
  scorePercent: number; earned: number; maxScore: number; passed: boolean;
  passPercent: number; attemptsUsed: number; attemptsRemaining: number;
  gradedAnswers: Record<string, { given: string; correct: string; isCorrect: boolean; points: number }>;
}

// ─── Quiz Modal ───────────────────────────────────────────────────────────────

function QuizModal({
  moduleId,
  courseId,
  onClose,
  onPass,
}: {
  moduleId: string;
  courseId: string;
  onClose: () => void;
  onPass: () => void;
}) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ["lms-quiz", courseId, moduleId],
    queryFn: () => apiFetch<QuizPayload>(`/lms/me/courses/${courseId}/quiz/${moduleId}`),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiFetch<QuizResult>(`/lms/me/courses/${courseId}/quiz/${moduleId}`, {
        method: "POST",
        body: JSON.stringify({ moduleId, answers }),
      }),
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ["lms-player", courseId] });
      if (data.passed) {
        toast({ title: "Assessment passed!", description: `Score: ${data.scorePercent}% — next module unlocked.` });
        onPass();
      } else {
        toast({
          title: "Not passed",
          description: `Score: ${data.scorePercent}% (need ${data.passPercent}%). ${data.attemptsRemaining} attempt${data.attemptsRemaining !== 1 ? "s" : ""} remaining.`,
          variant: "destructive",
        });
      }
    },
    onError: (err: Error) => toast({ title: "Submit failed", description: err.message, variant: "destructive" }),
  });

  const allAnswered = quiz ? quiz.questions.every((q) => answers[q.id]) : false;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading quiz…
        </div>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="rounded-xl border border-red-500/30 bg-[#0a1a30] p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-white">Failed to load quiz questions.</p>
          <button type="button" onClick={onClose} className="mt-4 rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Close</button>
        </div>
      </div>
    );
  }

  if (quiz.attemptsRemaining <= 0 && !submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0a1a30] p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-400" />
          <h2 className="mt-3 text-lg font-semibold text-white">No attempts remaining</h2>
          <p className="mt-1 text-sm text-white/60">You have used all {quiz.module.maxAttempts} attempts for this module.</p>
          <button type="button" onClick={onClose} className="mt-4 rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 p-4 pt-8 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0a1a30] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-semibold text-white">{quiz.module.title} — Assessment</h2>
            <p className="text-xs text-white/50">
              Pass ≥ {quiz.module.passPercent}% · Attempt {quiz.attemptsUsed + 1} of {quiz.module.maxAttempts}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white">✕</button>
        </div>

        {/* Result banner */}
        {submitted && result && (
          <div className={cn(
            "mx-6 mt-4 rounded-xl border p-4 text-center",
            result.passed
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-red-500/40 bg-red-500/10",
          )}>
            {result.passed
              ? <Award className="mx-auto h-8 w-8 text-emerald-400" />
              : <AlertCircle className="mx-auto h-8 w-8 text-red-400" />}
            <p className={cn("mt-2 text-lg font-bold", result.passed ? "text-emerald-300" : "text-red-300")}>
              {result.passed ? "Passed!" : "Not passed"}
            </p>
            <p className="text-sm text-white/70">
              Score: <strong>{result.scorePercent}%</strong> ({result.earned}/{result.maxScore} points)
            </p>
            {!result.passed && result.attemptsRemaining > 0 && (
              <p className="mt-1 text-xs text-white/50">{result.attemptsRemaining} attempt{result.attemptsRemaining !== 1 ? "s" : ""} remaining</p>
            )}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6 p-6">
          {quiz.questions.map((q, idx) => {
            const grade = result?.gradedAnswers[q.id];
            return (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium text-white">
                  <span className="mr-2 text-white/40">{idx + 1}.</span>
                  {q.stem}
                  {q.points > 1 && <span className="ml-2 text-xs text-white/40">({q.points} pts)</span>}
                </p>
                <div className="grid gap-2">
                  {q.options.map((opt) => {
                    const chosen = answers[q.id] === opt.id;
                    const isCorrect = grade?.correct === opt.id;
                    const isWrong = grade && grade.given === opt.id && !grade.isCorrect;
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                          submitted
                            ? isCorrect
                              ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
                              : isWrong
                              ? "border-red-500/60 bg-red-500/15 text-red-200"
                              : "border-white/10 text-white/60"
                            : chosen
                            ? "border-[#c8102e]/70 bg-[#c8102e]/15 text-white"
                            : "border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5",
                        )}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={chosen}
                          disabled={submitted}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                          className="accent-[#c8102e]"
                        />
                        <span className="font-mono text-xs font-bold uppercase text-white/40 mr-1">{opt.id})</span>
                        {opt.text}
                        {submitted && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400 shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-white/60 hover:bg-white/5">
            {submitted ? "Close" : "Cancel"}
          </button>
          {!submitted && (
            <button
              type="button"
              disabled={!allAnswered || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="rounded-md bg-[#c8102e] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#a00d25]"
            >
              {submitMutation.isPending ? "Submitting…" : `Submit (${Object.keys(answers).length}/${quiz.questions.length} answered)`}
            </button>
          )}
          {submitted && !result?.passed && result && result.attemptsRemaining > 0 && (
            <button
              type="button"
              onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); void queryClient.invalidateQueries({ queryKey: ["lms-quiz", courseId, moduleId] }); }}
              className="rounded-md bg-[#c8102e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a00d25]"
            >
              Try again ({result.attemptsRemaining} left)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div className="h-full rounded-full bg-[#c8102e] transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CoursePlayerPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const queryClient = useQueryClient();
  const [activeTopicId, setActiveTopicId] = React.useState<string | null>(null);
  const [quizModuleId, setQuizModuleId] = React.useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lms-player", courseId],
    queryFn: () => apiFetch<PlayerPayload>(`/lms/me/courses/${courseId}`),
  });

  const progressMap = React.useMemo(() => {
    const map = new Map<string, { completed: boolean; percent: number }>();
    data?.progress.forEach((p) => map.set(p.topicId, p));
    return map;
  }, [data?.progress]);

  const unlocked = React.useMemo(() => new Set(data?.unlockedModuleIds ?? []), [data?.unlockedModuleIds]);
  const bookmarked = React.useMemo(() => new Set(data?.bookmarkedTopicIds ?? []), [data?.bookmarkedTopicIds]);

  const flatTopics = React.useMemo(() => {
    const list: Array<{
      topicId: string; topicTitle: string; moduleId: string; moduleTitle: string;
      chapterTitle: string; stageTitle: string; locked: boolean;
      contents: Content[];
    }> = [];
    data?.course.stages.forEach((stage) =>
      stage.modules.forEach((mod) => {
        const locked = !unlocked.has(mod.id);
        mod.chapters.forEach((ch) =>
          ch.topics.forEach((topic) =>
            list.push({
              topicId: topic.id, topicTitle: topic.title,
              moduleId: mod.id, moduleTitle: mod.title,
              chapterTitle: ch.title, stageTitle: stage.title,
              locked, contents: topic.contents,
            })
          )
        );
      })
    );
    return list;
  }, [data, unlocked]);

  React.useEffect(() => {
    if (!activeTopicId && flatTopics.length) {
      // Continue learning: first incomplete unlocked topic, or first unlocked
      const resumeTopic = flatTopics.find((t) => !t.locked && !progressMap.get(t.topicId)?.completed)
        ?? flatTopics.find((t) => !t.locked)
        ?? flatTopics[0];
      setActiveTopicId(resumeTopic?.topicId ?? null);
    }
  }, [flatTopics, activeTopicId, progressMap]);

  const active = flatTopics.find((t) => t.topicId === activeTopicId) ?? null;
  const activeIdx = flatTopics.findIndex((t) => t.topicId === activeTopicId);
  const prevTopic = activeIdx > 0 ? flatTopics[activeIdx - 1] : null;
  const nextTopic = activeIdx >= 0 && activeIdx < flatTopics.length - 1 ? flatTopics[activeIdx + 1] : null;

  const completedTopics = Array.from(progressMap.values()).filter((p) => p.completed).length;
  const totalTopics = flatTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

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
      if (nextTopic && !nextTopic.locked) setActiveTopicId(nextTopic.topicId);
    },
    onError: (err: Error) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
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
    onError: (err: Error) => toast({ title: "Bookmark failed", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded-lg bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="h-96 rounded-xl bg-white/[0.03]" />
          <div className="h-96 rounded-xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm">
        <p className="font-medium text-red-200">{(error as Error).message}</p>
        <p className="mt-1 text-red-200/60">Make sure you are enrolled in this course.</p>
      </div>
    );
  }

  return (
    <>
      {quizModuleId && (
        <QuizModal
          moduleId={quizModuleId}
          courseId={courseId}
          onClose={() => setQuizModuleId(null)}
          onPass={() => { setQuizModuleId(null); void queryClient.invalidateQueries({ queryKey: ["lms-player", courseId] }); }}
        />
      )}

      <div className="space-y-4">
        {/* Course header */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Course player</p>
          <h1 className="text-2xl font-semibold text-white">{data?.course.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={progressPercent} className="max-w-xs" />
            <span className="text-xs text-white/50">{progressPercent}% complete ({completedTopics}/{totalTopics} topics)</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="max-h-[75vh] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03]">
            {data?.course.stages.map((stage) => (
              <div key={stage.id} className="border-b border-white/5 last:border-0">
                <p className="sticky top-0 z-10 bg-[#0b1f3a]/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40 backdrop-blur">
                  {stage.title}
                </p>
                {stage.modules.map((mod) => {
                  const locked = !unlocked.has(mod.id);
                  const assessment = data.assessments.find((a) => a.moduleId === mod.id);
                  const passed = assessment?.status === "PASS";
                  const attempts = data.quizAttempts.filter((q) => q.moduleId === mod.id);
                  const attemptsUsed = attempts.length;

                  return (
                    <div key={mod.id} className="mb-1">
                      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {locked ? (
                            <Lock className="h-3 w-3 shrink-0 text-white/30" />
                          ) : passed ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                          ) : (
                            <span className="h-3 w-3 shrink-0" />
                          )}
                          <p className="truncate text-xs font-medium text-white/80">{mod.title}</p>
                        </div>
                        {!locked && !passed && (
                          <button
                            type="button"
                            onClick={() => setQuizModuleId(mod.id)}
                            className="shrink-0 rounded-md border border-[#c8102e]/40 px-2 py-0.5 text-[10px] font-semibold text-[#c8102e] hover:bg-[#c8102e]/10"
                          >
                            {attemptsUsed > 0 ? `Retry (${mod.maxAttempts - attemptsUsed} left)` : "Take quiz"}
                          </button>
                        )}
                        {passed && (
                          <span className="shrink-0 text-[10px] font-bold text-emerald-400">{assessment?.score}%</span>
                        )}
                      </div>

                      {mod.chapters.map((ch) =>
                        ch.topics.map((topic) => {
                          const done = progressMap.get(topic.id)?.completed;
                          const isActive = activeTopicId === topic.id;
                          const isBookmarked = bookmarked.has(topic.id);
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              disabled={locked}
                              onClick={() => !locked && setActiveTopicId(topic.id)}
                              className={cn(
                                "flex w-full items-center gap-2 px-5 py-1.5 text-left text-xs transition-colors",
                                isActive ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                                locked ? "opacity-35 cursor-not-allowed" : "cursor-pointer",
                              )}
                            >
                              {done ? (
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                              ) : (
                                <span className="h-3 w-3 shrink-0 rounded-full border border-white/20" />
                              )}
                              <span className="flex-1 truncate">{topic.title}</span>
                              {isBookmarked && <BookmarkIcon className="h-2.5 w-2.5 shrink-0 fill-amber-400 text-amber-400" />}
                              {topic.contents.length > 0 && (
                                <span className="shrink-0 text-[9px] text-white/25">{topic.contents.length}</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Content area */}
          <section className="min-h-[60vh] space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            {!active && (
              <div className="flex h-full items-center justify-center">
                <p className="text-white/40">Select a topic to begin.</p>
              </div>
            )}

            {active?.locked && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                <Lock className="h-10 w-10 text-amber-400/60" />
                <div>
                  <p className="font-medium text-white/80">Module locked</p>
                  <p className="mt-1 text-sm text-white/45">Pass the quiz for the previous module to unlock this content.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prevMod = flatTopics.find((t) => !t.locked && t.moduleId !== active?.moduleId);
                    if (prevMod) setQuizModuleId(prevMod.moduleId);
                  }}
                  className="mt-2 rounded-md bg-[#c8102e] px-4 py-2 text-sm font-semibold text-white"
                >
                  Take previous quiz
                </button>
              </div>
            )}

            {active && !active.locked && (
              <div className="space-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/40">
                      {active.stageTitle} › {active.moduleTitle} › {active.chapterTitle}
                    </p>
                    <h2 className="mt-0.5 text-xl font-medium text-white">{active.topicTitle}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/portal/assistant?${new URLSearchParams({
                        ...(data?.course.title ? { course: data.course.title } : {}),
                        chapter: active.chapterTitle,
                        topic: active.topicTitle,
                      }).toString()}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-xs text-white/70 hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 hover:text-white"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#c8102e]" />
                      Ask AI
                    </Link>
                    <button
                      type="button"
                      onClick={() => activeTopicId && toggleBookmark.mutate()}
                      className={cn(
                        "rounded-md border p-2 transition-colors",
                        bookmarked.has(activeTopicId ?? "")
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-white/15 text-white/40 hover:border-amber-500/40 hover:text-amber-400",
                      )}
                      aria-label="Toggle bookmark"
                    >
                      <BookmarkIcon className={cn("h-4 w-4", bookmarked.has(activeTopicId ?? "") && "fill-current")} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {active.contents.length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
                    No content uploaded for this topic yet.
                  </p>
                )}

                {active.contents.map((c) => (
                  <div key={c.id} className="overflow-hidden rounded-xl border border-white/10">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/25 px-4 py-2.5">
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        {c.type === "PDF" ? <FileText className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        <span className="font-medium">{c.title}</span>
                        <span className="text-white/35 uppercase">{c.type}</span>
                      </div>
                      {c.type === "PDF" && (
                        <a
                          href={c.url} target="_blank" rel="noreferrer"
                          className="text-[10px] text-[#c8102e] hover:underline"
                          download
                        >
                          Download
                        </a>
                      )}
                    </div>
                    {c.type === "PDF" || c.type === "NOTES" ? (
                      <iframe title={c.title} src={c.url} className="h-[70vh] w-full bg-white" />
                    ) : (
                      <video controls className="max-h-[65vh] w-full bg-black" src={c.url} preload="metadata">
                        <track kind="captions" />
                      </video>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex gap-2">
                    {prevTopic && (
                      <button
                        type="button"
                        onClick={() => setActiveTopicId(prevTopic.topicId)}
                        disabled={prevTopic.locked}
                        className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Prev
                      </button>
                    )}
                    {nextTopic && !nextTopic.locked && (
                      <button
                        type="button"
                        onClick={() => setActiveTopicId(nextTopic.topicId)}
                        className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Take quiz button if all topics in module done */}
                    {(() => {
                      const assessment = data?.assessments.find((a) => a.moduleId === active.moduleId);
                      if (!assessment || assessment.status !== "PASS") {
                        const allModTopics = flatTopics.filter((t) => t.moduleId === active.moduleId);
                        const allDone = allModTopics.every((t) => progressMap.get(t.topicId)?.completed);
                        if (allDone && allModTopics.length > 0) {
                          const attempts = data?.quizAttempts.filter((q) => q.moduleId === active.moduleId) ?? [];
                          const mod = data?.course.stages.flatMap((s) => s.modules).find((m) => m.id === active.moduleId);
                          if (mod && attempts.length < mod.maxAttempts) {
                            return (
                              <button
                                type="button"
                                onClick={() => setQuizModuleId(active.moduleId)}
                                className="rounded-md bg-[#c8102e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a00d25]"
                              >
                                Take module quiz
                              </button>
                            );
                          }
                        }
                      }
                      return null;
                    })()}

                    <button
                      type="button"
                      disabled={markDone.isPending || progressMap.get(active.topicId)?.completed === true}
                      onClick={() => markDone.mutate()}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {markDone.isPending
                        ? "Saving…"
                        : progressMap.get(active.topicId)?.completed
                        ? "Completed ✓"
                        : "Mark complete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
