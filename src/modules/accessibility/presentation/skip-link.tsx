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
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:font-medium focus:text-sm focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
    >
      {label}
    </a>
  );
}
