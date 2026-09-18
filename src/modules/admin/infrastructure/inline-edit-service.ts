import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { auditEvents, systemSettings } from "@/lib/db/schema/admin";
import {
  sections,
  sectionTranslations,
  sectionBlocks,
  sectionBlockTranslations,
} from "@/lib/db/schema/content";
import { uiTextKeys, uiTextTranslations } from "@/lib/db/schema/localization";
import { logger } from "@/lib/observability/logger";
import { sectionService } from "@/modules/content/infrastructure/section-service";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { navigationService } from "@/modules/navigation/infrastructure/navigation-service";
import type {
  InlineEditUpdateInput,
  InlineEditResult,
  InlineEditErrorResult,
} from "../domain/inline-edit";

export interface RequestMetadata {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export class InlineEditService {
  /**
   * Authoritatively persists an inline edit requested by an authenticated administrator.
   */
  async updateContent(
    input: InlineEditUpdateInput,
    adminUserId: string,
    reqMeta?: RequestMetadata,
  ): Promise<InlineEditResult | InlineEditErrorResult> {
    const { entityType, entityId, fieldOrBlockId, locale, expectedVersion, data, action } = input;

    logger.info("inline_edit_requested", {
      module: "admin",
      userId: adminUserId,
      metadata: { entityType, entityId, fieldOrBlockId, action, locale },
    });

    try {
      const previousState: Record<string, unknown> | null = null;
      const newVersion = (expectedVersion ?? 0) + 1;

      switch (entityType) {
        case "block": {
          // If entityId is block id
          if (action === "toggle_visibility") {
            const isVisible =
              typeof data === "object" && data !== null && "isVisible" in data
                ? Boolean((data as Record<string, unknown>)["isVisible"])
                : true;
            await db
              .update(sectionBlocks)
              .set({ isVisible, updatedAt: new Date() })
              .where(eq(sectionBlocks.id, entityId));
          } else if (action === "delete") {
            await db.delete(sectionBlocks).where(eq(sectionBlocks.id, entityId));
          } else {
            // update block content or config
            if (typeof data === "object" && data !== null) {
              const dataObj = data as Record<string, unknown>;
              if (dataObj["config"]) {
                await db
                  .update(sectionBlocks)
                  .set({
                    config: dataObj["config"] as Record<string, unknown>,
                    updatedAt: new Date(),
                  })
                  .where(eq(sectionBlocks.id, entityId));
              }

              if (dataObj["content"] && locale) {
                // Upsert block translations
                const existingTrans = await db
                  .select()
                  .from(sectionBlockTranslations)
                  .where(
                    and(
                      eq(sectionBlockTranslations.blockId, entityId),
                      eq(sectionBlockTranslations.localeCode, locale),
                    ),
                  )
                  .limit(1);

                if (existingTrans.length > 0) {
                  await db
                    .update(sectionBlockTranslations)
                    .set({
                      content: dataObj["content"] as Record<string, unknown>,
                      updatedAt: new Date(),
                    })
                    .where(
                      and(
                        eq(sectionBlockTranslations.blockId, entityId),
                        eq(sectionBlockTranslations.localeCode, locale),
                      ),
                    );
                } else {
                  await db.insert(sectionBlockTranslations).values({
                    blockId: entityId,
                    localeCode: locale,
                    content: dataObj["content"] as Record<string, unknown>,
                  });
                }
              }
            }
          }
          break;
        }

        case "section": {
          if (action === "toggle_visibility") {
            const isVisible =
              typeof data === "object" && data !== null && "isVisible" in data
                ? Boolean((data as Record<string, unknown>)["isVisible"])
                : true;
            await db
              .update(sections)
              .set({ isVisible, updatedAt: new Date() })
              .where(eq(sections.id, entityId));
          } else if (action === "delete") {
            await db.delete(sections).where(eq(sections.id, entityId));
          } else if (typeof data === "object" && data !== null) {
            const dataObj = data as Record<string, unknown>;
            if (dataObj["status"]) {
              await db
                .update(sections)
                .set({
                  status: dataObj["status"] as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                  updatedAt: new Date(),
                })
                .where(eq(sections.id, entityId));
            }

            if (locale && (dataObj["title"] !== undefined || dataObj["subtitle"] !== undefined)) {
              const existingTrans = await db
                .select()
                .from(sectionTranslations)
                .where(
                  and(
                    eq(sectionTranslations.sectionId, entityId),
                    eq(sectionTranslations.localeCode, locale),
                  ),
                )
                .limit(1);

              if (existingTrans.length > 0) {
                await db
                  .update(sectionTranslations)
                  .set({
                    title: (dataObj["title"] as string) ?? null,
                    subtitle: (dataObj["subtitle"] as string) ?? null,
                    updatedAt: new Date(),
                  })
                  .where(
                    and(
                      eq(sectionTranslations.sectionId, entityId),
                      eq(sectionTranslations.localeCode, locale),
                    ),
                  );
              } else {
                await db.insert(sectionTranslations).values({
                  sectionId: entityId,
                  localeCode: locale,
                  title: (dataObj["title"] as string) ?? null,
                  subtitle: (dataObj["subtitle"] as string) ?? null,
                });
              }
            }
          }
          break;
        }

        case "ui_text": {
          // entityId is the key name or uuid
          const textValue =
            typeof data === "string"
              ? data
              : String((data as Record<string, unknown>)["value"] ?? "");
          const targetLocale = locale ?? "ar";

          // Find key id
          const keyRows = await db
            .select()
            .from(uiTextKeys)
            .where(eq(uiTextKeys.key, entityId))
            .limit(1);

          let keyId = keyRows[0]?.id;
          if (!keyId) {
            const [createdKey] = await db
              .insert(uiTextKeys)
              .values({
                key: entityId,
                category: "inline_edit",
                description: "Created via inline edit mode",
              })
              .returning();
            keyId = createdKey?.id;
          }

          if (keyId) {
            const existingTrans = await db
              .select()
              .from(uiTextTranslations)
              .where(
                and(
                  eq(uiTextTranslations.keyId, keyId),
                  eq(uiTextTranslations.localeCode, targetLocale),
                ),
              )
              .limit(1);

            if (existingTrans.length > 0) {
              await db
                .update(uiTextTranslations)
                .set({ value: textValue, updatedAt: new Date() })
                .where(
                  and(
                    eq(uiTextTranslations.keyId, keyId),
                    eq(uiTextTranslations.localeCode, targetLocale),
                  ),
                );
            } else {
              await db.insert(uiTextTranslations).values({
                keyId,
                localeCode: targetLocale,
                value: textValue,
              });
            }
          }
          break;
        }

        case "navigation": {
          if (typeof data === "object" && data !== null) {
            await db
              .insert(systemSettings)
              .values({
                key: "navigation_config",
                value: data,
                description: "Dynamic navigation structure edited via admin",
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: systemSettings.key,
                set: {
                  value: data,
                  updatedAt: new Date(),
                },
              });
          }
          break;
        }

        default:
          break;
      }

      // Record immutable audit event
      try {
        await db.insert(auditEvents).values({
          userId: adminUserId,
          action: `inline_edit_${action}`,
          entityType,
          entityId,
          previousState,
          newState: typeof data === "object" ? data : { value: data },
          ipAddress: reqMeta?.ipAddress ?? null,
          userAgent: reqMeta?.userAgent ?? null,
        });
      } catch (auditErr) {
        logger.error("failed_to_write_audit_event", {
          module: "admin",
          userId: adminUserId,
          metadata: { error: String(auditErr) },
        });
      }

      // Invalidate relevant in-memory and edge caches
      sectionService.invalidateCache();
      localizedTextService.invalidateCache();
      navigationService.invalidateCache();

      logger.info("inline_edit_completed", {
        module: "admin",
        userId: adminUserId,
        metadata: { entityType, entityId, newVersion },
      });

      return {
        success: true,
        entityType,
        entityId,
        fieldOrBlockId,
        version: newVersion,
        updatedAt: new Date().toISOString(),
        data,
      };
    } catch (err) {
      logger.error("inline_edit_failed", {
        module: "admin",
        userId: adminUserId,
        metadata: { entityType, entityId, error: String(err) },
      });

      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to persist inline edit",
      };
    }
  }
}

export const inlineEditService = new InlineEditService();
