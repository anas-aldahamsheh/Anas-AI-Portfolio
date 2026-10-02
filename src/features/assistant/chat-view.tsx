"use client";

import { AnimatePresence, m } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Check,
  Copy,
  CornerDownLeft,
  Cpu,
  FolderKanban,
  RotateCcw,
  Sparkles,
  Square,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/messages";
import { cn } from "@/lib/utils";
import { AssistantAvatar } from "./assistant-avatar";
import { textDir } from "./direction";
import { Markdown } from "./markdown";
import { contextPrompts, readPageContext } from "./page-context";
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

const CAPABILITIES: {
  icon: LucideIcon;
  title: MessageKey;
  hint: MessageKey;
  prompt?: MessageKey;
  prefill?: MessageKey;
  tone: string;
}[] = [
  {
    icon: FolderKanban,
    title: "chat.cap.projects",
    hint: "chat.cap.projects.hint",
    prompt: "chat.cap.projects.prompt",
    tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    icon: Cpu,
    title: "chat.cap.skills",
    hint: "chat.cap.skills.hint",
    prompt: "chat.cap.skills.prompt",
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  },
  {
    icon: Briefcase,
    title: "chat.cap.experience",
    hint: "chat.cap.experience.hint",
    prompt: "chat.cap.experience.prompt",
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    icon: Target,
    title: "chat.cap.fit",
    hint: "chat.cap.fit.hint",
    prefill: "chat.cap.fit.prefill",
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
];

const MAX_COMPOSER = 160;

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
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={current?.label ?? "thinking"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="[animation:soft-pulse_1.6s_ease-in-out_infinite]"
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
  onRetry,
  isLast,
}: {
  message: ChatMessage;
  onAsk: (q: string) => void;
  onRetry: () => void;
  isLast: boolean;
}) {
  const { t, locale } = useI18n();
  const streaming = message.status === "streaming";
  // The answer, its sources and follow-ups are laid out in the answer's own language.
  const dir = textDir(message.content, locale === "ar" ? "rtl" : "ltr");

  return (
    <div dir={dir} className="group/msg space-y-2.5 text-start">
      {streaming && !message.content ? <Thinking steps={message.steps} /> : null}
      {message.content ? (
        <div
          className={cn(
            streaming &&
              "[&>div>*:last-child]:after:ms-0.5 [&>div>*:last-child]:after:inline-block [&>div>*:last-child]:after:h-3.5 [&>div>*:last-child]:after:w-[2px] [&>div>*:last-child]:after:translate-y-0.5 [&>div>*:last-child]:after:animate-pulse [&>div>*:last-child]:after:bg-[#2F6FED] [&>div>*:last-child]:after:content-['']",
          )}
        >
          <Markdown text={message.content} sources={message.sources ?? []} dir={dir} />
        </div>
      ) : null}

      {message.status === "error" ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <span>{message.error}</span>
          {isLast ? (
            <button
              type="button"
              onClick={onRetry}
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
            {message.sources.map((source) => {
              const chip = (
                <span className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#334155] transition-colors hover:border-[#2F6FED]/50 hover:text-[#2F6FED] dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#CBD5E1] dark:hover:border-indigo-400/40 dark:hover:text-white">
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
                  <span className="truncate" dir="auto">
                    {source.title}
                  </span>
                </span>
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
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/msg:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
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
                dir={textDir(question, dir)}
                initial={{ opacity: 0, x: dir === "rtl" ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                onClick={() => onAsk(question)}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-[#D0E2FF] bg-[#EEF5FF]/70 px-3 py-2 text-start text-xs font-medium text-[#1E40AF] transition-colors hover:border-[#2F6FED]/60 hover:bg-[#EEF5FF] dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-100 dark:hover:border-indigo-400/50"
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

/** One turn. Memoised: while an answer streams, only that message re-renders. */
const MessageRow = memo(function MessageRow({
  message,
  isLast,
  onAsk,
  onRetry,
  name,
  avatar,
}: {
  message: ChatMessage;
  isLast: boolean;
  onAsk: (q: string) => void;
  onRetry: () => void;
  name: string;
  avatar?: string | undefined;
}) {
  const { t, locale } = useI18n();
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
    >
      {message.role === "user" ? (
        <p
          dir={textDir(message.content, locale === "ar" ? "rtl" : "ltr")}
          className="max-w-[85%] rounded-[20px] rounded-ee-md bg-gradient-to-br from-[#173B6C] to-[#2F6FED] px-3.5 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap text-white shadow-md shadow-blue-500/15 sm:text-[13.5px] dark:from-[#4F46E5] dark:to-[#6366F1]"
        >
          <span className="sr-only">{t("chat.youSaid")}: </span>
          {message.content}
        </p>
      ) : (
        <div className="flex w-full gap-2.5">
          <AssistantAvatar name={name} avatar={avatar} size="sm" className="mt-0.5" />
          <div className="min-w-0 flex-1 pt-0.5">
            <span className="sr-only">{t("chat.aiSaid")}: </span>
            <AssistantMessage message={message} onAsk={onAsk} onRetry={onRetry} isLast={isLast} />
          </div>
        </div>
      )}
    </m.div>
  );
});

/** First screen: who this is, what the visitor can ask, and questions about the current page. */
function Welcome({
  name,
  avatar,
  quickQuestions,
  onAsk,
  onPrefill,
}: {
  name: string;
  avatar?: string | undefined;
  quickQuestions: string[];
  onAsk: (q: string) => void;
  onPrefill: (text: string) => void;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const onPage = useMemo(() => contextPrompts(pathname, locale, t), [pathname, locale, t]);
  const label =
    "mb-2 text-[10.5px] font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]";

  return (
    <m.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      className="flex min-h-full flex-col justify-end gap-5 py-1"
    >
      <m.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        className="space-y-3"
      >
        <AssistantAvatar name={name} avatar={avatar} size="lg" online />
        <div className="space-y-1">
          <p className="font-display text-lg font-bold tracking-tight text-[#173B6C] dark:text-white">
            <span data-edit-ui="chat.hello">{t("chat.hello")}</span>
          </p>
          <p className="text-[13.5px] leading-relaxed text-[#637089] dark:text-[#9AA8C0]">
            <span data-edit-ui="chat.welcome">{t("chat.welcome")}</span>
          </p>
        </div>
      </m.div>

      {onPage.length ? (
        <m.section variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <h3 className={label}>{t("chat.onThisPage")}</h3>
          <div className="flex flex-col gap-1.5">
            {onPage.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onAsk(question)}
                className="group flex w-full items-center gap-2.5 rounded-2xl border border-[#2F6FED]/30 bg-gradient-to-r from-[#EEF5FF] to-[#F5F3FF] px-3.5 py-2.5 text-start text-[13px] font-semibold text-[#1E40AF] transition-colors hover:border-[#2F6FED]/60 dark:border-indigo-400/30 dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-indigo-100"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[#2F6FED] dark:text-indigo-300" />
                <span className="min-w-0 flex-1 leading-snug">{question}</span>
                <ArrowUp
                  className="h-3.5 w-3.5 shrink-0 rotate-45 opacity-60 transition-transform group-hover:rotate-90 rtl:-rotate-45 rtl:group-hover:-rotate-90"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </m.section>
      ) : null}

      <m.section variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <h3 className={label}>{t("chat.capabilities")}</h3>
        <div className="grid grid-cols-2 gap-2">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <button
                key={cap.title}
                type="button"
                onClick={() =>
                  cap.prefill ? onPrefill(t(cap.prefill)) : cap.prompt && onAsk(t(cap.prompt))
                }
                className="group flex flex-col items-start gap-2 rounded-2xl border border-[#E5EAF2] bg-white p-3 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2F6FED]/40 hover:shadow-[0_10px_24px_-14px_rgba(47,111,237,0.45)] active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-indigo-400/40"
              >
                <span
                  className={cn("flex h-8 w-8 items-center justify-center rounded-xl", cap.tone)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="space-y-0.5">
                  <span className="block text-[13px] font-semibold text-[#173B6C] dark:text-white">
                    {t(cap.title)}
                  </span>
                  <span className="block text-[11.5px] leading-snug text-[#637089] dark:text-[#9AA8C0]">
                    {t(cap.hint)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </m.section>

      {quickQuestions.length ? (
        <m.section variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <h3 className={label}>{t("chat.suggestions")}</h3>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.slice(0, 4).map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onAsk(question)}
                className="rounded-full border border-[#D0E2FF] bg-[#F8FAFF] px-3 py-1.5 text-start text-xs font-medium text-[#1E40AF] transition-colors hover:border-[#2F6FED]/60 hover:bg-[#EEF5FF] dark:border-white/10 dark:bg-white/[0.04] dark:text-indigo-100 dark:hover:border-indigo-400/40"
              >
                {question}
              </button>
            ))}
          </div>
        </m.section>
      ) : null}
    </m.div>
  );
}

export function ChatView({
  quickQuestions,
  autoFocus = false,
  compact = false,
  placeholder,
  name = "",
  avatar,
}: {
  quickQuestions: string[];
  autoFocus?: boolean;
  compact?: boolean;
  placeholder?: string;
  name?: string;
  avatar?: string | undefined;
}) {
  const { t, locale } = useI18n();
  const { messages, busy } = useAssistantState();
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  // In the pop-up panel the conversation renders one frame after the window itself, so the tap
  // paints immediately (a long history with markdown would otherwise delay that first frame).
  const [showBody, setShowBody] = useState(!compact);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  const options = useCallback(
    (): SendOptions => ({
      locale,
      page: readPageContext(),
      messages: { rateLimited: t("chat.rateLimited"), error: t("chat.error") },
    }),
    [locale, t],
  );

  const ask = useCallback(
    (text: string) => {
      stickToBottom.current = true;
      void sendMessage(text, options());
    },
    [options],
  );
  const retry = useCallback(() => retryLast(options()), [options]);

  const prefill = (text: string) => {
    setInput(text);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  const submit = () => {
    if (!input.trim() || busy) return;
    ask(input);
    setInput("");
  };

  useEffect(() => {
    if (showBody) return;
    const frame = requestAnimationFrame(() => startTransition(() => setShowBody(true)));
    return () => cancelAnimationFrame(frame);
  }, [showBody]);

  // The welcome screen starts at its top; a conversation follows the stream unless the reader
  // scrolled up to re-read something.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length === 0) el.scrollTop = 0;
    else if (stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, showBody]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  // Auto-grow the composer; a scrollbar appears only past the maximum height.
  const resize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER)}px`;
    el.style.overflowY = el.scrollHeight > MAX_COMPOSER ? "auto" : "hidden";
  }, []);
  useLayoutEffect(resize, [input, resize]);
  useEffect(() => {
    // Web fonts can change the line height after the first measurement.
    void document.fonts?.ready.then(resize);
  }, [resize]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          stickToBottom.current = near;
          setAtBottom(near);
        }}
        className={cn(
          "relative flex-1 space-y-5 overflow-y-auto overscroll-contain",
          compact ? "px-4 py-4 sm:px-5" : "p-4 sm:p-6",
        )}
        role="log"
        aria-live="polite"
        aria-busy={busy}
      >
        {!showBody ? null : messages.length === 0 ? (
          <Welcome
            name={name}
            avatar={avatar}
            quickQuestions={quickQuestions}
            onAsk={ask}
            onPrefill={prefill}
          />
        ) : (
          messages.map((message, index) => (
            <MessageRow
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              onAsk={ask}
              onRetry={retry}
              name={name}
              avatar={avatar}
            />
          ))
        )}
      </div>

      <div
        className={cn(
          "relative border-t border-[#E5EAF2] bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-white/[0.08] dark:bg-[#0A1426]",
          compact ? "sm:px-4" : "sm:px-4 sm:pb-4",
        )}
      >
        <AnimatePresence>
          {!atBottom && messages.length > 0 ? (
            <m.button
              key="to-latest"
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              onClick={() => {
                const el = scrollRef.current;
                if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
              }}
              className="absolute bottom-full left-1/2 z-10 mb-3 -ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EAF2] bg-white text-[#173B6C] shadow-lg dark:border-white/10 dark:bg-[#111C33] dark:text-white"
              aria-label={t("chat.scrollDown")}
              title={t("chat.scrollDown")}
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </m.button>
          ) : null}
        </AnimatePresence>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex items-end gap-2 rounded-[22px] border border-slate-200 bg-slate-50 p-1.5 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[#2F6FED] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(47_111_237/0.1)] dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:border-indigo-400/60 dark:focus-within:bg-[#0D1830] dark:focus-within:shadow-[0_0_0_4px_rgb(99_102_241/0.15)]"
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
            enterKeyHint="send"
            dir="auto"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder ?? t("chat.placeholder")}
            className="block min-h-10 w-full flex-1 resize-none overflow-y-hidden bg-transparent px-2.5 py-2 text-base leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-[14px] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {busy ? (
            <button
              type="button"
              onClick={stopStreaming}
              aria-label={t("chat.stop")}
              title={t("chat.stop")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={t("chat.send")}
              title={t("chat.send")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-md shadow-blue-500/25 transition-all duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:scale-100 dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2]"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-[10.5px] leading-4 text-slate-400 dark:text-slate-500">
          <span data-edit-ui="chat.disclaimer">{t("chat.disclaimer")}</span>
        </p>
      </div>
    </div>
  );
}
