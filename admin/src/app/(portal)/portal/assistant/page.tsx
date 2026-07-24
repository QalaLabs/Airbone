"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

function AssistantInner() {
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get("course")?.trim() || "";
  const chapterTitle = searchParams.get("chapter")?.trim() || "";
  const topicTitle = searchParams.get("topic")?.trim() || "";

  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState<string | null>(null);

  const hasContext = Boolean(courseTitle || chapterTitle || topicTitle);

  const ask = useMutation({
    mutationFn: () =>
      apiFetch<{ answer: string; stub?: boolean }>("/lms/assistant", {
        method: "POST",
        body: JSON.stringify({
          question,
          ...(courseTitle ? { courseTitle } : {}),
          ...(chapterTitle ? { chapterTitle } : {}),
          ...(topicTitle ? { topicTitle } : {}),
        }),
      }),
    onSuccess: (data) => setAnswer(data.answer),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">AI study assistant</h1>
      <p className="text-sm text-white/55">
        Ask about DGCA topics, notes, or concepts. Uses Gemini when `GEMINI_API_KEY` is configured.
      </p>

      {hasContext && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Studying</p>
          {courseTitle && <p className="mt-1 font-medium text-white/90">{courseTitle}</p>}
          {(chapterTitle || topicTitle) && (
            <p className="mt-0.5 text-xs text-white/50">
              {[chapterTitle, topicTitle].filter(Boolean).join(" › ")}
            </p>
          )}
        </div>
      )}

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        placeholder={
          topicTitle
            ? `Ask a question about “${topicTitle}”…`
            : "e.g. Explain VFR weather minima…"
        }
        className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
      />
      <button
        type="button"
        disabled={!question.trim() || ask.isPending}
        onClick={() => ask.mutate()}
        className="rounded-md bg-[#c8102e] px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {ask.isPending ? "Thinking…" : "Ask"}
      </button>
      {ask.isError && <p className="text-sm text-red-300">{(ask.error as Error).message}</p>}
      {answer && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function PortalAssistantPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-white/50">Loading assistant…</p>
        </div>
      }
    >
      <AssistantInner />
    </React.Suspense>
  );
}
