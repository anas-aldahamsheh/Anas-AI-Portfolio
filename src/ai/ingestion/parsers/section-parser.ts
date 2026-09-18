import { RawDocument } from "@/ai/contracts/ingestion";
import { sectionService } from "@/modules/content/infrastructure/section-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

/**
 * Parses dynamic page sections and blocks into RawDocuments.
 */
export async function parseSections(targetSectionId?: string): Promise<RawDocument[]> {
  const documents: RawDocument[] = [];
  const locales: SupportedLocale[] = ["en", "ar"];

  for (const locale of locales) {
    try {
      const sections = await sectionService.getPageSections("home", locale, false);

      for (const section of sections) {
        if (targetSectionId && section.id !== targetSectionId) {
          continue;
        }

        const lines: string[] = [];
        lines.push(`# ${section.title}`);
        if (section.subtitle) {
          lines.push(`## ${locale === "ar" ? "الوصف" : "Description"}\n${section.subtitle}`);
        }

        // Process blocks
        for (const block of section.blocks) {
          if (!block.isVisible) continue;

          if (block.blockType === "heading" && block.content) {
            const headingContent = block.content as { text?: string; subtitle?: string };
            if (headingContent.text && headingContent.text !== section.title) {
              lines.push(`### ${headingContent.text}`);
            }
            if (headingContent.subtitle && headingContent.subtitle !== section.subtitle) {
              lines.push(headingContent.subtitle);
            }
          } else if (block.blockType === "card_collection" && block.content) {
            const cardContent = block.content as {
              items?: Array<{ title?: string; description?: string; badge?: string }>;
            };
            if (cardContent.items && cardContent.items.length > 0) {
              lines.push(`### ${locale === "ar" ? "العناصر والخدمات" : "Capabilities & Features"}`);
              for (const item of cardContent.items) {
                const itemLine = `- **${item.title ?? ""}**${item.badge ? ` [${item.badge}]` : ""}: ${item.description ?? ""}`;
                lines.push(itemLine);
              }
            }
          } else if (block.blockType === "metrics" && block.content) {
            const metricContent = block.content as {
              items?: Array<{ label?: string; value?: string; description?: string }>;
            };
            if (metricContent.items && metricContent.items.length > 0) {
              lines.push(`### ${locale === "ar" ? "المعايير والأداء" : "Metrics & Standards"}`);
              for (const item of metricContent.items) {
                const itemLine = `- **${item.label ?? ""}**: ${item.value ?? ""}${item.description ? ` (${item.description})` : ""}`;
                lines.push(itemLine);
              }
            }
          }
        }

        const content = lines.join("\n\n").trim();
        if (!content) continue;

        documents.push({
          sourceType: "section",
          sourceId: section.id,
          title: section.title ?? section.sectionType,
          locale,
          content,
          metadata: {
            sectionType: section.sectionType,
            pageId: section.pageId,
            orderIndex: section.orderIndex,
          },
        });
      }
    } catch {
      // Gracefully continue if section query encounters issue
    }
  }

  return documents;
}
