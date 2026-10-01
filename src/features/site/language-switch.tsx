"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "@/i18n/provider";
import { LOCALE_COOKIE, otherLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Switches language on the same page, keeping the query string and the hash. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const target = otherLocale(locale);
  const code = target === "ar" ? "AR" : "EN";

  const switchLanguage = () => {
    const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
    // Read at click time (no useSearchParams): keeps the page statically renderable.
    const { search, hash } = window.location;
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.push(`/${target}${rest}${search}${hash}`, { scroll: false }));
  };

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={`${t("nav.languageLabel")} (${code})`}
      title={t("nav.languageLabel")}
      disabled={pending}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 px-2.5 text-xs font-bold text-neutral-800 shadow-2xs transition-all duration-200 hover:bg-neutral-100 active:scale-95 disabled:opacity-60 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]",
        className,
      )}
    >
      <span lang={target}>{code}</span>
    </button>
  );
}
