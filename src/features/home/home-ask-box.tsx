"use client";

import { m } from "motion/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { openAssistant } from "@/features/assistant/events";

/** Hero prompt box: the fastest path from "who is this?" to a grounded answer. */
export function HomeAskBox({ questions }: { questions: string[] }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  const ask = (prompt: string) => {
    if (!prompt.trim()) return;
    openAssistant({ prompt: prompt.trim() });
    setValue("");
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(value);
        }}
        className="group relative isolate flex items-center gap-2 rounded-2xl bg-white/95 p-1.5 shadow-[0_10px_40px_-18px_rgba(47,111,237,0.45)] transition-shadow focus-within:shadow-[0_14px_50px_-16px_rgba(47,111,237,0.6)] dark:bg-[#0B1728]/95"
      >
        <span className="beam" aria-hidden="true" />
        <Sparkles
          className="ms-2.5 h-4 w-4 shrink-0 text-[#2F6FED] dark:text-indigo-300"
          aria-hidden="true"
        />
        <label htmlFor="home-ask" className="sr-only">
          {t("home.ask.placeholder")}
        </label>
        <input
          id="home-ask"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("home.ask.placeholder")}
          maxLength={500}
          autoComplete="off"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#173B6C] placeholder:text-[#637089]/80 focus:outline-none dark:text-white dark:placeholder:text-[#9AA8C0]/80"
        />
        <m.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          disabled={!value.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#173B6C] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E4B8A] disabled:opacity-40 dark:bg-[#4F46E5] dark:hover:bg-[#4338CA]"
        >
          <span className="hidden sm:inline">{t("home.ask.button")}</span>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </m.button>
      </form>
      <div className="flex flex-wrap gap-2">
        {questions.slice(0, 3).map((question, i) => (
          <m.button
            key={question}
            type="button"
            onClick={() => ask(question)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
            whileHover={{ y: -2 }}
            className="rounded-full border border-[#D0E2FF] bg-white/85 px-3 py-1.5 text-start text-xs font-medium text-[#1E40AF] transition-colors hover:border-[#2F6FED]/60 hover:bg-[#EEF5FF] dark:border-white/10 dark:bg-white/[0.05] dark:text-indigo-100 dark:hover:border-indigo-400/40"
          >
            {question}
          </m.button>
        ))}
      </div>
      <p className="text-[11px] text-[#637089] dark:text-[#9AA8C0]">
        <span data-edit-ui="home.ask.hint">{t("home.ask.hint")}</span>
      </p>
    </div>
  );
}
