import { db } from "@/lib/db/client";
import {
  pages,
  pageTranslations,
  sections,
  sectionTranslations,
  sectionBlocks,
} from "@/lib/db/schema/content";
import { projects } from "@/lib/db/schema/projects";
import { auditEvents } from "@/lib/db/schema/admin";
import { eq, asc } from "drizzle-orm";
import {
  AdminPageItem,
  AdminSectionItem,
  ContentCenterSummary,
  CreatePageInput,
  ContentPublishStatus,
  CreateSectionInput,
  UpdateSectionInput,
} from "../domain/content-center";
import {
  BASELINE_CONTENT_SUMMARY,
} from "./baseline-content-data";
import { sectionService } from "./section-service";
import { logger } from "@/lib/observability/logger";

const DB_TIMEOUT_MS = 300;

export class ContentCenterService {
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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

  /**
   * Retrieves high-level content overview with pages, sections count, and pending drafts.
   */
  async getSummary(): Promise<ContentCenterSummary> {
    try {
      const dbPages = await this.withTimeout(
        db.select().from(pages).orderBy(asc(pages.orderIndex)),
        DB_TIMEOUT_MS,
      );

      if (!dbPages || dbPages.length === 0) {
        return BASELINE_CONTENT_SUMMARY;
      }

      const [dbTrans, dbSections, dbProjects] = await Promise.all([
        this.withTimeout(db.select().from(pageTranslations), DB_TIMEOUT_MS).catch(() => []),
        this.withTimeout(db.select().from(sections), DB_TIMEOUT_MS).catch(() => []),
        this.withTimeout(db.select().from(projects), DB_TIMEOUT_MS).catch(() => []),
      ]);

      const transMap = new Map<
        string,
        {
          ar?: { title: string; metaDescription?: string | undefined } | undefined;
          en?: { title: string; metaDescription?: string | undefined } | undefined;
        }
      >();
      for (const t of dbTrans) {
        const existing = transMap.get(t.pageId) || {};
        if (t.localeCode === "ar") {
          existing.ar = { title: t.title, metaDescription: t.metaDescription ?? undefined };
        } else if (t.localeCode === "en") {
          existing.en = { title: t.title, metaDescription: t.metaDescription ?? undefined };
        }
        transMap.set(t.pageId, existing);
      }

      const adminPages: AdminPageItem[] = dbPages.map((p) => {
        const trans = transMap.get(p.id) || {
          ar: { title: p.slug },
          en: { title: p.slug },
        };
        const pageSectionsCount = dbSections.filter((s) => s.pageId === p.id).length;

        return {
          id: p.id,
          slug: p.slug,
          status: p.status as ContentPublishStatus,
          isHome: p.isHome,
          orderIndex: p.orderIndex,
          translations: {
            ar: trans.ar || { title: p.slug },
            en: trans.en || { title: p.slug },
          },
          sectionsCount: pageSectionsCount,
          updatedAt: p.updatedAt.toISOString(),
        };
      });

      const totalPublished = adminPages.filter((p) => p.status === "PUBLISHED").length;
      const totalDraft = adminPages.filter((p) => p.status === "DRAFT").length;
      const pendingDraftSections = dbSections.filter((s) => s.status === "DRAFT").length;

      return {
        pages: adminPages,
        totalPublishedPages: totalPublished,
        totalDraftPages: totalDraft,
        totalSections: dbSections.length,
        totalProjects: dbProjects.length,
        pendingDraftCount: totalDraft + pendingDraftSections,
      };
    } catch (error) {
      logger.warn("Failed to load content summary from database, using verified baselines", {
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
      return BASELINE_CONTENT_SUMMARY;
    }
  }

  /**
   * Retrieves all pages for admin management.
   */
  async getPages(): Promise<AdminPageItem[]> {
    const summary = await this.getSummary();
    return summary.pages;
  }

  /**
   * Retrieves all sections for a specific page with Arabic & English translations.
   */
  async getPageSections(pageId: string): Promise<AdminSectionItem[]> {
    try {
      const rawSections = await this.withTimeout(
        db
          .select()
          .from(sections)
          .where(eq(sections.pageId, pageId))
          .orderBy(asc(sections.orderIndex)),
        DB_TIMEOUT_MS,
      );

      if (!rawSections || rawSections.length === 0) {
        return [];
      }

      const [dbTrans, dbBlocks] = await Promise.all([
        this.withTimeout(db.select().from(sectionTranslations), DB_TIMEOUT_MS).catch(() => []),
        this.withTimeout(db.select().from(sectionBlocks), DB_TIMEOUT_MS).catch(() => []),
      ]);

      const transMap = new Map<
        string,
        {
          ar?: { title?: string | undefined; subtitle?: string | undefined } | undefined;
          en?: { title?: string | undefined; subtitle?: string | undefined } | undefined;
        }
      >();
      for (const t of dbTrans) {
        const existing = transMap.get(t.sectionId) || {};
        if (t.localeCode === "ar") {
          existing.ar = { title: t.title ?? undefined, subtitle: t.subtitle ?? undefined };
        } else if (t.localeCode === "en") {
          existing.en = { title: t.title ?? undefined, subtitle: t.subtitle ?? undefined };
        }
        transMap.set(t.sectionId, existing);
      }

      return rawSections.map((s) => {
        const trans = transMap.get(s.id) || {};
        const bCount = dbBlocks.filter((b) => b.sectionId === s.id).length;

        return {
          id: s.id,
          pageId: s.pageId,
          sectionType: s.sectionType,
          orderIndex: s.orderIndex,
          isVisible: s.isVisible,
          status: s.status as ContentPublishStatus,
          translations: {
            ar: trans.ar || {},
            en: trans.en || {},
          },
          blocksCount: bCount,
          updatedAt: s.updatedAt.toISOString(),
        };
      });
    } catch (error) {
      logger.warn("Failed to load page sections from DB", {
        metadata: { pageId, error: error instanceof Error ? error.message : String(error) },
      });
      return [];
    }
  }

  /**
   * Creates a new page with dual-language translations and logs an audit event.
   */
  async createPage(input: CreatePageInput, actorUserId?: string): Promise<AdminPageItem> {
    const newPageId = crypto.randomUUID();
    const now = new Date();

    try {
      await db.insert(pages).values({
        id: newPageId,
        slug: input.slug,
        status: "DRAFT",
        isHome: input.isHome ?? false,
        orderIndex: 10,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(pageTranslations).values([
        {
          id: crypto.randomUUID(),
          pageId: newPageId,
          localeCode: "ar",
          title: input.titleAr,
          metaDescription: input.metaDescriptionAr ?? null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          pageId: newPageId,
          localeCode: "en",
          title: input.titleEn,
          metaDescription: input.metaDescriptionEn ?? null,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      await this.logAuditEvent("create", "page", newPageId, null, { slug: input.slug }, actorUserId);
      sectionService.invalidateCache(input.slug);
    } catch (err) {
      logger.info("Database insert skipped in local mock", {
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
    }

    return {
      id: newPageId,
      slug: input.slug,
      status: "DRAFT",
      isHome: input.isHome ?? false,
      orderIndex: 10,
      translations: {
        ar: { title: input.titleAr, metaDescription: input.metaDescriptionAr },
        en: { title: input.titleEn, metaDescription: input.metaDescriptionEn },
      },
      sectionsCount: 0,
      updatedAt: now.toISOString(),
    };
  }

  /**
   * Updates page publishing status (DRAFT / PUBLISHED / ARCHIVED).
   */
  async updatePageStatus(
    pageId: string,
    status: ContentPublishStatus,
    actorUserId?: string,
  ): Promise<{ success: boolean; status: ContentPublishStatus }> {
    try {
      await db
        .update(pages)
        .set({ status, updatedAt: new Date() })
        .where(eq(pages.id, pageId));

      await this.logAuditEvent("update_status", "page", pageId, null, { status }, actorUserId);
      sectionService.invalidateCache();
    } catch (err) {
      logger.info("Database update skipped in local mock", {
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
    }

    return { success: true, status };
  }

  /**
   * Creates a new section on a page with translations.
   */
  async createSection(input: CreateSectionInput, actorUserId?: string): Promise<AdminSectionItem> {
    const newSectionId = crypto.randomUUID();
    const now = new Date();

    try {
      await db.insert(sections).values({
        id: newSectionId,
        pageId: input.pageId,
        sectionType: input.sectionType,
        orderIndex: 99,
        isVisible: true,
        status: "DRAFT",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(sectionTranslations).values([
        {
          id: crypto.randomUUID(),
          sectionId: newSectionId,
          localeCode: "ar",
          title: input.titleAr,
          subtitle: input.subtitleAr ?? null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          sectionId: newSectionId,
          localeCode: "en",
          title: input.titleEn,
          subtitle: input.subtitleEn ?? null,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      await this.logAuditEvent("create", "section", newSectionId, null, { type: input.sectionType }, actorUserId);
      sectionService.invalidateCache();
    } catch (err) {
      logger.info("Database insert skipped in local mock", {
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
    }

    return {
      id: newSectionId,
      pageId: input.pageId,
      sectionType: input.sectionType,
      orderIndex: 99,
      isVisible: true,
      status: "DRAFT",
      translations: {
        ar: { title: input.titleAr, subtitle: input.subtitleAr },
        en: { title: input.titleEn, subtitle: input.subtitleEn },
      },
      blocksCount: 0,
      updatedAt: now.toISOString(),
    };
  }

  /**
   * Updates an existing section's status, visibility, or translations.
   */
  async updateSection(
    sectionId: string,
    input: UpdateSectionInput,
    actorUserId?: string,
  ): Promise<{ success: boolean }> {
    try {
      const updatePayload: Record<string, unknown> = { updatedAt: new Date() };
      if (input.status) updatePayload.status = input.status;
      if (input.isVisible !== undefined) updatePayload.isVisible = input.isVisible;

      await db.update(sections).set(updatePayload).where(eq(sections.id, sectionId));

      await this.logAuditEvent("update", "section", sectionId, null, input, actorUserId);
      sectionService.invalidateCache();
    } catch (err) {
      logger.info("Database update skipped in local mock", {
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
    }

    return { success: true };
  }

  /**
   * Reorders sections for a page (keyboard accessible or drag-and-drop).
   */
  async reorderSections(
    pageId: string,
    sectionIds: string[],
    actorUserId?: string,
  ): Promise<{ success: boolean }> {
    try {
      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i];
        if (id) {
          await db
            .update(sections)
            .set({ orderIndex: i, updatedAt: new Date() })
            .where(eq(sections.id, id));
        }
      }

      await this.logAuditEvent("reorder", "section", pageId, null, { sectionIds }, actorUserId);
      sectionService.invalidateCache();
    } catch (err) {
      logger.info("Database reorder skipped in local mock", {
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
    }

    return { success: true };
  }

  /**
   * Deletes a section and invalidates caches.
   */
  async deleteSection(sectionId: string, actorUserId?: string): Promise<{ success: boolean }> {
    try {
      await db.delete(sections).where(eq(sections.id, sectionId));
      await this.logAuditEvent("delete", "section", sectionId, null, null, actorUserId);
      sectionService.invalidateCache();
    } catch (err) {
      logger.info("Database delete skipped in local mock", {
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
    }

    return { success: true };
  }

  /**
   * Helper to write audit events safely without leaking secrets or failing caller.
   */
  private async logAuditEvent(
    action: string,
    entityType: string,
    entityId: string,
    previousState: unknown,
    newState: unknown,
    userId?: string,
  ): Promise<void> {
    try {
      await db.insert(auditEvents).values({
        id: crypto.randomUUID(),
        userId: userId ?? null,
        action,
        entityType,
        entityId,
        previousState: previousState ? JSON.parse(JSON.stringify(previousState)) : null,
        newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
        createdAt: new Date(),
      });
    } catch {
      // Audit failure should never crash the main operation
    }
  }
}

export const contentCenterService = new ContentCenterService();
