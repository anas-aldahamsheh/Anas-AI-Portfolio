"use client";

import { useSyncExternalStore } from "react";
import { m } from "motion/react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDarkNow = () => document.documentElement.classList.contains("dark");

function applyTheme(dark: boolean, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const apply = () => {
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  };
  const value = dark ? "dark" : "light";
  try {
    localStorage.setItem("pf_theme", value);
  } catch {
    // storage disabled
  }
  document.cookie = `pf_theme=${value}; path=/; max-age=31536000; samesite=lax`;
  // Reveal the new theme as a circle growing from the toggle (View Transitions API).
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) {
    apply();
    return;
  }
  root.style.setProperty("--vt-x", `${origin?.x ?? window.innerWidth / 2}px`);
  root.style.setProperty("--vt-y", `${origin?.y ?? 0}px`);
  root.dataset["vt"] = "theme";
  void doc.startViewTransition(apply).finished.finally(() => delete root.dataset["vt"]);
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  // The server can't know the theme; the head script already set the class before paint.
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false);
  const label = dark ? t("nav.themeLight") : t("nav.themeDark");

  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        applyTheme(!dark, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#E4EAF3] bg-white/80 text-[#173B6C] shadow-2xs transition-colors duration-200 hover:bg-neutral-100 active:scale-95 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]",
        className,
      )}
    >
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
        <mask id="theme-moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <m.circle
            r="9"
            fill="black"
            initial={false}
            animate={dark ? { cx: 30, cy: -6 } : { cx: 17, cy: 5 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          />
        </mask>
        <m.circle
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask="url(#theme-moon-mask)"
          initial={false}
          animate={{ r: dark ? 5 : 9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
        <m.g
          initial={false}
          animate={{ opacity: dark ? 1 : 0, rotate: dark ? 0 : -90, scale: dark ? 1 : 0.5 }}
          style={{ originX: "12px", originY: "12px" }}
          transition={{ duration: 0.35 }}
        >
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="20.5" x2="12" y2="22.5" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="1.5" y1="12" x2="3.5" y2="12" />
          <line x1="20.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </m.g>
      </svg>
    </button>
  );
}
