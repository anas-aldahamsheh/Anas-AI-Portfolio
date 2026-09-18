interface GuestReassuranceBadgeProps {
  title?: string;
  description?: string;
  ariaLabel?: string;
  locale?: string;
  className?: string;
}

/**
 * Guest-First Reassurance Banner / Badge.
 * Informs recruiters and visitors that all portfolio content, CV downloads,
 * and AI tools are fully accessible without registration or login.
 *
 * Visually restrained, zero-gradient, accessible, and dynamically localized.
 */
export function GuestReassuranceBadge({
  title,
  description,
  ariaLabel,
  locale = "ar",
  className = "",
}: GuestReassuranceBadgeProps) {
  const isArabic = locale === "ar";

  const resolvedTitle = title ?? (isArabic ? "وصول مباشر ومجاني بالكامل" : "Guest-First Access");
  const resolvedDescription =
    description ??
    (isArabic
      ? "كافة المشاريع، دراسات الحالة، معاينة وتنزيل السيرة الذاتية، والمساعد الذكي متاحة فوراً كزائر بدون أي قيود أو تسجيل دخول."
      : "All projects, case studies, CV preview/download, and interactive AI capabilities are immediately available as a guest without signing up.");
  const resolvedAriaLabel =
    ariaLabel ?? (isArabic ? "معلومات وصول الزوار" : "Guest access information");

  return (
    <aside
      aria-label={resolvedAriaLabel}
      className={`rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-xs text-neutral-700 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
        <div className="flex-1 space-y-1">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{resolvedTitle}</p>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            {resolvedDescription}
          </p>
        </div>
      </div>
    </aside>
  );
}
