import type { ShowcaseItem } from "@/server/content/collections";

/**
 * The projects shown on the site, versioned with the code. Each folder holds `project.json`
 * (the case study, in English and Arabic) and `showcase.json` (screenshots and recordings,
 * written by `pnpm media:import`). They reach the database through a content release
 * (src/server/content/release.ts), after which the owner can keep editing them from the admin.
 */
export interface ProjectSource {
  slug: string;
  featured?: boolean;
  category: string;
  tags: string[];
  repoUrl?: string;
  repoPrivate?: boolean;
  demoUrl?: string;
  startDate?: string;
  endDate?: string;
  /** Defaults to the first desktop screenshot. */
  cover?: string;
  en: Record<string, unknown>;
  ar: Record<string, unknown>;
}

type ShowcaseSource = (Omit<
  ShowcaseItem,
  "caption" | "srcLarge" | "poster" | "preview" | "duration"
> &
  Partial<Pick<ShowcaseItem, "srcLarge" | "poster" | "preview" | "duration">> & {
    caption: { en: string; ar: string };
    source?: string;
  })[];

const PROJECTS: { project: ProjectSource; showcase: ShowcaseSource }[] = [];

export interface ProjectRelease {
  slug: string;
  orderIndex: number;
  data: Record<string, unknown>;
  i18n: Record<string, Record<string, unknown>>;
}

export function projectEntries(): ProjectRelease[] {
  return PROJECTS.map(({ project, showcase }, orderIndex) => {
    const items = showcase.map(({ source: _source, ...item }) => item);
    const cover =
      project.cover ??
      items.find((item) => item.kind === "image" && item.device === "desktop")?.src ??
      items.find((item) => item.kind === "video")?.poster ??
      "";
    return {
      slug: project.slug,
      orderIndex,
      data: {
        cover,
        repoUrl: project.repoUrl ?? "",
        repoPrivate: project.repoPrivate ?? false,
        demoUrl: project.demoUrl ?? "",
        tags: project.tags,
        category: project.category,
        featured: project.featured ?? false,
        startDate: project.startDate ?? "",
        endDate: project.endDate ?? "",
        showcase: items,
      },
      i18n: { en: project.en, ar: project.ar },
    };
  });
}
