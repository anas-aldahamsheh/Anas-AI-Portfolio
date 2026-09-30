"use client";

import { AnimatePresence, m } from "motion/react";
import { ArrowUp, Check, Copy, CornerDownLeft, RotateCcw, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import {
  retryLast,
  sendMessage,
  stopStreaming,
  useAssistantState,
  type ChatMessage,
  type SendOptions,
} from "./store";

const KIND_DOT: Record<string, string> = {
  project: "bg-violet-500",
  experience: "bg-emerald-500",
  certificate: "bg-amber-500",
  education: "bg-sky-500",
  profile: "bg-[#2F6FED]",
  cv: "bg-[#2F6FED]",
  skills: "bg-cyan-500",
  document: "bg-slate-400",
  note: "bg-slate-400",
};

function Thinking({ steps }: { steps: ChatMessage["steps"] }) {
  const current = steps?.[steps.length - 1];
  return (
    <div
      className="flex items-center gap-2.5 py-1 text-xs font-medium text-[#637089] dark:text-[#9AA8C0]"
      role="status"
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-[#2F6FED]/15 border-t-[#2F6FED] dark:border-indigo-400/15 dark:border-t-indigo-300" />
        <Sparkles className="h-2.5 w-2.5 text-[#2F6FED] dark:text-indigo-300" aria-hidden="true" />
      </span>
      <AnimatePresence mode="wait">
        <m.span
          key={current?.label ?? "thinking"}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.25 }}
          className="[animation:gradient-pan_2.2s_linear_infinite] bg-gradient-to-r from-[#637089] via-[#2F6FED] to-[#637089] bg-[length:200%_100%] bg-clip-text text-transparent dark:from-[#9AA8C0] dark:via-indigo-200 dark:to-[#9AA8C0]"
        >
          {current?.label ?? "…"}
        </m.span>
      </AnimatePresence>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text.replace(/\s?\[\d+(?:,\s*\d+)*\]/g, "")).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-[#637089] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-white"
      aria-label={copied ? t("chat.copied") : t("chat.copy")}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? t("chat.copied") : t("chat.copy")}
    </button>
  );
}

