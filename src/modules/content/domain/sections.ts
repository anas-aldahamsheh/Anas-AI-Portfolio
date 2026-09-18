import type { GenericBlockData } from "./blocks";

export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface SectionData {
  id: string;
  pageId: string;
  sectionType: string;
  orderIndex: number;
  isVisible: boolean;
  status: PublishStatus;
  title?: string | undefined;
  subtitle?: string | undefined;
  blocks: GenericBlockData[];
}

export interface PageData {
  id: string;
  slug: string;
  title: string;
  metaDescription?: string | undefined;
  sections: SectionData[];
}
