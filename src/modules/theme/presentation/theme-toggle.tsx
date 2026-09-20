"use client";

import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  locale?: string;
  className?: string;
}

/**
 * Compact square theme toggle button.
 * Directly toggles between Light and Dark mode (no system mode option).
 */
export function ThemeToggle({ locale = "ar", className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isArabic = locale === "ar";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const label = isDark
    ? isArabic
      ? "التبديل إلى الوضع النهاري"
      : "Switch to light mode"
    : isArabic
      ? "التبديل إلى الوضع الليلي"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-700 shadow-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 cursor-pointer ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        /* Sun icon when in dark mode (click switches to light) */
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon icon when in light mode (click switches to dark) */
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
