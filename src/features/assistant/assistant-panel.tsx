"use client";

import Link from "next/link";
import { AnimatePresence, m, useDragControls } from "motion/react";
import { Maximize2, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/provider";
import { AssistantAvatar } from "./assistant-avatar";
import { ChatView } from "./chat-view";
import { OPEN_EVENT } from "./events";
import { resetConversation, useAssistantState } from "./store";
import { useVisualViewport } from "./use-visual-viewport";

const WIDE = "(min-width: 640px)";
const subscribeWide = (callback: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const readWide = () => window.matchMedia(WIDE).matches;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

/**
 * The conversation window. It pops out of the launcher's corner: a floating card on tablets and
 * desktops (the page stays usable beside it), a full-height sheet on phones that follows the
 * on-screen keyboard and can be swiped down to close.
 */
export function AssistantPanel({
  open,
  onClose,
  quickQuestions,
  name,
  avatar,
}: {
  open: boolean;
  onClose: () => void;
  quickQuestions: string[];
  name: string;
  avatar?: string | undefined;
}) {
  const { t, locale } = useI18n();
  const wide = useSyncExternalStore(subscribeWide, readWide, () => true);
  const { messages } = useAssistantState();
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  useVisualViewport(panelRef, open && !wide);

  // Remember what had focus, and give it back when the panel closes (or the launcher, which
  // re-appears in the panel's place).
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const target = previous?.isConnected
            ? previous
            : document.getElementById("assistant-launcher");
          target?.focus({ preventScroll: true });
        }),
      );
    };
  }, [open]);

  // Escape closes; on phones the sheet is modal, so Tab stays inside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || wide || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, wide]);

  // On tablets and desktops a click anywhere outside the card closes it, like the X. Clicks that
  // open the assistant (an "Ask AI" button) keep it open, and so does finishing a text
  // selection that started inside the card. Phones use the scrim behind the sheet instead.
  useEffect(() => {
    if (!open || !wide) return;
    let reopening = false;
    let pressedInside = false;
    const onOpen = () => {
      reopening = true;
      setTimeout(() => (reopening = false), 0);
    };
    // Where the press started decides: a selection dragged out of the card is not a click outside.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      pressedInside = target instanceof Node && Boolean(panelRef.current?.contains(target));
    };
    const onClick = (event: MouseEvent) => {
      const panel = panelRef.current;
      const target = event.target;
      if (reopening || pressedInside || !panel || !(target instanceof Node)) return;
      if (!target.isConnected || panel.contains(target)) return;
      onClose();
    };
    // Attach after the click that opened the panel has finished.
    const frame = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", onPointerDown, true);
      document.addEventListener("click", onClick);
    });
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open, wide, onClose]);

  // The phone sheet covers the page: stop the page behind it from scrolling.
  useEffect(() => {
    if (!open || wide) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open, wide]);

  const rtl = locale === "ar";
  // Grow from the launcher's corner (bottom-end), so the chat visibly comes out of it.
  const origin = wide
    ? `${rtl ? "1.75rem" : "calc(100% - 1.75rem)"} calc(100% - 1.75rem)`
    : `${rtl ? "2.75rem" : "calc(100% - 2.75rem)"} 100%`;

  return (
    <AnimatePresence>
      {open ? (
        <>
          {!wide ? (
            <m.div
              key="scrim"
              aria-hidden="true"
              className="fixed inset-0 z-50 bg-slate-950/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
            />
          ) : null}
          <m.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal={!wide}
            aria-labelledby="assistant-title"
            className="assistant-sheet fixed inset-x-0 z-50 flex flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-10px_60px_-20px_rgba(15,23,42,0.45)] ring-1 ring-[#173B6C]/10 sm:inset-x-auto sm:end-6 sm:w-[25.5rem] sm:rounded-[28px] sm:shadow-[0_30px_90px_-24px_rgba(15,23,42,0.5)] lg:w-[27rem] dark:bg-[#0A1426] dark:ring-white/10"
            style={{ transformOrigin: origin }}
            initial={{ opacity: 0, scale: 0.3, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.35, y: 28, transition: { duration: 0.22 } }}
            transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
            drag={wide ? false : "y"}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
          >
            {/* Brand wash behind the header (static gradient, no blur filter). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(120%_100%_at_100%_0%,rgb(47_111_237/0.14),transparent_60%),radial-gradient(90%_90%_at_0%_0%,rgb(8_145_178/0.1),transparent_55%)] dark:bg-[radial-gradient(120%_100%_at_100%_0%,rgb(99_102_241/0.22),transparent_60%),radial-gradient(90%_90%_at_0%_0%,rgb(8_145_178/0.14),transparent_55%)]"
            />

            {!wide ? (
              <div
                className="relative flex touch-none justify-center pt-2.5 pb-1"
                onPointerDown={(event) => drag.start(event)}
                aria-hidden="true"
              >
                <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
              </div>
            ) : null}

            <header
              className="relative flex items-center gap-3 px-4 pt-2 pb-3 max-sm:touch-none sm:px-5 sm:pt-4"
              onPointerDown={(event) => {
                if (!wide && !(event.target as HTMLElement).closest("button, a")) drag.start(event);
              }}
            >
              <AssistantAvatar name={name} avatar={avatar} online />
              <div className="min-w-0 flex-1">
                <h2
                  id="assistant-title"
                  className="font-display truncate text-[15px] leading-5 font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]"
                >
                  <span data-edit-ui="chat.title">{t("chat.title")}</span>
                </h2>
                <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] leading-4 text-[#637089] dark:text-[#9AA8C0]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="truncate" data-edit-ui="chat.subtitle">
                    {t("chat.subtitle")}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={t("chat.new")}
                    title={t("chat.new")}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
                {wide ? (
                  <Link
                    href={`/${locale}/chat`}
                    onClick={onClose}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={t("chat.expand")}
                    title={t("chat.expand")}
                  >
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={t("chat.close")}
                  title={t("chat.close")}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </header>

            <m.div
              className="relative min-h-0 flex-1 border-t border-[#E5EAF2] dark:border-white/[0.08]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.08, duration: 0.25 } }}
            >
              <ChatView
                quickQuestions={quickQuestions}
                autoFocus={wide}
                compact
                name={name}
                avatar={avatar}
              />
            </m.div>
          </m.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
