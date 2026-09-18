import { db } from "@/lib/db/client";
import { prompts, promptVersions } from "@/lib/db/schema/ai";
import { auditEvents } from "@/lib/db/schema/admin";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "@/lib/observability/logger";
import {
  PromptDetail,
  PromptDiff,
  PromptSummary,
  PromptVersion,
  PromptTestResult,
  CreatePromptVersionInput,
  TestPromptInput,
} from "@/ai/contracts/prompt-registry";
import { BASELINE_PROMPT_DEFINITIONS, createBaselinePromptVersion } from "./baseline-prompts";
import { extractVariables, interpolateTemplate } from "./prompt-template";
import { computePromptDiff } from "./prompt-diff";

export class PromptService {
  // In-memory cache for active prompts: Map<slug, { version: PromptVersion; cachedAt: number }>
  private activeCache = new Map<string, { version: PromptVersion; cachedAt: number }>();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

  /**
   * Clears the active prompt cache.
   */
  public clearCache(): void {
    this.activeCache.clear();
  }

  /**
   * Lists all prompts with active version metadata.
   * If DB has no prompts, returns baselines.
   */
  async listPrompts(): Promise<PromptSummary[]> {
    try {
      const dbPrompts = await db.select().from(prompts).orderBy(prompts.slug);

      if (!dbPrompts || dbPrompts.length === 0) {
        return this.getBaselineSummaries();
      }

      const summaries: PromptSummary[] = [];

      for (const p of dbPrompts) {
        // Query versions for this prompt
        const versions = await db
          .select()
          .from(promptVersions)
          .where(eq(promptVersions.promptId, p.id))
          .orderBy(desc(promptVersions.versionNumber));

        const activeVer = versions.find((v: { isActive: boolean }) => v.isActive) || versions[0];
        const baseline = BASELINE_PROMPT_DEFINITIONS.find((b) => b.slug === p.slug);

        summaries.push({
          id: p.id,
          slug: p.slug,
          role: p.slug,
          name: baseline?.name || p.slug,
          description: p.description || baseline?.description || null,
          activeVersionNumber: activeVer ? activeVer.versionNumber : null,
          activeVersionId: activeVer ? activeVer.id : null,
          totalVersions: versions.length,
          updatedAt: activeVer ? activeVer.createdAt : p.createdAt,
        });
      }

      // Check if there are any baseline prompts missing from DB
      for (const b of BASELINE_PROMPT_DEFINITIONS) {
        if (!summaries.some((s) => s.slug === b.slug)) {
          summaries.push({
            id: `prompt-${b.slug}`,
            slug: b.slug,
            role: b.slug,
            name: b.name,
            description: b.description,
            activeVersionNumber: b.versionNumber,
            activeVersionId: `ver-${b.slug}-v${b.versionNumber}`,
            totalVersions: 1,
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          });
        }
      }

      return summaries;
    } catch (error) {
      logger.warn("Failed to load prompts from DB, falling back to baseline prompts", {
        module: "prompts",
        metadata: { error: String(error) },
      });
      return this.getBaselineSummaries();
    }
  }

  /**
   * Retrieves full prompt details including all versions.
   */
  async getPromptBySlug(slug: string): Promise<PromptDetail | null> {
    try {
      const rows = await db.select().from(prompts).where(eq(prompts.slug, slug)).limit(1);

      if (!rows || rows.length === 0) {
        return this.getBaselineDetail(slug);
      }

      const p = rows[0];
      if (!p) {
        return this.getBaselineDetail(slug);
      }

      const versionsRows = await db
        .select()
        .from(promptVersions)
        .where(eq(promptVersions.promptId, p.id))
        .orderBy(desc(promptVersions.versionNumber));

      const versions: PromptVersion[] = versionsRows.map(
        (v: typeof promptVersions.$inferSelect) => {
          const combined = `${v.systemPrompt} ${v.userTemplate || ""}`;
          return {
            id: v.id,
            promptId: v.promptId,
            versionNumber: v.versionNumber,
            systemPrompt: v.systemPrompt,
            userTemplate: v.userTemplate,
            isActive: v.isActive,
            changelog: v.changelog,
            variables: extractVariables(combined),
            createdAt: v.createdAt,
          };
        },
      );

      const activeVersion = versions.find((v) => v.isActive) || versions[0] || null;
      const baseline = BASELINE_PROMPT_DEFINITIONS.find((b) => b.slug === p.slug);

      return {
        id: p.id,
        slug: p.slug,
        role: p.slug,
        name: baseline?.name || p.slug,
        description: p.description || baseline?.description || null,
        activeVersionNumber: activeVersion?.versionNumber ?? null,
        activeVersionId: activeVersion?.id ?? null,
        totalVersions: versions.length,
        updatedAt: activeVersion ? activeVersion.createdAt : p.createdAt,
        activeVersion,
        versions,
      };
    } catch (error) {
      logger.warn("Failed to load prompt detail from DB, using baseline", {
        module: "prompts",
        metadata: { slug, error: String(error) },
      });
      return this.getBaselineDetail(slug);
    }
  }

