"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface LanguageSelectProps {
  currentLocale: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Compact square language toggle button.
 * Directly switches between Arabic (AR) and English (EN) without dropdown select.
 */
export function LanguageSelect({
  currentLocale,
  ariaLabel,
  className,
}: LanguageSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isArabic = currentLocale === "ar";
  const targetLocale = isArabic ? "en" : "ar";

  const handleToggle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (segments[0] === "ar" || segments[0] === "en")) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }
    const newPath = `/${segments.join("/")}`;

    startTransition(() => {
      router.push(newPath);
    });
  };

  const buttonLabel = isArabic ? "EN" : "AR";
  const tooltipLabel =
    ariaLabel ||
    (isArabic ? "التبديل إلى الإنجليزية (English)" : "Switch to Arabic (العربية)");

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E4EAF3] bg-white text-xs font-bold text-[#173B6C] shadow-2xs transition-all duration-200 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED] disabled:opacity-40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08] cursor-pointer ${
        className || ""
      }`.trim()}
      aria-label={tooltipLabel}
      title={tooltipLabel}
      data-testid="language-toggle-button"
    >
      <span className="tracking-wider">{buttonLabel}</span>
    </button>
  );
}
