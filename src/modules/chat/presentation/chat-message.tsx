"use client";

import { useState } from "react";
import { CitationMapping, ScriptDirection, RagDebugTelemetry } from "@/ai/contracts";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { ChatCitationBadge } from "./chat-citation-badge";
import { RagDebugModal } from "./rag-debug-modal";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  direction?: ScriptDirection;
  citations?: CitationMapping[];
  telemetry?: RagDebugTelemetry | undefined;
  isStreaming?: boolean;
}

export interface ChatMessageProps {
  message: ChatMessageItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { t } = useLocalization();
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const isUser = message.role === "user";
  const direction = message.direction || "ltr";

  // Helper to render text with interactive citation badges and LTR code blocks
  const renderFormattedContent = (content: string, citations: CitationMapping[] = []) => {
    // Map citation IDs for fast lookup
    const citMap = new Map<string, CitationMapping>();
    for (const c of citations) {
      if (c.citationId) citMap.set(c.citationId.toLowerCase(), c);
      if (c.sourceId) citMap.set(c.sourceId.toLowerCase(), c);
    }

    // Split content by code blocks ``` first
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const segments = content.split(codeBlockRegex);

    return segments.map((seg, idx) => {
      if (seg.startsWith("```") && seg.endsWith("```")) {
        const codeLines = seg.slice(3, -3).trim().split("\n");
        const firstLine = codeLines[0]?.trim() || "";
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const codeText = hasLang ? codeLines.slice(1).join("\n") : codeLines.join("\n");

        return (
          <div
            key={idx}
            className="my-2.5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900/95 text-slate-100 shadow-sm dark:border-white/10 dark:bg-black/60"
            dir="ltr"
          >
            {hasLang && (
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                <span>{firstLine}</span>
              </div>
            )}
            <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-slate-200">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Inside normal text, replace [cit:ID] with ChatCitationBadge
      const citeTokenRegex = /(\[cit:[a-zA-Z0-9_\-.:]+\])/g;
      const subParts = seg.split(citeTokenRegex);

      return (
        <span key={idx} className="leading-relaxed whitespace-pre-wrap font-manrope">
          {subParts.map((sub, sIdx) => {
            const citeMatch = sub.match(/\[cit:([a-zA-Z0-9_\-.:]+)\]/);
            if (citeMatch && citeMatch[1]) {
              const citId = citeMatch[1];
              const matched = citMap.get(citId.toLowerCase()) || {
                citationId: citId,
                sourceId: citId,
                sourceType: "project" as const,
                title: `Evidence ${citId}`,
                locale: "en" as const,
                occurrences: 1,
              };
              return <ChatCitationBadge key={sIdx} citation={matched} />;
            }
            return sub;
          })}
        </span>
      );
    });
  };

  return (
    <div
      className={`my-3 flex flex-col ${isUser ? "items-end" : "items-start"}`}
      dir={direction}
      data-testid={`chat-message-${message.role}`}
    >
      <div
        className={`px-4 py-3 text-sm transition-all font-manrope ${
          isUser
            ? "max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#173B6C] to-[#2F6FED] text-white shadow-md shadow-indigo-950/15 dark:from-[#4F46E5] dark:to-[#0891B2]"
            : "max-w-[92%] rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white/95 text-slate-800 shadow-xs backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-100"
        }`}
      >
        {renderFormattedContent(message.content, message.citations)}
        {message.isStreaming && (
          <span className="ms-1 inline-block h-3.5 w-1.5 animate-pulse align-middle rounded-xs bg-gradient-to-b from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] shadow-xs" />
        )}
      </div>

      {!isUser && !message.isStreaming && message.telemetry && (
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDebugOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/80 px-2.5 py-1 font-manrope text-[11px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white cursor-pointer"
            data-testid="rag-debug-trigger-button"
            title={t("chat.debug.button")}
          >
            <svg
              className="h-3.5 w-3.5 text-[#2F6FED] dark:text-[#67E8F9]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <span>{t("chat.debug.button")}</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              ({message.telemetry.latencies.totalMs}ms)
            </span>
          </button>

          <RagDebugModal
            isOpen={isDebugOpen}
            onClose={() => setIsDebugOpen(false)}
            telemetry={message.telemetry}
          />
        </div>
      )}
    </div>
  );
}
