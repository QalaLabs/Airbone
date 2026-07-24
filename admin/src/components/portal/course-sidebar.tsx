"use client";

import { cn } from "@/lib/utils";
import type { PlayerPayload, FlatTopic } from "./types";
import { CheckCircle2, Lock, BookmarkIcon } from "lucide-react";

interface CourseSidebarProps {
  data: PlayerPayload;
  flatTopics: FlatTopic[];
  activeTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
  onQuizOpen: (moduleId: string) => void;
  progressMap: Map<string, { completed: boolean; percent: number }>;
  unlocked: Set<string>;
  bookmarked: Set<string>;
}

export function CourseSidebar({
  data,
  flatTopics,
  activeTopicId,
  onTopicSelect,
  onQuizOpen,
  progressMap,
  unlocked,
  bookmarked,
}: CourseSidebarProps) {
  return (
    <aside
      aria-label="Course navigation"
      className="overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] lg:max-h-[80vh] lg:sticky lg:top-4"
    >
      {data.course.stages.map((stage) => (
        <div key={stage.id} className="border-b border-white/5 last:border-0">
          {/* Stage header */}
          <p className="sticky top-0 z-10 bg-[#0b1f3a]/95 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 backdrop-blur">
            {stage.title}
          </p>

          {stage.modules.map((mod) => {
            const isLocked = !unlocked.has(mod.id);
            const assessment = data.assessments.find((a) => a.moduleId === mod.id);
            const passed = assessment?.status === "PASS";
            const attemptsUsed = data.quizAttempts.filter((q) => q.moduleId === mod.id).length;
            const attemptsLeft = mod.maxAttempts - attemptsUsed;

            // Count completed topics in this module
            const modTopics = flatTopics.filter((t) => t.moduleId === mod.id);
            const modDone = modTopics.filter((t) => progressMap.get(t.topicId)?.completed).length;

            return (
              <div key={mod.id}>
                {/* Module row */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]",
                    isLocked ? "opacity-50" : "",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isLocked ? (
                        <Lock className="h-3 w-3 shrink-0 text-white/30" aria-label="Locked" />
                      ) : passed ? (
                        <CheckCircle2
                          className="h-3 w-3 shrink-0 text-emerald-400"
                          aria-label="Passed"
                        />
                      ) : (
                        <span className="h-3 w-3 shrink-0 rounded-full border border-white/25" aria-hidden="true" />
                      )}
                      <p className="truncate text-[11px] font-semibold text-white/75">{mod.title}</p>
                    </div>
                    {!isLocked && (
                      <p className="ml-[18px] text-[9px] text-white/30 mt-0.5">
                        {modDone}/{modTopics.length} topics
                        {passed && <span className="ml-1.5 text-emerald-400/80">{assessment?.score}%</span>}
                      </p>
                    )}
                  </div>

                  {!isLocked && !passed && attemptsLeft > 0 && (
                    <button
                      type="button"
                      onClick={() => onQuizOpen(mod.id)}
                      aria-label={`Take assessment for ${mod.title}`}
                      className="shrink-0 rounded-md border border-[#c8102e]/40 px-2 py-0.5 text-[9px] font-bold text-[#c8102e] hover:bg-[#c8102e]/10 transition-colors"
                    >
                      {attemptsUsed > 0 ? `Retry` : "Quiz"}
                    </button>
                  )}
                </div>

                {/* Topics */}
                {mod.chapters.map((ch) => (
                  <div key={ch.id}>
                    {/* Chapter label */}
                    <p className="px-4 py-1.5 text-[9px] uppercase tracking-widest text-white/25 bg-white/[0.015]">
                      {ch.title}
                    </p>
                    {ch.topics.map((topic) => {
                      const done = progressMap.get(topic.id)?.completed;
                      const isActive = activeTopicId === topic.id;
                      const isBookmarked = bookmarked.has(topic.id);

                      return (
                        <button
                          key={topic.id}
                          type="button"
                          disabled={isLocked}
                          onClick={() => !isLocked && onTopicSelect(topic.id)}
                          aria-current={isActive ? "true" : undefined}
                          aria-label={`${done ? "Completed: " : ""}${topic.title}${isLocked ? " (locked)" : ""}`}
                          className={cn(
                            "flex w-full items-center gap-2 px-6 py-2 text-left text-xs transition-colors",
                            isActive
                              ? "bg-[#c8102e]/15 text-white border-l-2 border-[#c8102e]"
                              : "text-white/55 hover:bg-white/[0.04] hover:text-white/90",
                            isLocked ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                          )}
                        >
                          {done ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" aria-hidden="true" />
                          ) : (
                            <span
                              className={cn(
                                "h-3 w-3 shrink-0 rounded-full border",
                                isActive ? "border-[#c8102e]/60" : "border-white/20",
                              )}
                              aria-hidden="true"
                            />
                          )}
                          <span className="flex-1 truncate leading-snug">{topic.title}</span>
                          {isBookmarked && (
                            <BookmarkIcon
                              className="h-2.5 w-2.5 shrink-0 fill-amber-400 text-amber-400"
                              aria-label="Bookmarked"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
