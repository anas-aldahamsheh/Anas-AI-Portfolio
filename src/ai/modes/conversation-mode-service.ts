import { db } from "@/lib/db/client";
import { conversationModes } from "@/lib/db/schema/ai";
import { auditEvents } from "@/lib/db/schema/admin";
import { eq, asc } from "drizzle-orm";
import { logger } from "@/lib/observability/logger";
import {
  ConversationMode,
  ConversationModeConfig,
  ConversationModePort,
  LocalizedConversationMode,
  ResponseLanguage,
  UpdateConversationModeInput,
} from "@/ai/contracts";
import { BASELINE_CONVERSATION_MODES } from "./baseline-modes";

export class ConversationModeService implements ConversationModePort {
  private cache: { configs: ConversationModeConfig[]; cachedAt: number } | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1-minute TTL

  /**
   * Clears the in-memory cache.
   */
  public clearCache(): void {
    this.cache = null;
  }

  /**
   * Retrieves all conversation mode configurations from database or baselines.
   */
  public async getAllConfigs(): Promise<ConversationModeConfig[]> {
    const now = Date.now();
    if (this.cache && now - this.cache.cachedAt < this.CACHE_TTL_MS) {
      return this.cache.configs;
    }

    try {
      const rows = await db
        .select()
        .from(conversationModes)
        .orderBy(asc(conversationModes.sortOrder));

      if (!rows || rows.length === 0) {
        this.cache = { configs: BASELINE_CONVERSATION_MODES, cachedAt: now };
        return BASELINE_CONVERSATION_MODES;
      }

      const configs: ConversationModeConfig[] = rows.map(
        (r: typeof conversationModes.$inferSelect) => ({
          id: r.id,
          slug: r.slug as ConversationMode,
          nameEn: r.nameEn,
          nameAr: r.nameAr,
          descriptionEn: r.descriptionEn,
          descriptionAr: r.descriptionAr,
          toneGuidelines: r.toneGuidelines,
          focusAreas: r.focusAreas,
          promptSlug: r.promptSlug,
          isEnabled: r.isEnabled,
          isPublished: r.isPublished,
          sortOrder: r.sortOrder,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
      );

      // Ensure any missing baseline modes are populated
      for (const baseline of BASELINE_CONVERSATION_MODES) {
        if (!configs.some((c) => c.slug === baseline.slug)) {
          configs.push(baseline);
        }
      }

      configs.sort((a, b) => a.sortOrder - b.sortOrder);
      this.cache = { configs, cachedAt: now };
      return configs;
    } catch (error) {
      logger.warn("Failed to query conversation modes from database, using baselines", {
        module: "conversation_mode",
        metadata: { error: String(error) },
      });
      return BASELINE_CONVERSATION_MODES;
    }
  }

  /**
   * Lists published and enabled conversation modes localized for the user.
   */
  public async listModes(locale?: ResponseLanguage): Promise<LocalizedConversationMode[]> {
    const configs = await this.getAllConfigs();
    const isArabic = locale === "ar";

    return configs
      .filter((c) => c.isEnabled && c.isPublished)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: isArabic ? c.nameAr : c.nameEn,
        description: isArabic ? c.descriptionAr : c.descriptionEn,
        toneGuidelines: c.toneGuidelines,
        focusAreas: c.focusAreas,
        isEnabled: c.isEnabled,
        sortOrder: c.sortOrder,
      }));
  }

  /**
   * Retrieves a mode configuration by its slug.
   */
  public async getModeBySlug(slug: string): Promise<ConversationModeConfig | null> {
    const configs = await this.getAllConfigs();
    return configs.find((c) => c.slug === slug) || null;
  }

  /**
   * Verifies that the client-requested mode is enabled and published.
   * If invalid, unknown, or disabled, safely normalizes and falls back to "general".
   */
  public async verifyMode(slug: string | undefined | null): Promise<ConversationMode> {
    if (!slug) {
      return "general";
    }

    const configs = await this.getAllConfigs();
    const matched = configs.find((c) => c.slug === slug);

    if (matched && matched.isEnabled && matched.isPublished) {
      return matched.slug;
    }

    // Default fallback
    return "general";
  }

  /**
   * Updates a conversation mode configuration (Admin operation).
   */
  public async updateMode(
    id: string,
    input: UpdateConversationModeInput,
    userId?: string,
  ): Promise<ConversationModeConfig> {
    const configs = await this.getAllConfigs();
    const existing = configs.find((c) => c.id === id);
    if (!existing) {
      throw new Error(`Conversation mode with ID "${id}" not found`);
    }

    const updatePayload: Partial<typeof conversationModes.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.nameEn !== undefined) updatePayload.nameEn = input.nameEn;
    if (input.nameAr !== undefined) updatePayload.nameAr = input.nameAr;
    if (input.descriptionEn !== undefined) updatePayload.descriptionEn = input.descriptionEn;
    if (input.descriptionAr !== undefined) updatePayload.descriptionAr = input.descriptionAr;
    if (input.toneGuidelines !== undefined) updatePayload.toneGuidelines = input.toneGuidelines;
    if (input.focusAreas !== undefined) updatePayload.focusAreas = input.focusAreas;
    if (input.promptSlug !== undefined) updatePayload.promptSlug = input.promptSlug;
    if (input.isEnabled !== undefined) updatePayload.isEnabled = input.isEnabled;
    if (input.isPublished !== undefined) updatePayload.isPublished = input.isPublished;
    if (input.sortOrder !== undefined) updatePayload.sortOrder = input.sortOrder;

    try {
      const updatedRows = await db
        .update(conversationModes)
        .set(updatePayload)
        .where(eq(conversationModes.id, id))
        .returning();

      const updated = updatedRows[0];
      this.clearCache();

      // Log audit event
      try {
        await db.insert(auditEvents).values({
          userId: userId || null,
          action: "update",
          entityType: "conversation_mode",
          entityId: id,
          newState: updatePayload,
        });
      } catch (auditError) {
        logger.warn("Failed to write audit event for conversation mode update", {
          module: "conversation_mode",
          metadata: { error: String(auditError) },
        });
      }

      if (updated) {
        return {
          id: updated.id,
          slug: updated.slug as ConversationMode,
          nameEn: updated.nameEn,
          nameAr: updated.nameAr,
          descriptionEn: updated.descriptionEn,
          descriptionAr: updated.descriptionAr,
          toneGuidelines: updated.toneGuidelines,
          focusAreas: updated.focusAreas,
          promptSlug: updated.promptSlug,
          isEnabled: updated.isEnabled,
          isPublished: updated.isPublished,
          sortOrder: updated.sortOrder,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      }
    } catch (dbError) {
      logger.warn("Failed to persist conversation mode update to DB, updating in-memory cache", {
        module: "conversation_mode",
        metadata: { error: String(dbError) },
      });
    }

    // In-memory fallback
    const updatedConfig: ConversationModeConfig = {
      ...existing,
      nameEn: input.nameEn ?? existing.nameEn,
      nameAr: input.nameAr ?? existing.nameAr,
      descriptionEn: input.descriptionEn ?? existing.descriptionEn,
      descriptionAr: input.descriptionAr ?? existing.descriptionAr,
      toneGuidelines: input.toneGuidelines ?? existing.toneGuidelines,
      focusAreas: input.focusAreas ?? existing.focusAreas,
      promptSlug: input.promptSlug ?? existing.promptSlug,
      isEnabled: input.isEnabled ?? existing.isEnabled,
      isPublished: input.isPublished ?? existing.isPublished,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    };
    this.clearCache();
    return updatedConfig;
  }
}

export const conversationModeService = new ConversationModeService();
