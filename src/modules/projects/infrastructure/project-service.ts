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
import { auditEvents, systemSettings } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import type {
  Project,
  ProjectCategory,
  ProjectTag,
  ProjectFilterParams,
  ProjectListResult,
  PublishStatus,
  ProjectDemoConfig,
} from "../domain/types";
import { BASELINE_CATEGORIES, BASELINE_TAGS, getBaselineProjects } from "../domain/baseline";

export class ProjectService {
  private cache: Map<string, ProjectListResult> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 60 * 1000;
  private readonly DB_TIMEOUT_MS = 250;
  private demoSettingsCache: Record<string, ProjectDemoConfig> = {};
  private demoSettingsTimestamp = 0;

  /**
   * Helper to bound database query latency against offline or slow DB connections.
   */
  private async queryWithTimeout<T>(promise: Promise<T>, timeoutMs = this.DB_TIMEOUT_MS): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Database operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

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
      const rows = await this.queryWithTimeout(
        db
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
          .orderBy(asc(projects.orderIndex), desc(projects.createdAt)),
      );

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

        const projectsWithDemo = await this.attachDemoSettings(allProjects);
        const categories = await this.getCategories();
        const tags = await this.getTags();

        const filtered = this.applyFiltersAndSort(projectsWithDemo, params, locale);
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
    const baselineProjects = await this.attachDemoSettings(getBaselineProjects(locale));
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
    const baselines = await this.attachDemoSettings(getBaselineProjects(locale));
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

  /**
   * Merges persisted demo settings overrides into an array of projects.
   */
  private async attachDemoSettings(items: Project[]): Promise<Project[]> {
    const allSettings = await this.getAllDemoSettings();
    return items.map((p) => {
      const override = allSettings[p.slug] || allSettings[p.id];
      if (override) {
        return {
          ...p,
          isDemoEnabled: override.isEnabled,
          demoUrl: override.demoUrl || null,
        };
      }
      return {
        ...p,
        isDemoEnabled: Boolean(p.demoUrl),
      };
    });
  }

  /**
   * Retrieves all project demo overrides from systemSettings (with in-memory fallback/cache).
   */
  async getAllDemoSettings(): Promise<Record<string, ProjectDemoConfig>> {
    const now = Date.now();
    if (
      this.demoSettingsTimestamp > 0 &&
      now - this.demoSettingsTimestamp < this.CACHE_TTL_MS
    ) {
      return this.demoSettingsCache;
    }

    try {
      const rows = await this.queryWithTimeout(
        db
          .select()
          .from(systemSettings)
          .where(eq(systemSettings.key, "project_demo_settings"))
          .limit(1),
      );

      if (rows.length > 0 && rows[0]?.value) {
        const stored = rows[0].value as Record<string, ProjectDemoConfig>;
        this.demoSettingsCache = { ...this.demoSettingsCache, ...stored };
        this.demoSettingsTimestamp = now;
        return this.demoSettingsCache;
      }
    } catch (err) {
      logger.warn(
        "Failed to load project_demo_settings from database, using cached/runtime settings",
        {
          module: "projects",
          metadata: { error: String(err) },
        },
      );
    }

    this.demoSettingsTimestamp = now;
    return this.demoSettingsCache;
  }

  /**
   * Retrieves demo config for a project by slug or ID.
   */
  async getDemoConfig(slugOrId: string): Promise<ProjectDemoConfig> {
    const all = await this.getAllDemoSettings();
    const config = all[slugOrId];
    if (config) {
      return config;
    }

    // Default based on baseline or current project
    const project = await this.getProjectBySlug(slugOrId);
    if (project) {
      return {
        isEnabled: project.isDemoEnabled ?? Boolean(project.demoUrl),
        demoUrl: project.demoUrl ?? "",
      };
    }

    return {
      isEnabled: false,
      demoUrl: "",
    };
  }

  /**
   * Updates demo config for a project by slug or ID.
   */
  async updateDemoConfig(
    slugOrId: string,
    config: ProjectDemoConfig,
    adminUserId?: string,
  ): Promise<ProjectDemoConfig> {
    const current = await this.getAllDemoSettings();
    const updatedRecord: ProjectDemoConfig = {
      isEnabled: Boolean(config.isEnabled),
      demoUrl: config.demoUrl.trim(),
    };

    const updatedMap = {
      ...current,
      [slugOrId]: updatedRecord,
    };

    this.demoSettingsCache = updatedMap;
    this.demoSettingsTimestamp = Date.now();

    // 1. Persist to systemSettings
    try {
      await this.queryWithTimeout(
        db
          .insert(systemSettings)
          .values({
            key: "project_demo_settings",
            value: updatedMap,
            description: "Per-project Live Demo toggle and URL configurations",
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: systemSettings.key,
            set: {
              value: updatedMap,
              updatedAt: new Date(),
            },
          }),
      );
    } catch (err) {
      logger.warn(
        "Failed to persist project_demo_settings to database, preserved in memory",
        {
          module: "projects",
          metadata: { error: String(err) },
        },
      );
    }

    // 2. If project exists in DB table, sync demo_url as well
    try {
      await this.queryWithTimeout(
        db
          .update(projects)
          .set({
            demoUrl: config.isEnabled ? config.demoUrl.trim() || null : null,
            updatedAt: new Date(),
          })
          .where(eq(projects.slug, slugOrId)),
      );
    } catch {
      // Ignored if DB table not reachable
    }

    // 3. Record audit event
    if (adminUserId) {
      try {
        await this.queryWithTimeout(
          db.insert(auditEvents).values({
            userId: adminUserId,
            action: "project_demo_updated",
            entityType: "project",
            entityId: slugOrId,
            newState: updatedRecord,
          }),
        );
      } catch (auditErr) {
        logger.warn("Failed to write audit event for project demo update", {
          module: "projects",
          metadata: { error: String(auditErr) },
        });
      }
    }

    this.invalidateCache();
    return updatedRecord;
  }
}

export const projectService = new ProjectService();
