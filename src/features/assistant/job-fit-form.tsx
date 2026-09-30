"use client";

import { m } from "motion/react";
import { ClipboardList, Sparkles } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { FullChat } from "./full-chat";
import { resetConversation, sendMessage, useAssistantState } from "./store";

const SAMPLE = {
  en: `Senior AI Engineer
Must have: Python, building RAG systems in production, LLM evaluation and testing, deploying AI services to the cloud.
Nice to have: TypeScript/React, vector databases, Kubernetes, fine-tuning open models.`,
  ar: `مهندس ذكاء اصطناعي أول
متطلبات أساسية: Python، بناء أنظمة RAG في بيئة إنتاجية، تقييم واختبار النماذج اللغوية، نشر خدمات الذكاء الاصطناعي على السحابة.
ميزة إضافية: TypeScript/React، قواعد البيانات الشعاعية، Kubernetes، تدريب النماذج المفتوحة (Fine-tuning).`,
};

/** Paste a job description → the assistant maps every requirement to evidence (or a gap). */
export function JobFitForm() {
  const { t, locale } = useI18n();
  const { messages, busy } = useAssistantState();
  const [text, setText] = useState("");

  const analyze = (description: string) => {
    if (!description.trim() || busy) return;
    resetConversation();
    const prompt =
      locale === "ar"
        ? `قيّم مدى ملاءمة أنس لهذه الوظيفة بناءً على أدلة حقيقية من أعماله، مع توضيح الفجوات بصراحة:\n\n${description.trim()}`
        : `Assess how well Anas fits this role, requirement by requirement, using real evidence from his work and stating any gaps honestly:\n\n${description.trim()}`;
    void sendMessage(prompt, {
      locale,
      messages: { rateLimited: t("chat.rateLimited"), error: t("chat.error") },
    });
  };

  if (messages.length > 0) {
    return <FullChat quickQuestions={[]} />;
  }

  return (
    <m.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(event) => {
        event.preventDefault();
        analyze(text);
      }}
      className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-[#E5EAF2] bg-white/90 p-5 shadow-[0_30px_80px_-50px_rgba(23,59,108,0.5)] backdrop-blur-xl sm:p-7 dark:border-white/[0.08] dark:bg-[#07101F]/80"
    >
      <label
        htmlFor="job-description"
        className="flex items-center gap-2 text-sm font-bold text-[#173B6C] dark:text-[#F4F7FF]"
      >
        <ClipboardList className="h-4 w-4 text-[#2F6FED] dark:text-indigo-300" aria-hidden="true" />
        {t("fit.result")}
      </label>
      <textarea
        id="job-description"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t("fit.placeholder")}
        rows={9}
        maxLength={3800}
        className="w-full resize-y rounded-2xl border border-[#E5EAF2] bg-[#F8FAFF] p-4 text-sm leading-relaxed text-[#173B6C] transition-all outline-none placeholder:text-[#637089]/70 focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white dark:focus:bg-[#0A1326]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setText(SAMPLE[locale])}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#637089] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          {t("fit.sample")}
        </button>
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="btn-action-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {t("fit.analyze")}
        </button>
      </div>
    </m.form>
  );
}
