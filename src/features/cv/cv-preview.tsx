"use client";

import { AnimatePresence, m } from "motion/react";
import { ChevronDown, Eye } from "lucide-react";
import { useState } from "react";

/** Loads the PDF viewer only when asked (the file isn't fetched for visitors who never open it). */
export function CvPreview({
  label,
  hideLabel,
  title,
}: {
  label: string;
  hideLabel: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-[#E5EAF2] bg-white px-4 py-2 text-xs font-semibold text-[#637089] shadow-2xs transition-all hover:border-[#D0E2FF] hover:bg-[#EEF5FF] hover:text-[#173B6C] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#9AA8C0] dark:hover:text-[#F4F7FF]"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 rotate-180 transition-transform" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        {open ? hideLabel : label}
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            key="pdf"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="overflow-hidden rounded-2xl border border-[#E5EAF2] bg-[#F8FAFF] dark:border-white/[0.08] dark:bg-white/[0.02]">
              <iframe
                src="/api/cv?inline=1#view=FitH"
                title={title}
                className="h-[78vh] min-h-[520px] w-full"
                loading="lazy"
              />
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
