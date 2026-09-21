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
        className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-2 py-0.5 font-manrope text-[11px] font-semibold text-[#173B6C] shadow-2xs transition-all hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/40 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-[#67E8F9] dark:hover:bg-indigo-900/50 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={citation.title}
        data-testid={`citation-badge-${citation.citationId}`}
      >
        <svg
          className="h-3 w-3 text-[#2F6FED] dark:text-[#67E8F9]"
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
          className="absolute start-0 bottom-full z-50 mb-2 w-76 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 text-start shadow-xl backdrop-blur-xl duration-150 animate-in fade-in zoom-in-95 dark:border-white/10 dark:bg-[#07101F]/95 font-manrope"
          data-testid={`citation-popover-${citation.citationId}`}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#173B6C] uppercase dark:bg-indigo-950/60 dark:text-cyan-300">
              {citation.sourceType}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
              aria-label={t("chat.close")}
            >
              ✕
            </button>
          </div>

          <h4 className="mb-1 line-clamp-2 font-space-grotesk text-xs font-bold leading-snug text-slate-900 dark:text-white">
            {citation.title}
          </h4>

          {citation.headingHierarchy && citation.headingHierarchy.length > 0 && (
            <p className="mb-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">{t("chat.citations.section")}:</span>
              <span>{citation.headingHierarchy.join(" › ")}</span>
            </p>
          )}

          {sourceUrl && (
            <div className="mt-2 border-t border-slate-200/80 pt-2 dark:border-white/[0.08]">
              <Link
                href={sourceUrl}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6FED] hover:underline focus:outline-none dark:text-cyan-400"
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
