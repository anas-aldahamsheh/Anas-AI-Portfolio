import type { GenericBlockData } from "../domain/blocks";
import { HeadingBlock } from "./blocks/heading-block";
import { RichTextBlock } from "./blocks/rich-text-block";
import { CtaBlock } from "./blocks/cta-block";
import { MetricsBlock } from "./blocks/metrics-block";
import { CardCollectionBlock } from "./blocks/card-collection-block";
import { SkillTagsBlock } from "./blocks/skill-tags-block";
import { CodeBlock } from "./blocks/code-block";
import { QuoteBlock } from "./blocks/quote-block";
import { EditableRegion } from "@/modules/admin/presentation/editable-region";

interface BlockRendererProps {
  block: GenericBlockData;
  locale?: string | undefined;
}

export function BlockRenderer({ block, locale }: BlockRendererProps) {
  if (!block.isVisible) return null;

  let blockContent: React.ReactNode = null;

  switch (block.blockType) {
    case "heading":
      blockContent = <HeadingBlock config={block.config} content={block.content} />;
      break;
    case "rich_text":
      blockContent = <RichTextBlock config={block.config} content={block.content} />;
      break;
    case "cta":
      blockContent = <CtaBlock config={block.config} content={block.content} locale={locale} />;
      break;
    case "metrics":
      blockContent = <MetricsBlock content={block.content} />;
      break;
    case "card_collection":
      blockContent = (
        <CardCollectionBlock config={block.config} content={block.content} locale={locale} />
      );
      break;
    case "skill_tags":
      blockContent = <SkillTagsBlock content={block.content} />;
      break;
    case "code_block":
      blockContent = <CodeBlock config={block.config} content={block.content} />;
      break;
    case "quote":
      blockContent = <QuoteBlock content={block.content} />;
      break;
    default:
      return null;
  }

  return (
    <EditableRegion
      editableRef={{
        entityType: "block",
        entityId: block.id,
        fieldOrBlockId: block.blockType,
        locale: locale === "en" ? "en" : "ar",
        title: `${block.blockType} block`,
        initialData: {
          config: block.config,
          content: block.content,
        },
      }}
    >
      {blockContent}
    </EditableRegion>
  );
}
