"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Sparkles, Send, User, Bot, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit() {
    const q = input.trim();
    if (!q || ask.isPending) return;
    ask.mutate(q);
  }

  function handleQuickPrompt(prompt: string) {
    const contextualPrompt = topicTitle
      ? `${prompt} for "${topicTitle}"`
      : prompt;
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#c8102e]" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">AI Study Assistant</h1>
        </div>
        <p className="mt-1 text-sm text-white/50">
          Powered by AI — ask about DGCA topics, air law, navigation, meteorology, and more.
        </p>
      </div>

      {/* Context chips */}
      {hasContext && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
            Studying context
          </p>
          {courseTitle && (
            <p className="mt-1.5 font-medium text-white/90 text-sm">{courseTitle}</p>
          )}
          {(chapterTitle || topicTitle) && (
            <p className="mt-0.5 text-xs text-white/50">
              {[chapterTitle, topicTitle].filter(Boolean).join(" › ")}
            </p>
          )}
        </div>
      )}

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="space-y-2">
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
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 hover:text-white transition-colors disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat history */}
      {messages.length > 0 && (
        <div
          role="log"
          aria-live="polite"
          aria-label="Chat history"
          className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 max-h-[50vh] overflow-y-auto"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                  msg.role === "user"
                    ? "bg-[#c8102e]/20 text-[#c8102e]"
                    : "bg-white/10 text-white/70",
                )}
                aria-hidden="true"
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-tr-sm bg-[#c8102e]/20 text-white/90"
                    : msg.isError
                      ? "rounded-tl-sm bg-red-500/10 text-red-300"
                      : "rounded-tl-sm bg-white/[0.06] text-white/85",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {ask.isPending && (
            <div className="flex gap-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70"
                aria-hidden="true"
              >
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Clear button if history */}
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

      {/* Input area */}
      <div className="relative rounded-xl border border-white/15 bg-black/20 focus-within:border-white/30 transition-colors">
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
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8102e] text-white disabled:opacity-40 hover:bg-[#a00d25] transition-colors"
        >
          {ask.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-white/25 text-center">
        Press Enter to send · Shift+Enter for new line · AI may make mistakes — verify with official DGCA material
      </p>
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
