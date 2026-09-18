import type { GenericBlockData } from "../domain/blocks";
import { HeadingBlock } from "./blocks/heading-block";
import { RichTextBlock } from "./blocks/rich-text-block";
import { CtaBlock } from "./blocks/cta-block";
import { MetricsBlock } from "./blocks/metrics-block";
import { CardCollectionBlock } from "./blocks/card-collection-block";
import { SkillTagsBlock } from "./blocks/skill-tags-block";
import { CodeBlock } from "./blocks/code-block";
import { QuoteBlock } from "./blocks/quote-block";

interface BlockRendererProps {
  block: GenericBlockData;
  locale?: string | undefined;
}

export function BlockRenderer({ block, locale }: BlockRendererProps) {
  if (!block.isVisible) return null;

  switch (block.blockType) {
    case "heading":
      return <HeadingBlock config={block.config} content={block.content} />;
    case "rich_text":
      return <RichTextBlock config={block.config} content={block.content} />;
    case "cta":
      return <CtaBlock config={block.config} content={block.content} locale={locale} />;
    case "metrics":
      return <MetricsBlock content={block.content} />;
    case "card_collection":
      return <CardCollectionBlock config={block.config} content={block.content} locale={locale} />;
    case "skill_tags":
      return <SkillTagsBlock content={block.content} />;
    case "code_block":
      return <CodeBlock config={block.config} content={block.content} />;
    case "quote":
      return <QuoteBlock content={block.content} />;
    default:
      return null;
  }
}
