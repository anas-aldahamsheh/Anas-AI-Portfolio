import type { ShowcaseItem } from "@/server/content/collections";
import noesis from "./noesis/project.json";
import noesisShowcase from "./noesis/showcase.json";
import corpusforge from "./corpusforge/project.json";
import corpusforgeShowcase from "./corpusforge/showcase.json";
import websiteQaAgent from "./website-qa-agent/project.json";
import websiteQaAgentShowcase from "./website-qa-agent/showcase.json";
import cvChecker from "./cv-checker/project.json";
import cvCheckerShowcase from "./cv-checker/showcase.json";
import examMaker from "./exam-maker/project.json";
import examMakerShowcase from "./exam-maker/showcase.json";
import aiGiantStore from "./ai-giant-store/project.json";
import aiGiantStoreShowcase from "./ai-giant-store/showcase.json";

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
  /** Source file name of the screenshot used as the cover (defaults to the first desktop one). */
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

const PROJECTS: { project: ProjectSource; showcase: ShowcaseSource }[] = [
  { project: noesis, showcase: noesisShowcase as ShowcaseSource },
  { project: corpusforge, showcase: corpusforgeShowcase as ShowcaseSource },
  { project: websiteQaAgent, showcase: websiteQaAgentShowcase as ShowcaseSource },
  { project: cvChecker, showcase: cvCheckerShowcase as ShowcaseSource },
  { project: examMaker, showcase: examMakerShowcase as ShowcaseSource },
  { project: aiGiantStore, showcase: aiGiantStoreShowcase as ShowcaseSource },
];

export interface ProjectRelease {
  slug: string;
  orderIndex: number;
  data: Record<string, unknown>;
  i18n: Record<string, Record<string, unknown>>;
}

export function projectEntries(): ProjectRelease[] {
  return PROJECTS.map(({ project, showcase }, orderIndex) => {
    const items = showcase.map(({ source: _source, ...item }) => item);
    const chosen = project.cover
      ? showcase.find((item) => item.source === project.cover && item.kind === "image")
      : undefined;
    if (project.cover && !chosen) {
      throw new Error(`${project.slug}: cover "${project.cover}" is not one of its screenshots`);
    }
    const cover =
      chosen?.src ??
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
