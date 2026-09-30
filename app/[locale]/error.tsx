"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/i18n/provider";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, locale } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-[#173B6C] dark:text-[#F4F7FF]">
          {t("error.title")}
        </h1>
        <p className="mt-2 text-sm text-[#637089] dark:text-[#9AA8C0]">{t("error.text")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-action-primary">
            {t("error.retry")}
          </button>
          <Link href={`/${locale}`} className="btn-action-secondary">
            {t("common.backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
