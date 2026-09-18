"use client";

import { CitationMapping, ScriptDirection } from "@/ai/contracts";
import { ChatCitationBadge } from "./chat-citation-badge";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  direction?: ScriptDirection;
  citations?: CitationMapping[];
  isStreaming?: boolean;
}

export interface ChatMessageProps {
  message: ChatMessageItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
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
            className="border-border/60 bg-muted/90 my-2 overflow-hidden rounded-lg border"
            dir="ltr"
          >
            {hasLang && (
              <div className="text-muted-foreground border-border/40 bg-muted border-b px-3 py-1 font-mono text-[10px] uppercase">
                {firstLine}
              </div>
            )}
            <pre className="text-foreground/90 overflow-x-auto p-3 font-mono text-xs">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Inside normal text, replace [cit:ID] with ChatCitationBadge
      const citeTokenRegex = /(\[cit:[a-zA-Z0-9_\-.:]+\])/g;
      const subParts = seg.split(citeTokenRegex);

      return (
        <span key={idx} className="leading-relaxed whitespace-pre-wrap">
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
        className={`px-4 py-3 text-sm shadow-sm transition-all ${
          isUser
            ? "bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-tr-sm"
            : "bg-card/90 text-card-foreground border-border/70 max-w-[92%] rounded-2xl rounded-tl-sm border"
        }`}
      >
        {renderFormattedContent(message.content, message.citations)}
        {message.isStreaming && (
          <span className="bg-primary ms-1 inline-block h-3.5 w-1.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
