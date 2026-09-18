"use client";

import { useTheme } from "./theme-provider";
import type { Theme } from "../domain/theme";

interface ThemeToggleProps {
  locale?: string;
  className?: string;
}

/**
 * Visually restrained, accessible theme toggle component.
 * Cycles smoothly through Light -> Dark -> System without neon or exaggerated gradients.
 */
export function ThemeToggle({ locale = "ar", className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isArabic = locale === "ar";

  const nextThemeMap: Record<Theme, Theme> = {
    light: "dark",
    dark: "system",
    system: "light",
  };

  const cycleTheme = () => {
    setTheme(nextThemeMap[theme]);
  };

  const getLabel = () => {
    if (theme === "system") {
      return isArabic ? "المظهر: تلقائي (النظام)" : "Theme: System";
    }
    if (theme === "dark") {
      return isArabic ? "المظهر: داكن" : "Theme: Dark";
    }
    return isArabic ? "المظهر: فاتح" : "Theme: Light";
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${className}`.trim()}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {/* Icon based on current effective state */}
      {theme === "system" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ) : resolvedTheme === "dark" ? (
        <svg
          width="14"
          height="14"
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
      ) : (
        <svg
          width="14"
          height="14"
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
      )}

      <span>{getLabel()}</span>
    </button>
  );
}
