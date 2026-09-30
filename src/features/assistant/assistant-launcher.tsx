"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, m } from "motion/react";
import { Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { OPEN_EVENT, type OpenAssistantDetail } from "./events";
import { sendMessage } from "./store";

// The panel (and its markdown/animation code) loads on first open, not with every page.
const AssistantDrawer = dynamic(
  () => import("./assistant-drawer").then((mod) => mod.AssistantDrawer),
  { ssr: false },
);

export function AssistantLauncher({ quickQuestions }: { quickQuestions: string[] }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const onChatPage = /\/(chat|job-fit)(\/|$)/.test(pathname);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenAssistantDetail>).detail ?? {};
      if (detail.expand) {
        router.push(`/${locale}/chat`);
        return;
      }
      setLoaded(true);
      setOpen(true);
      if (detail.prompt) {
        void sendMessage(detail.prompt, {
          locale,
          messages: { rateLimited: t("chat.rateLimited"), error: t("chat.error") },
        });
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [locale, t, router]);

  // Deep link: /en?ask=... or ?chat=open opens the panel.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ask = params.get("ask");
    if (ask || params.get("chat") === "open") {
      window.dispatchEvent(
        new CustomEvent(OPEN_EVENT, { detail: ask ? { prompt: ask.slice(0, 2000) } : {} }),
      );
      params.delete("ask");
      params.delete("chat");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {!open && !onChatPage ? (
          <m.button
            key="launcher"
            type="button"
            onClick={() => {
              setLoaded(true);
              setOpen(true);
            }}
            onMouseEnter={() => setLoaded(true)}
            onFocus={() => setLoaded(true)}
            aria-label={t("chat.open")}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="border-beam vt-static group fixed end-5 bottom-5 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-to-tr from-[#173B6C] via-[#2F6FED] to-[#0891B2] ps-4 pe-5 text-white shadow-[0_12px_32px_-10px_rgba(47,111,237,0.65)] sm:end-6 sm:bottom-6 dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2]"
          >
            <span
              className="ping-soft pointer-events-none absolute inset-0 rounded-full bg-[#2F6FED]/35"
              aria-hidden="true"
            />
            <Sparkles
              className="relative h-5 w-5 transition-transform duration-500 group-hover:rotate-[20deg]"
              aria-hidden="true"
            />
            <span className="relative hidden text-sm font-semibold sm:inline">
              {t("chat.open")}
            </span>
          </m.button>
        ) : null}
      </AnimatePresence>
      {loaded ? (
        <AssistantDrawer
          open={open}
          onClose={() => setOpen(false)}
          quickQuestions={quickQuestions}
        />
      ) : null}
    </>
  );
}
