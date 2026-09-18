import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  pages,
  sections,
  sectionTranslations,
  sectionBlocks,
  sectionBlockTranslations,
} from "@/lib/db/schema/content";
import { logger } from "@/lib/observability/logger";
import type { SupportedLocale } from "@/modules/localization/domain/locales";
import type { SectionData } from "../domain/sections";
import type { GenericBlockData, BlockType } from "../domain/blocks";
import { getDefaultHomeSections } from "./default-home-sections";

interface CacheEntry {
  sections: SectionData[];
  cachedAt: number;
}

const CACHE_TTL_MS = 60 * 1000;
const DB_TIMEOUT_MS = 300;

class SectionService {
  private cache: Map<string, CacheEntry> = new Map();

  private getCacheKey(pageSlug: string, locale: string, includeDrafts: boolean): string {
    return `${pageSlug}:${locale}:${includeDrafts ? "all" : "published"}`;
  }

  private async queryWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  public invalidateCache(pageSlug?: string): void {
    if (pageSlug) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${pageSlug}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Retrieves all ordered, visible sections and composable blocks for a page.
   */
  public async getPageSections(
    pageSlug: string,
    locale: SupportedLocale,
    includeDrafts = false,
  ): Promise<SectionData[]> {
    const cacheKey = this.getCacheKey(pageSlug, locale, includeDrafts);
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      return cached.sections;
    }

    try {
      // 1. Find page by slug
      const pageQuery = db.select().from(pages).where(eq(pages.slug, pageSlug)).limit(1);

      const foundPages = await this.queryWithTimeout(pageQuery, DB_TIMEOUT_MS);

      if (foundPages.length > 0 && foundPages[0]) {
        const page = foundPages[0];

        // 2. Query sections for page
        const statusFilter = includeDrafts ? undefined : eq(sections.status, "PUBLISHED");

        const sectionsQuery = db
          .select()
          .from(sections)
          .where(
            statusFilter
              ? and(eq(sections.pageId, page.id), eq(sections.isVisible, true), statusFilter)
              : and(eq(sections.pageId, page.id), eq(sections.isVisible, true)),
          )
          .orderBy(asc(sections.orderIndex));

        const rawSections = await this.queryWithTimeout(sectionsQuery, DB_TIMEOUT_MS);

        if (rawSections.length > 0) {
          // 3. Query section translations
          const sectionTransQuery = db
            .select()
            .from(sectionTranslations)
            .where(eq(sectionTranslations.localeCode, locale));

          // 4. Query blocks
          const blocksQuery = db
            .select()
            .from(sectionBlocks)
            .where(eq(sectionBlocks.isVisible, true))
            .orderBy(asc(sectionBlocks.orderIndex));

          // 5. Query block translations
          const blockTransQuery = db
            .select()
            .from(sectionBlockTranslations)
            .where(eq(sectionBlockTranslations.localeCode, locale));

          const [rawTrans, rawBlocks, rawBlockTrans] = await Promise.all([
            this.queryWithTimeout(sectionTransQuery, DB_TIMEOUT_MS).catch(() => []),
            this.queryWithTimeout(blocksQuery, DB_TIMEOUT_MS).catch(() => []),
            this.queryWithTimeout(blockTransQuery, DB_TIMEOUT_MS).catch(() => []),
          ]);

          const transMap = new Map(rawTrans.map((t) => [t.sectionId, t]));
          const blockTransMap = new Map(rawBlockTrans.map((bt) => [bt.blockId, bt]));

          const assembledSections: SectionData[] = rawSections.map((sec) => {
            const secTrans = transMap.get(sec.id);
            const secBlocks: GenericBlockData[] = rawBlocks
              .filter((b) => b.sectionId === sec.id)
              .map((b) => {
                const bTrans = blockTransMap.get(b.id);
                return {
                  id: b.id,
                  blockType: b.blockType as BlockType,
                  orderIndex: b.orderIndex,
                  isVisible: b.isVisible,
                  config: (b.config as Record<string, unknown>) || {},
                  content: (bTrans?.content as Record<string, unknown>) || {},
                };
              });

            return {
              id: sec.id,
              pageId: sec.pageId,
              sectionType: sec.sectionType,
              orderIndex: sec.orderIndex,
              isVisible: sec.isVisible,
              status: sec.status,
              title: secTrans?.title ?? undefined,
              subtitle: secTrans?.subtitle ?? undefined,
              blocks: secBlocks,
            };
          });

          this.cache.set(cacheKey, {
            sections: assembledSections,
            cachedAt: now,
          });

          return assembledSections;
        }
      }
    } catch (error) {
      logger.warn("Failed to load page sections from database, using baseline fallbacks", {
        metadata: { pageSlug, error: String(error) },
      });
    }

    // Baseline fallbacks for home page
    if (pageSlug === "home" || pageSlug === "") {
      const defaultSections = getDefaultHomeSections(locale);
      this.cache.set(cacheKey, {
        sections: defaultSections,
        cachedAt: now,
      });
      return defaultSections;
    }

    return [];
  }
}

export const sectionService = new SectionService();
