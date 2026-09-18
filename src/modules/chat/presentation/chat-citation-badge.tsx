"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CitationMapping } from "@/ai/contracts";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";

export interface ChatCitationBadgeProps {
  citation: CitationMapping;
}

export function ChatCitationBadge({ citation }: ChatCitationBadgeProps) {
  const { t, locale } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Determine navigation URL based on source type
  let sourceUrl: string | null = null;
  if (citation.sourceType === "project") {
    sourceUrl = `/${locale}/projects/${citation.sourceId}`;
  } else if (citation.sourceType === "cv") {
    sourceUrl = `/${locale}/cv`;
  }

  return (
    <span ref={containerRef} className="relative mx-0.5 inline-block align-baseline">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/25 focus:ring-primary/40 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium transition-colors focus:ring-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={citation.title}
        data-testid={`citation-badge-${citation.citationId}`}
      >
        <svg
          className="text-primary/70 h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>[{citation.citationId}]</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={citation.title}
          className="bg-card/95 border-border animate-in fade-in zoom-in-95 absolute start-0 bottom-full z-50 mb-2 w-72 rounded-xl border p-3 text-start shadow-xl backdrop-blur-md duration-150"
          data-testid={`citation-popover-${citation.citationId}`}
        >
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
              {citation.sourceType}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent focus:ring-ring rounded p-1 text-xs focus:ring-1 focus:outline-none"
              aria-label={t("chat.close")}
            >
              ✕
            </button>
          </div>

          <h4 className="text-foreground mb-1 line-clamp-2 text-xs leading-snug font-semibold">
            {citation.title}
          </h4>

          {citation.headingHierarchy && citation.headingHierarchy.length > 0 && (
            <p className="text-muted-foreground mb-2 flex items-center gap-1 text-[11px]">
              <span className="text-foreground/70 font-medium">{t("chat.citations.section")}:</span>
              <span>{citation.headingHierarchy.join(" › ")}</span>
            </p>
          )}

          {sourceUrl && (
            <div className="border-border/50 mt-1 border-t pt-2">
              <Link
                href={sourceUrl}
                className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline focus:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <span>{t("chat.citations.open")}</span>
                <svg
                  className="h-3 w-3 rtl:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
