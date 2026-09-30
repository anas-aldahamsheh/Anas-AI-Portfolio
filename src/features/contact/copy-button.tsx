"use client";

import { AnimatePresence, m } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="relative z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-3 text-xs font-semibold text-[#637089] transition-colors hover:border-[#D0E2FF] hover:text-[#173B6C] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#9AA8C0] dark:hover:text-white"
      aria-label={copied ? copiedLabel : `${label} ${value}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={copied ? "done" : "copy"}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.15 }}
          className="inline-flex"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </m.span>
      </AnimatePresence>
      {copied ? copiedLabel : label}
    </button>
  );
}