  /**
   * Retrieves the currently active prompt version for runtime AI pipeline execution.
   * Utilizes in-memory caching with TTL.
   */
  async getActivePrompt(slug: string): Promise<PromptVersion | null> {
    const cached = this.activeCache.get(slug);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.version;
    }

    try {
      const promptRows = await db.select().from(prompts).where(eq(prompts.slug, slug)).limit(1);

      if (promptRows && promptRows.length > 0) {
        const p = promptRows[0];
        if (p) {
          const activeRows = await db
            .select()
            .from(promptVersions)
            .where(and(eq(promptVersions.promptId, p.id), eq(promptVersions.isActive, true)))
            .limit(1);

          if (activeRows && activeRows.length > 0) {
            const v = activeRows[0];
            if (v) {
              const combined = `${v.systemPrompt} ${v.userTemplate || ""}`;
              const version: PromptVersion = {
                id: v.id,
                promptId: v.promptId,
                versionNumber: v.versionNumber,
                systemPrompt: v.systemPrompt,
                userTemplate: v.userTemplate,
                isActive: v.isActive,
                changelog: v.changelog,
                variables: extractVariables(combined),
                createdAt: v.createdAt,
              };

              this.activeCache.set(slug, { version, cachedAt: Date.now() });
              return version;
            }
          }
        }
      }
    } catch (error) {
      logger.warn("Failed to query active prompt from DB, using baseline", {
        module: "prompts",
        metadata: { slug, error: String(error) },
      });
    }

    // Fallback to baseline
    const baseline = this.getBaselineDetail(slug);
    if (baseline?.activeVersion) {
      this.activeCache.set(slug, { version: baseline.activeVersion, cachedAt: Date.now() });
      return baseline.activeVersion;
    }

