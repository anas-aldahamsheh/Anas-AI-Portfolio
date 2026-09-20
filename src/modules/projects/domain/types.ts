import { z } from "zod";

export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProjectCategory {
  id: string;
  slug: string;
  name: string;
}

export interface ProjectTag {
  id: string;
  slug: string;
  name: string;
}

export interface Project {
  id: string;
  slug: string;
  status: PublishStatus;
  orderIndex: number;
  isFeatured: boolean;
  coverImageUrl?: string | null | undefined;
  repoUrl?: string | null | undefined;
  demoUrl?: string | null | undefined;
  isDemoEnabled?: boolean | undefined;
  title: string;
  summary: string;
  problem?: string | null | undefined;
  constraints?: string | null | undefined;
  solution?: string | null | undefined;
  architecture?: string | null | undefined;
  implementation?: string | null | undefined;
  challenges?: string | null | undefined;
  decisionsTradeoffs?: string | null | undefined;
  results?: string | null | undefined;
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilterParams {
  search?: string | undefined;
  category?: string | undefined;
  tag?: string | undefined;
  featuredOnly?: boolean | undefined;
  sortBy?: "order" | "latest" | "title" | undefined;
  locale?: string | undefined;
  status?: PublishStatus | undefined;
}

export interface ProjectListResult {
  projects: Project[];
  categories: ProjectCategory[];
  tags: ProjectTag[];
  total: number;
}

export const projectUpdateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  isFeatured: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
  coverImageUrl: z.string().url().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

export interface ProjectDemoConfig {
  isEnabled: boolean;
  demoUrl: string;
}

export const projectDemoConfigSchema = z.object({
  isEnabled: z.boolean(),
  demoUrl: z.string().trim(),
});

export {
  BASELINE_CATEGORIES,
  BASELINE_TAGS,
  BASELINE_PROJECTS_EN,
  BASELINE_PROJECTS_AR,
  getBaselineProjects,
} from "./baseline";
