"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/messages";
import { AssistantAvatar } from "./assistant-avatar";
import { OPEN_EVENT, type OpenAssistantDetail } from "./events";
import { readPageContext } from "./page-context";
import { sendMessage } from "./store";

// The panel (chat, markdown, gestures) is its own chunk, fetched while the browser is idle.
const loadPanel = () => import("./assistant-panel");
const AssistantPanel = dynamic(() => loadPanel().then((mod) => mod.AssistantPanel), {
  ssr: false,
});

const HINTS: MessageKey[] = [
  "chat.launcher.hint.1",
  "chat.launcher.hint.2",
  "chat.launcher.hint.3",
  "chat.launcher.hint.4",
];

const isWide = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches;

/**
 * The floating "Ask about Anas" pill. It cycles through example questions so visitors see at a
 * glance what they can ask, folds into a round button while a phone scrolls down, and the chat
 * pops out of it when tapped.
 */
export function AssistantLauncher({
  quickQuestions,
  name,
  avatar,
}: {
  quickQuestions: string[];
  name: string;
  avatar?: string | undefined;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hint, setHint] = useState(0);
  const [paused, setPaused] = useState(false);
  const onChatPage = /\/(chat|job-fit)(\/|$)/.test(pathname);

  // Fold to a round button while scrolling down (phones), unfold on the way up.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (y < 240) setCompact(false);
    else if (y > previous + 6) setCompact(true);
    else if (y < previous - 14) setCompact(false);
  });

  // A phone sheet covers the page, so leaving the page (e.g. a source link) closes it.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open && !isWide()) setOpen(false);
  }

  // Fetch the panel code once the page has settled, so the first tap opens instantly.
  useEffect(() => {
    const load = () => void loadPanel().then(() => setReady(true));
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 2500);
    return () => clearTimeout(id);
  }, []);

  // Rotate the example question (not while hovered, open, or in a background tab).
  useEffect(() => {
    if (open || paused) return;
    const id = setInterval(() => {
      if (!document.hidden) setHint((i) => (i + 1) % HINTS.length);
    }, 3800);
    return () => clearInterval(id);
  }, [open, paused]);

  const openPanel = useCallback(
    (detail: OpenAssistantDetail = {}) => {
      void loadPanel().then(() => {
        setReady(true);
        setOpen(true);
        if (detail.prompt) {
          void sendMessage(detail.prompt, {
            locale,
            page: readPageContext(),
            messages: { rateLimited: t("chat.rateLimited"), error: t("chat.error") },
          });
        }
      });
    },
    [locale, t],
  );
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenAssistantDetail>).detail ?? {};
      if (detail.expand) router.push(`/${locale}/chat`);
      else openPanel(detail);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [locale, router, openPanel]);

  // Deep link: /en?ask=... or ?chat=open opens the panel.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ask = params.get("ask");
    if (!ask && params.get("chat") !== "open") return;
    openPanel(ask ? { prompt: ask.slice(0, 2000) } : {});
    params.delete("ask");
    params.delete("chat");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
  }, [openPanel]);

  return (
    <>
      <AnimatePresence>
        {!open && !onChatPage ? (
          <m.button
            key="launcher"
            id="assistant-launcher"
            type="button"
            onClick={() => openPanel()}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-label={t("chat.open")}
            aria-haspopup="dialog"
            data-compact={compact ? "true" : undefined}
            initial={{ opacity: 0, scale: 0.6, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.55, y: 10, transition: { duration: 0.18 } }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="vt-static group fixed end-4 bottom-4 z-40 flex origin-bottom-right items-center rounded-full bg-gradient-to-br from-[#173B6C] via-[#1F4FAE] to-[#2F6FED] p-1.5 text-start text-white shadow-[0_16px_40px_-14px_rgba(30,64,175,0.75)] outline-offset-4 sm:end-6 sm:bottom-6 rtl:origin-bottom-left dark:from-[#312E81] dark:via-[#4F46E5] dark:to-[#0E7490] dark:shadow-[0_16px_44px_-12px_rgba(79,70,229,0.7)]"
          >
            <span className="launcher-halo" aria-hidden="true" />
            <span
              className="beam [--beam-rest-dark:rgb(255_255_255/0.16)] [--beam-rest:rgb(255_255_255/0.2)]"
              aria-hidden="true"
            />
            <AssistantAvatar name={name} avatar={avatar} online />
            {/* The label folds away on phones while scrolling (grid 1fr → 0fr animates width). */}
            <span className="grid grid-cols-[1fr] transition-[grid-template-columns] duration-300 ease-out group-data-[compact=true]:max-sm:grid-cols-[0fr]">
              <span className="min-w-0 overflow-hidden">
                <span className="flex flex-col ps-2.5 pe-3 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 text-[13.5px] leading-5 font-semibold">
                    {t("chat.launcher.title")}
                    <span className="rounded-md bg-white/20 px-1.5 text-[10px] leading-4 font-bold tracking-wide ring-1 ring-white/25">
                      {t("chat.launcher.badge")}
                    </span>
                  </span>
                  <span className="relative block h-4 w-[11.5rem] overflow-hidden text-[11.5px] leading-4 text-white/80">
                    <AnimatePresence initial={false}>
                      <m.span
                        key={hint}
                        className="absolute inset-0 truncate"
                        initial={{ y: "110%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-110%", opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {t(HINTS[hint] ?? "chat.launcher.hint.1")}
                      </m.span>
                    </AnimatePresence>
                  </span>
                </span>
              </span>
            </span>
          </m.button>
        ) : null}
      </AnimatePresence>
      {ready ? (
        <AssistantPanel
          open={open}
          onClose={close}
          quickQuestions={quickQuestions}
          name={name}
          avatar={avatar}
        />
      ) : null}
    </>
  );
}
