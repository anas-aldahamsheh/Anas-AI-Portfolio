"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { Maximize2, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { ChatView } from "./chat-view";
import { resetConversation, useAssistantState } from "./store";

export function AssistantDrawer({
  open,
  onClose,
  quickQuestions,
}: {
  open: boolean;
  onClose: () => void;
  quickQuestions: string[];
}) {
  const { t, locale } = useI18n();
  const { messages } = useAssistantState();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // Keep keyboard focus inside the dialog.
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const overflow = document.body.style.overflow;
    if (window.matchMedia("(max-width: 639px)").matches) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const fromEnd = locale === "ar" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          key="assistant"
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <m.button
            type="button"
            aria-label={t("chat.close")}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-title"
            className="relative flex h-full w-full flex-col overflow-hidden border-s border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl sm:m-3 sm:h-[calc(100%-1.5rem)] sm:w-[440px] sm:rounded-3xl sm:border dark:border-white/10 dark:bg-[#07101F]/95"
            initial={{ x: fromEnd, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: fromEnd, opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div
              className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#4F46E5]/15 to-[#0891B2]/15 blur-3xl"
              aria-hidden="true"
            />

            <header className="relative z-10 flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.02]">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-md dark:from-[#4F46E5] dark:to-[#0891B2]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span
                    className="absolute -end-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#07101F]"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0">
                  <h2
                    id="assistant-title"
                    className="font-display truncate text-sm font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]"
                  >
                    <span data-edit-ui="chat.title">{t("chat.title")}</span>
                  </h2>
                  <p className="truncate text-[11px] font-medium text-[#2F6FED] dark:text-[#67E8F9]">
                    <span data-edit-ui="chat.subtitle">{t("chat.subtitle")}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={t("chat.new")}
                    title={t("chat.new")}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                ) : null}
                <Link
                  href={`/${locale}/chat`}
                  onClick={onClose}
                  className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={t("chat.expand")}
                  title={t("chat.expand")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={t("chat.close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="relative z-10 min-h-0 flex-1">
              <ChatView quickQuestions={quickQuestions} autoFocus compact />
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
