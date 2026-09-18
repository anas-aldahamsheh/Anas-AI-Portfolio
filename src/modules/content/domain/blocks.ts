import { z } from "zod";

/**
 * Block Type Enum
 * Supported composable block types per docs/features/04_DYNAMIC_SECTION_BUILDER.md
 */
export const BLOCK_TYPES = [
  "heading",
  "rich_text",
  "media",
  "cta",
  "metrics",
  "card_collection",
  "timeline",
  "skill_tags",
  "accordion",
  "code_block",
  "quote",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

// 1. Heading Block Schema
export const headingBlockConfigSchema = z.object({
  level: z.enum(["h1", "h2", "h3", "h4"]).default("h2"),
  align: z.enum(["start", "center", "end"]).default("start"),
});

export const headingBlockContentSchema = z.object({
  text: z.string().min(1),
  subtitle: z.string().optional(),
});

// 2. Rich Text Block Schema
export const richTextBlockConfigSchema = z.object({
  variant: z.enum(["lead", "default", "muted"]).default("default"),
});

export const richTextBlockContentSchema = z.object({
  body: z.string().min(1),
});

// 3. Media Block Schema
export const mediaBlockConfigSchema = z.object({
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "auto"]).default("auto"),
  rounded: z.boolean().default(true),
});

export const mediaBlockContentSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

// 4. CTA Block Schema
export const ctaBlockConfigSchema = z.object({
  variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
  align: z.enum(["start", "center", "end"]).default("start"),
});

export const ctaBlockContentSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  openInNewTab: z.boolean().default(false),
});

// 5. Metrics Block Schema
export const metricItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
});

export const metricsBlockContentSchema = z.object({
  items: z.array(metricItemSchema).min(1),
});

// 6. Card Collection Block Schema
export const cardItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
});

export const cardCollectionBlockContentSchema = z.object({
  items: z.array(cardItemSchema).min(1),
  columns: z.enum(["1", "2", "3", "4"]).default("2"),
});

// 7. Timeline Block Schema
export const timelineItemSchema = z.object({
  period: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  description: z.string().min(1),
  skills: z.array(z.string()).optional(),
});

export const timelineBlockContentSchema = z.object({
  items: z.array(timelineItemSchema).min(1),
});

// 8. Skill Tags Block Schema
export const skillGroupSchema = z.object({
  category: z.string().min(1),
  skills: z.array(z.string()).min(1),
});

export const skillTagsBlockContentSchema = z.object({
  groups: z.array(skillGroupSchema).min(1),
});

// 9. Accordion Block Schema
export const accordionItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

export const accordionBlockContentSchema = z.object({
  items: z.array(accordionItemSchema).min(1),
});

// 10. Code Block Schema
export const codeBlockConfigSchema = z.object({
  language: z.string().default("typescript"),
  showLineNumbers: z.boolean().default(false),
});

export const codeBlockContentSchema = z.object({
  code: z.string().min(1),
  filename: z.string().optional(),
});

// 11. Quote Block Schema
export const quoteBlockContentSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  source: z.string().optional(),
});

export interface GenericBlockData {
  id: string;
  blockType: BlockType;
  orderIndex: number;
  isVisible: boolean;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}
