"use client";

import Link from "next/link";
import { m } from "motion/react";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { openAssistant } from "@/features/assistant/events";

export function NotFoundView() {
  const { t, locale } = useI18n();
  const Arrow = locale === "ar" ? ArrowRight : ArrowLeft;
  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20"
      data-pause-offscreen=""
    >
      <div
        aria-hidden="true"
        className="hero-aurora-left aurora-left pointer-events-none absolute -start-40 -top-16 h-[30rem] w-[36rem] rounded-full"
      />
      <div
        aria-hidden="true"
        className="hero-aurora-right aurora-right pointer-events-none absolute -end-40 -bottom-16 h-[30rem] w-[36rem] rounded-full"
      />
      <div className="relative max-w-md text-center">
        <m.div
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-lg"
        >
          <Compass className="h-8 w-8" aria-hidden="true" />
        </m.div>
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-7xl font-bold text-[#173B6C]/15 dark:text-white/10"
        >
          404
        </m.p>
        <m.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display -mt-4 text-2xl font-bold text-[#173B6C] dark:text-[#F4F7FF]"
        >
          {t("notFound.title")}
        </m.h1>
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm text-[#637089] dark:text-[#9AA8C0]"
        >
          {t("notFound.text")}
        </m.p>
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-7 flex flex-wrap justify-center gap-3"
        >
          <Link href={`/${locale}`} className="btn-action-primary">
            <Arrow className="h-4 w-4" aria-hidden="true" />
            {t("common.backHome")}
          </Link>
          <button type="button" onClick={() => openAssistant()} className="btn-action-secondary">
            {t("nav.ask")}
          </button>
        </m.div>
      </div>
    </section>
  );
}
