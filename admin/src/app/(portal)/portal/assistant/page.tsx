"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Sparkles, Send, User, Bot, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PortalPageHeader,
  GlassCard,
  EmptyState,
  MotionSection,
} from "@/components/portal/portal-ui";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

const QUICK_PROMPTS = [
  "Explain this topic in simple terms",
  "Summarize the key notes",
  "Generate 5 practice MCQs",
  "What are the DGCA regulations on this?",
  "Clarify the most difficult concept",
  "Give me a study checklist",
];

function AssistantInner() {
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get("course")?.trim() ?? "";
  const chapterTitle = searchParams.get("chapter")?.trim() ?? "";
  const topicTitle = searchParams.get("topic")?.trim() ?? "";

  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const hasContext = Boolean(courseTitle || chapterTitle || topicTitle);

  const ask = useMutation({
    mutationFn: (question: string) =>
      apiFetch<{ answer: string; stub?: boolean }>("/lms/assistant", {
        method: "POST",
        body: JSON.stringify({
          question,
          ...(courseTitle ? { courseTitle } : {}),
          ...(chapterTitle ? { chapterTitle } : {}),
          ...(topicTitle ? { topicTitle } : {}),
        }),
      }),
    onSuccess: (data, question) => {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: question,
      };
      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.answer,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
    },
    onError: (err: Error, question) => {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: question,
      };
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I couldn't answer that. ${err.message}`,
        isError: true,
      };
      setMessages((prev) => [...prev, userMsg, errMsg]);
      setInput("");
    },
  });

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit() {
    const q = input.trim();
    if (!q || ask.isPending) return;
    ask.mutate(q);
  }

  function handleQuickPrompt(prompt: string) {
    const contextualPrompt = topicTitle ? `${prompt} for "${topicTitle}"` : prompt;
    ask.mutate(contextualPrompt);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <MotionSection>
        <PortalPageHeader
          eyebrow="AI Tutor"
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[var(--ab-red)]" aria-hidden="true" />
              Study Assistant
            </span>
          }
          description="Powered by AI — ask about DGCA topics, air law, navigation, meteorology, and more."
        />
      </MotionSection>

      {hasContext && (
        <MotionSection delay={0.05}>
          <GlassCard soft className="border-[rgba(200,16,46,0.2)] bg-[rgba(200,16,46,0.04)]">
            <p className="ab-eyebrow">Studying context</p>
            {courseTitle && (
              <p className="mt-1.5 text-sm font-medium text-white/90">{courseTitle}</p>
            )}
            {(chapterTitle || topicTitle) && (
              <p className="mt-0.5 text-xs text-white/50">
                {[chapterTitle, topicTitle].filter(Boolean).join(" › ")}
              </p>
            )}
          </GlassCard>
        </MotionSection>
      )}

      {messages.length === 0 && (
        <MotionSection delay={0.1}>
          <EmptyState
            icon={Sparkles}
            title="Your aviation AI tutor"
            description="Ask anything about your course material, DGCA regulations, or exam prep. Try a quick prompt below to get started."
          />
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
              Quick prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuickPrompt(p)}
                  disabled={ask.isPending}
                  className="ab-glass-soft rounded-full px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[rgba(200,16,46,0.4)] hover:text-white disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {messages.length > 0 && (
        <MotionSection delay={0.05}>
          <GlassCard
            soft
            className="max-h-[50vh] space-y-4 overflow-y-auto !p-4"
            role="log"
            aria-live="polite"
            aria-label="Chat history"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user"
                      ? "bg-[rgba(200,16,46,0.2)] text-[var(--ab-red)]"
                      : "ab-glass-soft text-white/70",
                  )}
                  aria-hidden="true"
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm",
                    msg.role === "user"
                      ? "rounded-tr-sm border border-[rgba(200,16,46,0.25)] bg-[rgba(200,16,46,0.15)] text-white/90"
                      : msg.isError
                        ? "rounded-tl-sm border border-red-500/30 bg-red-500/10 text-red-300"
                        : "rounded-tl-sm ab-glass-soft text-white/85",
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {ask.isPending && (
              <div className="flex gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ab-glass-soft text-white/70"
                  aria-hidden="true"
                >
                  <Bot className="h-4 w-4" />
                </div>
                <div className="ab-glass-soft flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </GlassCard>
        </MotionSection>
      )}

      {messages.length > 0 && (
        <button
          type="button"
          onClick={() => setMessages([])}
          className="self-start flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Clear conversation
        </button>
      )}

      <MotionSection delay={0.15}>
        <GlassCard soft className="relative !p-0 focus-within:border-white/25">
          <label htmlFor="assistant-input" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="assistant-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder={
              topicTitle
                ? `Ask about "${topicTitle}"…`
                : hasContext
                  ? "Ask about this topic…"
                  : "e.g. Explain VFR weather minima for DGCA…"
            }
            className="w-full resize-none bg-transparent px-4 py-3 pr-14 text-sm text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            disabled={!input.trim() || ask.isPending}
            onClick={handleSubmit}
            aria-label="Send message"
            className="ab-btn ab-btn-primary absolute bottom-3 right-3 h-9 w-9 disabled:opacity-40"
          >
            {ask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </GlassCard>
        <p className="mt-2 text-center text-[10px] text-white/25">
          Press Enter to send · Shift+Enter for new line · AI may make mistakes — verify with official DGCA material
        </p>
      </MotionSection>
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
