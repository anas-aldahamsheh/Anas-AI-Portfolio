import type { SectionData } from "../domain/sections";
import { BlockRenderer } from "./block-renderer";
import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";
import { EditableRegion } from "@/modules/admin/presentation/editable-region";

interface SectionRendererProps {
  section: SectionData;
  locale?: string | undefined;
  className?: string | undefined;
}

export function SectionRenderer({ section, locale, className }: SectionRendererProps) {
  if (!section.isVisible || section.status !== "PUBLISHED") {
    return null;
  }

  const sectionId = section.id.startsWith("sec-") ? section.id : `sec-${section.id}`;
  const headingId = `${sectionId}-heading`;

  return (
    <section
      id={sectionId}
      aria-labelledby={section.title ? headingId : undefined}
      className={cn("w-full space-y-6 py-6", className)}
    >
      <FadeIn delay={0.05}>
        {/* Section Header if title exists and no heading block is the first block */}
        {section.title && section.blocks[0]?.blockType !== "heading" && (
          <EditableRegion
            editableRef={{
              entityType: "section",
              entityId: section.id,
              fieldOrBlockId: "header",
              locale: locale === "en" ? "en" : "ar",
              title: section.title,
              initialData: {
                title: section.title,
                subtitle: section.subtitle || "",
              },
            }}
          >
            <div className="space-y-1 text-start">
              <h2
                id={headingId}
                className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100"
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
                  {section.subtitle}
                </p>
              )}
            </div>
          </EditableRegion>
        )}

        {/* Ordered Section Blocks */}
        <div className="space-y-6">
          {section.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} locale={locale} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
