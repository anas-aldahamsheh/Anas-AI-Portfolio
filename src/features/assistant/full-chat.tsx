"use client";

import { RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { ChatView } from "./chat-view";
import { resetConversation, useAssistantState } from "./store";

/** Full-page conversation (same conversation as the side panel, so nothing is lost switching). */
export function FullChat({
  quickQuestions,
  placeholder,
}: {
  quickQuestions: string[];
  placeholder?: string;
}) {
  const { t } = useI18n();
  const { messages } = useAssistantState();
  return (
    <div className="relative mx-auto flex h-[min(78vh,860px)] max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#E5EAF2] bg-white/90 shadow-[0_30px_80px_-50px_rgba(23,59,108,0.5)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#07101F]/80">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4F46E5]/15 to-[#0891B2]/15 blur-3xl"
      />
      {messages.length > 0 ? (
        <div className="relative z-10 flex justify-end border-b border-[#E5EAF2] px-4 py-2 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={resetConversation}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#637089] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("chat.new")}
          </button>
        </div>
      ) : null}
      <div className="relative z-10 min-h-0 flex-1">
        <ChatView quickQuestions={quickQuestions} {...(placeholder ? { placeholder } : {})} />
      </div>
    </div>
  );
}
