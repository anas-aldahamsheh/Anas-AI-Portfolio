import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  projects,
  projectTranslations,
  projectCategories,
  projectCategoryLinks,
  projectTags,
  projectTagLinks,
} from "@/lib/db/schema/projects";
import { auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import type {
  Project,
  ProjectCategory,
  ProjectTag,
  ProjectFilterParams,
  ProjectListResult,
  PublishStatus,
} from "../domain/types";
import { BASELINE_CATEGORIES, BASELINE_TAGS, getBaselineProjects } from "../domain/baseline";

export class ProjectService {
  private cache: Map<string, ProjectListResult> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 60 * 1000;

  public invalidateCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Lists projects with search, filtering, and sorting applied.
   */
  async listProjects(params: ProjectFilterParams = {}): Promise<ProjectListResult> {
    const locale = params.locale === "ar" ? "ar" : "en";
    const cacheKey = JSON.stringify({ ...params, locale });
    const now = Date.now();

    const cached = this.cache.get(cacheKey);
    const timestamp = this.cacheTimestamps.get(cacheKey) ?? 0;
    if (cached && now - timestamp < this.CACHE_TTL_MS) {
      return cached;
    }

    try {
      const statusFilter = params.status ?? "PUBLISHED";

      // Query projects and translations from database
      const rows = await db
        .select({
          id: projects.id,
          slug: projects.slug,
          status: projects.status,
          orderIndex: projects.orderIndex,
          isFeatured: projects.isFeatured,
          coverImageUrl: projects.coverImageUrl,
          repoUrl: projects.repoUrl,
          demoUrl: projects.demoUrl,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          transTitle: projectTranslations.title,
          transSummary: projectTranslations.summary,
          problem: projectTranslations.problem,
          constraints: projectTranslations.constraints,
          solution: projectTranslations.solution,
          architecture: projectTranslations.architecture,
          implementation: projectTranslations.implementation,
          challenges: projectTranslations.challenges,
          decisionsTradeoffs: projectTranslations.decisionsTradeoffs,
          results: projectTranslations.results,
        })
        .from(projects)
        .leftJoin(
          projectTranslations,
          and(
            eq(projectTranslations.projectId, projects.id),
            eq(projectTranslations.localeCode, locale),
          ),
        )
        .where(eq(projects.status, statusFilter))
        .orderBy(asc(projects.orderIndex), desc(projects.createdAt));

      if (rows.length > 0) {
        // Fetch categories and tags for the retrieved projects
        const categoryRows = await db
          .select({
            projectId: projectCategoryLinks.projectId,
            categoryName: projectCategories.name,
          })
          .from(projectCategoryLinks)
          .innerJoin(projectCategories, eq(projectCategories.id, projectCategoryLinks.categoryId));

        const tagRows = await db
          .select({
            projectId: projectTagLinks.projectId,
            tagName: projectTags.name,
          })
          .from(projectTagLinks)
          .innerJoin(projectTags, eq(projectTags.id, projectTagLinks.tagId));

        const categoriesByProject = new Map<string, string[]>();
        categoryRows.forEach((cr) => {
          const list = categoriesByProject.get(cr.projectId) ?? [];
          list.push(cr.categoryName);
          categoriesByProject.set(cr.projectId, list);
        });

        const tagsByProject = new Map<string, string[]>();
        tagRows.forEach((tr) => {
          const list = tagsByProject.get(tr.projectId) ?? [];
          list.push(tr.tagName);
          tagsByProject.set(tr.projectId, list);
        });

        const allProjects: Project[] = rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          status: r.status as PublishStatus,
          orderIndex: r.orderIndex,
          isFeatured: r.isFeatured,
          coverImageUrl: r.coverImageUrl,
          repoUrl: r.repoUrl,
          demoUrl: r.demoUrl,
          title: r.transTitle || r.slug,
          summary: r.transSummary || "",
          problem: r.problem,
          constraints: r.constraints,
          solution: r.solution,
          architecture: r.architecture,
          implementation: r.implementation,
          challenges: r.challenges,
          decisionsTradeoffs: r.decisionsTradeoffs,
          results: r.results,
          categories: categoriesByProject.get(r.id) ?? [],
          tags: tagsByProject.get(r.id) ?? [],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));

        const categories = await this.getCategories();
        const tags = await this.getTags();

        const filtered = this.applyFiltersAndSort(allProjects, params, locale);
        const result: ProjectListResult = {
          projects: filtered,
          categories,
          tags,
          total: filtered.length,
        };

        this.cache.set(cacheKey, result);
        this.cacheTimestamps.set(cacheKey, now);
        return result;
      }
    } catch (err) {
      logger.warn("Failed to query projects from database, using baseline fallbacks", {
        module: "projects",
        metadata: { error: String(err) },
      });
    }

    // Baseline fallback
    const baselineProjects = getBaselineProjects(locale);
    const filtered = this.applyFiltersAndSort(baselineProjects, params, locale);
    const result: ProjectListResult = {
      projects: filtered,
      categories: BASELINE_CATEGORIES,
      tags: BASELINE_TAGS,
      total: filtered.length,
    };

    this.cache.set(cacheKey, result);
    this.cacheTimestamps.set(cacheKey, now);
    return result;
  }

  /**
   * Retrieves a single project by slug.
   */
  async getProjectBySlug(
    slug: string,
    locale = "en",
    allowUnpublished = false,
  ): Promise<Project | null> {
    const list = await this.listProjects({
      locale,
      status: allowUnpublished ? undefined : "PUBLISHED",
    });

    const match = list.projects.find((p) => p.slug === slug);
    if (match) return match;

    // Baseline fallback
    const baselines = getBaselineProjects(locale);
    return baselines.find((p) => p.slug === slug) ?? null;
  }

  /**
   * Retrieves related projects based on shared categories or tags, excluding current slug.
   */
  async getRelatedProjects(slug: string, locale = "en", limit = 2): Promise<Project[]> {
    const all = await this.listProjects({ locale, status: "PUBLISHED" });
    const current = all.projects.find((p) => p.slug === slug);
    if (!current) return all.projects.filter((p) => p.slug !== slug).slice(0, limit);

    const related = all.projects.filter((p) => {
      if (p.slug === slug) return false;
      const sharedCat = p.categories.some((c) => current.categories.includes(c));
      const sharedTag = p.tags.some((t) => current.tags.includes(t));
      return sharedCat || sharedTag;
    });

    if (related.length >= limit) {
      return related.slice(0, limit);
    }

    // Fill remaining with other published projects
    const remaining = all.projects.filter(
      (p) => p.slug !== slug && !related.some((r) => r.slug === p.slug),
    );
    return [...related, ...remaining].slice(0, limit);
  }

  /**
   * Returns list of categories.
   */
  async getCategories(): Promise<ProjectCategory[]> {
    try {
      const rows = await db.select().from(projectCategories);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
        }));
      }
    } catch (err) {
      logger.warn("Failed to query project categories, using baseline", {
        module: "projects",
        metadata: { error: String(err) },
      });
    }
    return BASELINE_CATEGORIES;
  }

  /**
   * Returns list of tags.
   */
  async getTags(): Promise<ProjectTag[]> {
    try {
      const rows = await db.select().from(projectTags);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
        }));
      }
    } catch (err) {
      logger.warn("Failed to query project tags, using baseline", {
        module: "projects",
        metadata: { error: String(err) },
      });
    }
    return BASELINE_TAGS;
  }

  /**
   * Admin: Updates publish status of a project.
   */
  async updateProjectStatus(
    projectId: string,
    status: PublishStatus,
    adminUserId: string,
  ): Promise<boolean> {
    try {
      await db
        .update(projects)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

      // Audit event
      try {
        await db.insert(auditEvents).values({
          userId: adminUserId,
          action: "project_status_updated",
          entityType: "project",
          entityId: projectId,
          newState: { status },
        });
      } catch (auditErr) {
        logger.warn("Failed to write audit event for project status update", {
          module: "projects",
          metadata: { error: String(auditErr) },
        });
      }

      this.invalidateCache();
      return true;
    } catch (err) {
      logger.error("Failed to update project status", {
        module: "projects",
        metadata: { projectId, status, error: String(err) },
      });
      throw new Error("Failed to persist project status update");
    }
  }

  /**
   * Applies in-memory search, category, tag, featured filters and sort order.
   */
  private applyFiltersAndSort(
    items: Project[],
    params: ProjectFilterParams,
    locale: string,
  ): Project[] {
    let result = [...items];

    // Status filter
    if (params.status) {
      result = result.filter((p) => p.status === params.status);
    }

    // Featured only
    if (params.featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    // Category filter
    if (params.category && params.category !== "all") {
      const target = params.category.toLowerCase();
      result = result.filter((p) =>
        p.categories.some(
          (c) => c.toLowerCase() === target || c.toLowerCase().replace(/\s+/g, "-") === target,
        ),
      );
    }

    // Tag filter
    if (params.tag && params.tag !== "all") {
      const target = params.tag.toLowerCase();
      result = result.filter((p) =>
        p.tags.some(
          (t) => t.toLowerCase() === target || t.toLowerCase().replace(/\s+/g, "-") === target,
        ),
      );
    }

    // Search query matching
    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      result = result.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inSummary = p.summary.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const inCategories = p.categories.some((c) => c.toLowerCase().includes(q));
        return inTitle || inSummary || inTags || inCategories;
      });
    }

    // Sorting
    const sortBy = params.sortBy ?? "order";
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title, locale));
    } else {
      // "order": orderIndex ascending, then latest
      result.sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return result;
  }
}

export const projectService = new ProjectService();
