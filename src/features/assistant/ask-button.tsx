"use client";

import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { openAssistant } from "./events";

/** Opens the assistant with a ready-made question (e.g. "Tell me about this project"). */
export function AskButton({
  prompt,
  children,
  className,
  variant = "secondary",
}: {
  prompt?: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={() => openAssistant(prompt ? { prompt } : {})}
      className={cn(
        variant === "primary" && "btn-action-primary",
        variant === "secondary" && "btn-action-secondary",
        variant === "ghost" &&
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#2F6FED] transition-colors hover:bg-[#EEF5FF] dark:text-indigo-300 dark:hover:bg-white/[0.06]",
        "group",
        className,
      )}
    >
      <Sparkles
        className="h-4 w-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[20deg]"
        aria-hidden="true"
      />
      {children}
    </button>
  );
}
