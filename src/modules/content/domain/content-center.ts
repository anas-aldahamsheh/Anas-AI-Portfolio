import { z } from "zod";

export type ContentPublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AdminPageItem {
  id: string;
  slug: string;
  status: ContentPublishStatus;
  isHome: boolean;
  orderIndex: number;
  translations: {
    ar: { title: string; metaDescription?: string | undefined };
    en: { title: string; metaDescription?: string | undefined };
  };
  sectionsCount: number;
  updatedAt: string;
}

export interface AdminSectionItem {
  id: string;
  pageId: string;
  sectionType: string;
  orderIndex: number;
  isVisible: boolean;
  status: ContentPublishStatus;
  translations: {
    ar: { title?: string | undefined; subtitle?: string | undefined };
    en: { title?: string | undefined; subtitle?: string | undefined };
  };
  blocksCount: number;
  updatedAt: string;
}

export interface AdminBlockItem {
  id: string;
  sectionId: string;
  blockType: string;
  orderIndex: number;
  isVisible: boolean;
  config: Record<string, unknown>;
  translations: {
    ar: { content: Record<string, unknown> };
    en: { content: Record<string, unknown> };
  };
}

export interface ContentCenterSummary {
  pages: AdminPageItem[];
  totalPublishedPages: number;
  totalDraftPages: number;
  totalSections: number;
  totalProjects: number;
  pendingDraftCount: number;
}

export const CreatePageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  titleAr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  metaDescriptionAr: z.string().max(500).optional(),
  metaDescriptionEn: z.string().max(500).optional(),
  isHome: z.boolean().optional().default(false),
});

export type CreatePageInput = z.input<typeof CreatePageSchema>;
export type CreatePageOutput = z.output<typeof CreatePageSchema>;

export const UpdatePageStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type UpdatePageStatusInput = z.infer<typeof UpdatePageStatusSchema>;

export const CreateSectionSchema = z.object({
  pageId: z.string().min(1),
  sectionType: z.string().min(1).max(50),
  titleAr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  subtitleAr: z.string().max(300).optional(),
  subtitleEn: z.string().max(300).optional(),
});

export type CreateSectionInput = z.infer<typeof CreateSectionSchema>;

export const UpdateSectionSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isVisible: z.boolean().optional(),
  titleAr: z.string().max(200).optional(),
  titleEn: z.string().max(200).optional(),
  subtitleAr: z.string().max(300).optional(),
  subtitleEn: z.string().max(300).optional(),
});

export type UpdateSectionInput = z.infer<typeof UpdateSectionSchema>;

export const ReorderSectionsSchema = z.object({
  pageId: z.string().min(1),
  sectionIds: z.array(z.string().min(1)).min(1),
});

export type ReorderSectionsInput = z.infer<typeof ReorderSectionsSchema>;