function AssistantMessage({
  message,
  onAsk,
  isLast,
}: {
  message: ChatMessage;
  onAsk: (q: string) => void;
  isLast: boolean;
}) {
  const { t, locale } = useI18n();
  const options: SendOptions = {
    locale,
    messages: { rateLimited: t("chat.rateLimited"), error: t("chat.error") },
  };
  const streaming = message.status === "streaming";

  return (
    <div className="group/msg space-y-2.5">
      {streaming && !message.content ? <Thinking steps={message.steps} /> : null}
      {message.content ? (
        <div
          className={cn(
            streaming &&
              "[&>div>*:last-child]:after:ms-0.5 [&>div>*:last-child]:after:inline-block [&>div>*:last-child]:after:h-3.5 [&>div>*:last-child]:after:w-[2px] [&>div>*:last-child]:after:translate-y-0.5 [&>div>*:last-child]:after:animate-pulse [&>div>*:last-child]:after:bg-[#2F6FED] [&>div>*:last-child]:after:content-['']",
          )}
        >
          <Markdown text={message.content} sources={message.sources ?? []} />
        </div>
      ) : null}

      {message.status === "error" ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <span>{message.error}</span>
          {isLast ? (
            <button
              type="button"
              onClick={() => retryLast(options)}
              className="inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-2 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              {t("chat.retry")}
            </button>
          ) : null}
        </div>
      ) : null}

      {message.status === "done" && message.sources && message.sources.length > 0 ? (
        <m.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <p className="text-[10px] font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
            {t("chat.sources")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => {
              const chip = (
                <m.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#334155] transition-colors hover:border-[#2F6FED]/50 hover:text-[#2F6FED] dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#CBD5E1] dark:hover:border-indigo-400/40 dark:hover:text-white"
                >
                  <span className="text-[10px] font-bold text-[#2F6FED] dark:text-indigo-300">
                    {source.ref}
                  </span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      KIND_DOT[source.kind] ?? "bg-slate-400",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{source.title}</span>
                </m.span>
              );
              return source.url ? (
                <Link key={source.ref} href={source.url}>
                  {chip}
                </Link>
              ) : (
                <span key={source.ref}>{chip}</span>
              );
            })}
          </div>
        </m.div>
      ) : null}

      {message.status === "done" && message.content ? (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/msg:opacity-100 focus-within:opacity-100">
          <CopyButton text={message.content} />
        </div>
      ) : null}

      {isLast &&
      message.status === "done" &&
      message.suggestions &&
      message.suggestions.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
            {t("chat.followups")}
          </p>
          <div className="flex flex-col items-start gap-1.5">
            {message.suggestions.map((question, i) => (
              <m.button
                key={question}
                type="button"
                initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                onClick={() => onAsk(question)}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-[#D0E2FF] bg-[#EEF5FF]/70 px-3 py-1.5 text-start text-xs font-medium text-[#1E40AF] transition-all hover:-translate-y-px hover:border-[#2F6FED]/60 hover:bg-[#EEF5FF] dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-100 dark:hover:border-indigo-400/50"
              >
                <CornerDownLeft
                  className="h-3 w-3 shrink-0 opacity-60 rtl:-scale-x-100"
                  aria-hidden="true"
                />
                {question}
              </m.button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ChatView({
  quickQuestions,
  autoFocus = false,
  compact = false,
  placeholder,
}: {
  quickQuestions: string[];
  autoFocus?: boolean;
  compact?: boolean;
  placeholder?: string;
}) {
  const { t, locale } = useI18n();
  const { messages, busy } = useAssistantState();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const options: SendOptions = {
    locale,
    messages: { rateLimited: t("chat.rateLimited"), error: t("chat.error") },
  };

  const ask = (text: string) => {
    stickToBottom.current = true;
    void sendMessage(text, options);
  };

  const submit = () => {
    if (!input.trim() || busy) return;
    ask(input);
    setInput("");
  };

  // Follow the stream unless the reader scrolled up to re-read something.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  // Auto-grow the composer up to a limit.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className={cn(
          "relative flex-1 space-y-5 overflow-y-auto overscroll-contain",
          compact ? "p-4" : "p-4 sm:p-6",
        )}
        aria-live="polite"
        aria-busy={busy}
      >
        {messages.length === 0 ? (
          <m.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="flex min-h-full flex-col justify-center py-4"
          >
            <m.div
              variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
              className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-lg shadow-blue-500/25 dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2]"
            >
              <Sparkles className="h-6 w-6" aria-hidden="true" />
              <span
                className="ping-soft absolute inset-0 rounded-2xl ring-2 ring-[#2F6FED]/40"
                aria-hidden="true"
              />
            </m.div>
            <m.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="mx-auto mb-5 max-w-sm text-center text-[13px] leading-relaxed text-[#637089] dark:text-[#9AA8C0]"
            >
              <span data-edit-ui="chat.welcome">{t("chat.welcome")}</span>
            </m.p>
            <m.p
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="mb-2 text-[10px] font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]"
            >
              {t("chat.suggestions")}
            </m.p>
            <div className="grid gap-2">
              {quickQuestions.map((question) => (
                <m.button
                  key={question}
                  type="button"
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => ask(question)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white/85 p-3 text-start text-xs font-medium text-slate-700 shadow-xs transition-colors hover:border-[#2F6FED]/60 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/40 hover:text-[#173B6C] dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:bg-white/[0.07] dark:hover:text-white"
                >
                  <span className="leading-snug">{question}</span>
                  <ArrowUp
                    className="h-3.5 w-3.5 shrink-0 rotate-45 text-slate-400 transition-all group-hover:rotate-90 group-hover:text-[#2F6FED] rtl:-rotate-45 rtl:group-hover:-rotate-90 dark:group-hover:text-indigo-300"
                    aria-hidden="true"
                  />
                </m.button>
              ))}
            </div>
          </m.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <m.div
                key={message.id}
                layout="position"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "user" ? (
                  <p className="max-w-[85%] rounded-2xl rounded-ee-md bg-gradient-to-br from-[#173B6C] to-[#2F6FED] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap text-white shadow-md shadow-blue-500/15 dark:from-[#4F46E5] dark:to-[#6366F1]">
                    {message.content}
                  </p>
                ) : (
                  <div className="flex w-full gap-2.5">
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#173B6C]/10 via-[#2F6FED]/15 to-[#0891B2]/10 text-[#2F6FED] ring-1 ring-[#173B6C]/10 dark:from-[#4F46E5]/25 dark:to-[#0891B2]/25 dark:text-[#67E8F9] dark:ring-white/10"
                      aria-hidden="true"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <AssistantMessage
                        message={message}
                        onAsk={ask}
                        isLast={index === messages.length - 1}
                      />
                    </div>
                  </div>
                )}
              </m.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div
        className={cn(
          "border-t border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#07101F]/90",
          compact ? "p-3" : "p-3 sm:p-4",
        )}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="relative rounded-2xl border border-slate-200/90 bg-slate-50/80 transition-all duration-200 focus-within:border-[#2F6FED] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2F6FED]/10 dark:border-white/10 dark:bg-white/[0.03] dark:focus-within:border-indigo-400/60 dark:focus-within:bg-[#0A1326] dark:focus-within:ring-indigo-500/15"
        >
          <label htmlFor="assistant-input" className="sr-only">
            {placeholder ?? t("chat.placeholder")}
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={4000}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder ?? t("chat.placeholder")}
            className="block max-h-[180px] w-full resize-none bg-transparent px-3.5 py-3 pe-12 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {busy ? (
            <button
              type="button"
              onClick={stopStreaming}
              aria-label={t("chat.stop")}
              className="absolute end-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
            >
              <Square className="h-3 w-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={t("chat.send")}
              className="absolute end-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-md shadow-blue-500/25 transition-all duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2]"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-[10.5px] text-slate-400 dark:text-slate-500">
          <span data-edit-ui="chat.disclaimer">{t("chat.disclaimer")}</span>
        </p>
      </div>
    </div>
  );
}
