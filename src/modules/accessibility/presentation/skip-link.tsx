"use client";

export interface SkipLinkProps {
  locale: string;
  targetId?: string | undefined;
}

export function SkipLink({ locale, targetId = "main-content" }: SkipLinkProps) {
  const isAr = locale === "ar";
  const label = isAr ? "الانتقال إلى المحتوى الرئيسي" : "Skip to main content";

  return (
    <a
      href={`#${targetId}`}
      className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only transition-all focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >
      {label}
    </a>
  );
}
