import type { SectionData } from "../domain/sections";
import { SectionRenderer } from "./section-renderer";

interface DynamicPageProps {
  sections: SectionData[];
  locale?: string | undefined;
  className?: string | undefined;
}

export function DynamicPage({ sections, locale, className }: DynamicPageProps) {
  const visibleSections = sections
    .filter((sec) => sec.isVisible && sec.status === "PUBLISHED")
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className={className || "w-full max-w-4xl space-y-8"}>
      {visibleSections.map((section) => (
        <SectionRenderer key={section.id} section={section} locale={locale} />
      ))}
    </div>
  );
}