    return null;
  }

  /**
   * Renders the active prompt by interpolating provided variables into the templates.
   */
  async renderPrompt(
    slug: string,
    variables: Record<string, string> = {},
  ): Promise<{
    systemPrompt: string;
    userPrompt: string | null;
    missingVariables: string[];
    versionNumber: number;
  }> {
    const active = await this.getActivePrompt(slug);
    if (!active) {
      throw new Error(`Prompt with slug '${slug}' not found in registry or baselines`);
    }

    const { rendered: renderedSystem, missingVariables: sysMissing } = interpolateTemplate(
      active.systemPrompt,
      variables,
    );

    let renderedUser: string | null = null;
    let userMissing: string[] = [];

    if (active.userTemplate) {
      const userResult = interpolateTemplate(active.userTemplate, variables);
      renderedUser = userResult.rendered;
      userMissing = userResult.missingVariables;
    }

    const allMissing = Array.from(new Set([...sysMissing, ...userMissing])).sort();

    return {
      systemPrompt: renderedSystem,
      userPrompt: renderedUser,
      missingVariables: allMissing,
      versionNumber: active.versionNumber,
    };
  }

  /**
   * Creates a new version for a prompt. Automatically increments version number.
   * Optionally marks it as active, and records an audit log.
   */
  async createVersion(
    slug: string,
    input: CreatePromptVersionInput,
    adminUserId: string,
  ): Promise<PromptVersion> {
    // 1. Ensure prompt exists in DB
    let promptId: string;
    const existing = await db.select().from(prompts).where(eq(prompts.slug, slug)).limit(1);

    if (existing && existing.length > 0 && existing[0]) {
      promptId = existing[0].id;
    } else {
      // Create prompt record
      const baseline = BASELINE_PROMPT_DEFINITIONS.find((b) => b.slug === slug);
      const [newPrompt] = await db
        .insert(prompts)
        .values({
          slug,
          description: baseline?.description || null,
        })
        .returning();

      if (!newPrompt) {
        throw new Error(`Failed to create prompt record for '${slug}'`);
      }
      promptId = newPrompt.id;
    }

    // 2. Determine next version number
    const existingVersions = await db
      .select({ versionNumber: promptVersions.versionNumber })
      .from(promptVersions)
      .where(eq(promptVersions.promptId, promptId))
      .orderBy(desc(promptVersions.versionNumber));

    const maxVersion =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map((v: { versionNumber: number }) => v.versionNumber))
        : 0;
    const nextVersionNumber = maxVersion + 1;

    // 3. If makeActive is requested, deactivate all other versions for this prompt
    if (input.makeActive) {
      await db
        .update(promptVersions)
        .set({ isActive: false })
        .where(eq(promptVersions.promptId, promptId));
    }

    // 4. Insert new version
    const [inserted] = await db
      .insert(promptVersions)
      .values({
        promptId,
        versionNumber: nextVersionNumber,
        systemPrompt: input.systemPrompt,
        userTemplate: input.userTemplate || null,
        isActive: !!input.makeActive,
        changelog: input.changelog || null,
      })
      .returning();

    if (!inserted) {
      throw new Error(`Failed to insert prompt version for '${slug}'`);
    }

    // 5. Invalidate cache
    this.clearCache();

    // 6. Record audit event
    await this.recordAuditEvent({
      userId: adminUserId,
      action: "create",
      entityType: "prompt",
      entityId: promptId,
      newState: {
        slug,
        versionNumber: nextVersionNumber,
        isActive: input.makeActive,
        changelog: input.changelog,
      },
    });

    const combined = `${inserted.systemPrompt} ${inserted.userTemplate || ""}`;
    return {
      id: inserted.id,
      promptId: inserted.promptId,
      versionNumber: inserted.versionNumber,
      systemPrompt: inserted.systemPrompt,
      userTemplate: inserted.userTemplate,
      isActive: inserted.isActive,
      changelog: inserted.changelog,
      variables: extractVariables(combined),
      createdAt: inserted.createdAt,
    };
  }

  /**
   * Rollback to an existing version number for a prompt.
   * Deactivates all other versions and sets target version to active.
   */
  async rollbackToVersion(
    slug: string,
    versionNumber: number,
    adminUserId: string,
  ): Promise<PromptVersion> {
    const promptRows = await db.select().from(prompts).where(eq(prompts.slug, slug)).limit(1);

    if (!promptRows || promptRows.length === 0) {
      throw new Error(`Prompt with slug '${slug}' does not exist in database`);
    }

    const prompt = promptRows[0];
    if (!prompt) {
      throw new Error(`Prompt with slug '${slug}' not found in database`);
    }

    // Find the target version
    const targetRows = await db
      .select()
      .from(promptVersions)
      .where(
        and(
          eq(promptVersions.promptId, prompt.id),
          eq(promptVersions.versionNumber, versionNumber),
        ),
      )
      .limit(1);

    if (!targetRows || targetRows.length === 0 || !targetRows[0]) {
      throw new Error(`Version ${versionNumber} not found for prompt '${slug}'`);
    }

    // Deactivate all versions for this prompt
    await db
      .update(promptVersions)
      .set({ isActive: false })
      .where(eq(promptVersions.promptId, prompt.id));

    // Activate the target version
    const [updated] = await db
      .update(promptVersions)
      .set({ isActive: true })
      .where(
        and(
          eq(promptVersions.promptId, prompt.id),
          eq(promptVersions.versionNumber, versionNumber),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error(`Failed to update active prompt version for '${slug}'`);
    }

    // Invalidate cache
    this.clearCache();

    // Record audit event
    await this.recordAuditEvent({
      userId: adminUserId,
      action: "update",
      entityType: "prompt",
      entityId: prompt.id,
      newState: {
        slug,
        action: "rollback",
        activeVersionNumber: versionNumber,
      },
    });

    const combined = `${updated.systemPrompt} ${updated.userTemplate || ""}`;
    return {
      id: updated.id,
      promptId: updated.promptId,
      versionNumber: updated.versionNumber,
      systemPrompt: updated.systemPrompt,
      userTemplate: updated.userTemplate,
      isActive: updated.isActive,
      changelog: updated.changelog,
      variables: extractVariables(combined),
      createdAt: updated.createdAt,
    };
  }

  /**
   * Clones an existing version into a new draft version.
   */
  async cloneVersion(
    slug: string,
    fromVersionNumber: number,
    changelog: string,
    adminUserId: string,
  ): Promise<PromptVersion> {
    const detail = await this.getPromptBySlug(slug);
    if (!detail) {
      throw new Error(`Prompt '${slug}' not found`);
    }

    const sourceVersion = detail.versions.find((v) => v.versionNumber === fromVersionNumber);
    if (!sourceVersion) {
      throw new Error(`Version ${fromVersionNumber} not found for prompt '${slug}'`);
    }

    return this.createVersion(
      slug,
      {
        systemPrompt: sourceVersion.systemPrompt,
        userTemplate: sourceVersion.userTemplate,
        changelog: changelog || `Cloned from version ${fromVersionNumber}`,
        makeActive: false,
      },
      adminUserId,
    );
  }

  /**
   * Compares two versions of a prompt and computes a structural diff.
   */
  async compareVersions(slug: string, v1Number: number, v2Number: number): Promise<PromptDiff> {
    const detail = await this.getPromptBySlug(slug);
    if (!detail) {
      throw new Error(`Prompt '${slug}' not found`);
    }

    const v1 = detail.versions.find((v) => v.versionNumber === v1Number);
    const v2 = detail.versions.find((v) => v.versionNumber === v2Number);

    if (!v1) {
      throw new Error(`Version ${v1Number} not found for prompt '${slug}'`);
    }
    if (!v2) {
      throw new Error(`Version ${v2Number} not found for prompt '${slug}'`);
    }

    return computePromptDiff(slug, v1, v2);
  }

  /**
   * Tests prompt template rendering with provided test variables without persisting.
   */
  testPrompt(input: TestPromptInput): PromptTestResult {
    const combined = `${input.systemPrompt} ${input.userTemplate || ""}`;
    const detectedVariables = extractVariables(combined);

    const { rendered: renderedSystem, missingVariables: sysMissing } = interpolateTemplate(
      input.systemPrompt,
      input.variables,
    );

    let renderedUser: string | null = null;
    let userMissing: string[] = [];

    if (input.userTemplate) {
      const userResult = interpolateTemplate(input.userTemplate, input.variables);
      renderedUser = userResult.rendered;
      userMissing = userResult.missingVariables;
    }

    const missing = Array.from(new Set([...sysMissing, ...userMissing])).sort();

    const result: PromptTestResult = {
      success: missing.length === 0,
      renderedSystemPrompt: renderedSystem,
      renderedUserPrompt: renderedUser,
      detectedVariables,
      missingVariables: missing,
    };

    if (missing.length > 0) {
      result.errors = [`Missing variables: ${missing.join(", ")}`];
    }

    return result;
  }

  // --- Private Helpers ---

  private getBaselineSummaries(): PromptSummary[] {
    return BASELINE_PROMPT_DEFINITIONS.map((b) => ({
      id: `prompt-${b.slug}`,
      slug: b.slug,
      role: b.slug,
      name: b.name,
      description: b.description,
      activeVersionNumber: b.versionNumber,
      activeVersionId: `ver-${b.slug}-v${b.versionNumber}`,
      totalVersions: 1,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }));
  }

  private getBaselineDetail(slug: string): PromptDetail | null {
    const b = BASELINE_PROMPT_DEFINITIONS.find((def) => def.slug === slug);
    if (!b) {
      return null;
    }

    const promptId = `prompt-${b.slug}`;
    const ver = createBaselinePromptVersion(promptId, b);

    return {
      id: promptId,
      slug: b.slug,
      role: b.slug,
      name: b.name,
      description: b.description,
      activeVersionNumber: b.versionNumber,
      activeVersionId: ver.id,
      totalVersions: 1,
      updatedAt: ver.createdAt,
      activeVersion: ver,
      versions: [ver],
    };
  }

  private async recordAuditEvent(event: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    newState: Record<string, unknown>;
  }) {
    try {
      await db.insert(auditEvents).values({
        userId: event.userId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        newState: event.newState,
      });
    } catch (error) {
      logger.warn("Failed to record audit event for prompt action", {
        module: "prompts",
        metadata: { error: String(error) },
      });
    }
  }
}

export const promptService = new PromptService();
