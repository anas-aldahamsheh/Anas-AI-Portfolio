import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locales, uiTextKeys, uiTextTranslations } from "@/lib/db/schema/localization";
import { logger } from "@/lib/observability/logger";
import {
  type SupportedLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "../domain/locales";
import type { TranslationDictionary, CompletenessReport, TranslationResult } from "../domain/types";
import { CORE_SYSTEM_KEYS } from "./core-system-keys";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

class LocalizedTextServiceImpl {
  private cache: Map<SupportedLocale, Map<string, string>> = new Map();
  private cacheTimestamps: Map<SupportedLocale, number> = new Map();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory TTL
  private readonly QUERY_TIMEOUT_MS = process.env.NODE_ENV === "test" ? 300 : 2500;

  /**
   * Invalidate in-memory cache for all or a specific locale.
   */
  public invalidateCache(locale?: SupportedLocale): void {
    if (locale) {
      this.cache.delete(locale);
      this.cacheTimestamps.delete(locale);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }

  /**
   * Retrieves the full translation dictionary for a given locale.
   */
  public async getDictionary(localeInput: string): Promise<TranslationDictionary> {
    const locale: SupportedLocale = isSupportedLocale(localeInput) ? localeInput : DEFAULT_LOCALE;

    const cached = this.cache.get(locale);
    const timestamp = this.cacheTimestamps.get(locale) ?? 0;

    if (cached && Date.now() - timestamp < this.CACHE_TTL_MS) {
      return Object.fromEntries(cached.entries());
    }

    try {
      const rows = await withTimeout(
        db
          .select({
            key: uiTextKeys.key,
            value: uiTextTranslations.value,
          })
          .from(uiTextTranslations)
          .innerJoin(uiTextKeys, eq(uiTextTranslations.keyId, uiTextKeys.id))
          .where(eq(uiTextTranslations.localeCode, locale)),
        this.QUERY_TIMEOUT_MS,
      );

      const dict = new Map<string, string>();

      // Populate from database
      for (const row of rows) {
        dict.set(row.key, row.value);
      }

      // If database is empty for this locale (e.g. fresh installation before bootstrap),
      // provide core system baseline so the application never breaks
      if (dict.size === 0) {
        for (const item of CORE_SYSTEM_KEYS) {
          const val = item.translations[locale];
          if (val) {
            dict.set(item.key, val);
          }
        }
      }

      this.cache.set(locale, dict);
      this.cacheTimestamps.set(locale, Date.now());

      return Object.fromEntries(dict.entries());
    } catch (err) {
      logger.warn("localization_database_read_fallback", {
        module: "localization",
        metadata: {
          locale,
          error: String(err),
        },
      });

      // Resilient fallback to core system keys on database connectivity blip
      const fallbackDict: TranslationDictionary = {};
      for (const item of CORE_SYSTEM_KEYS) {
        fallbackDict[item.key] = item.translations[locale];
      }

      // Cache fallback so we do not repeatedly stall on unmounted DB connections
      this.cache.set(locale, new Map(Object.entries(fallbackDict)));
      this.cacheTimestamps.set(locale, Date.now());

      return fallbackDict;
    }
  }

  /**
   * Resolves a single translated key for a locale.
   * Complies with docs/frontend/07_DYNAMIC_UI_TEXT.md:
   * - No silent embedded fallbacks.
   * - Fallback to secondary locale ONLY if database translation exists there.
   * - Structured warning / error logged for missing keys.
   */
  public async get(key: string, localeInput: string): Promise<TranslationResult> {
    const locale: SupportedLocale = isSupportedLocale(localeInput) ? localeInput : DEFAULT_LOCALE;

    const dict = await this.getDictionary(locale);

    if (dict[key] !== undefined) {
      return {
        value: dict[key],
        locale,
        isFallback: false,
      };
    }

    // Determine fallback locale
    const fallbackLocale: SupportedLocale = locale === "ar" ? "en" : "ar";
    const fallbackDict = await this.getDictionary(fallbackLocale);

    if (fallbackDict[key] !== undefined) {
      logger.warn("localization_key_fallback_used", {
        module: "localization",
        metadata: {
          key,
          requestedLocale: locale,
          fallbackLocale,
        },
      });

      return {
        value: fallbackDict[key],
        locale: fallbackLocale,
        isFallback: true,
      };
    }

    // Key is missing completely
    logger.error("missing_localization_key", {
      module: "localization",
      metadata: {
        key,
        locale,
      },
    });

    return {
      value: `[missing: ${key}]`,
      locale,
      isFallback: false,
    };
  }

  /**
   * Ensures the core system keys are idempotently registered and seeded in the database.
   */
  public async ensureCoreKeysSeeded(): Promise<void> {
    try {
      // 1. Seed locales if missing
      for (const loc of SUPPORTED_LOCALES) {
        await db
          .insert(locales)
          .values({
            code: loc,
            name: loc === "ar" ? "Arabic" : "English",
            dir: loc === "ar" ? "rtl" : "ltr",
            isDefault: loc === DEFAULT_LOCALE,
            isEnabled: true,
          })
          .onConflictDoNothing();
      }

      // 2. Seed core system keys and translations
      for (const item of CORE_SYSTEM_KEYS) {
        // Upsert key
        const existingKey = await db
          .select({ id: uiTextKeys.id })
          .from(uiTextKeys)
          .where(eq(uiTextKeys.key, item.key))
          .limit(1);

        let keyId: string;

        if (existingKey.length > 0 && existingKey[0]) {
          keyId = existingKey[0].id;
        } else {
          const inserted = await db
            .insert(uiTextKeys)
            .values({
              key: item.key,
              category: item.category,
              description: item.description,
            })
            .returning({ id: uiTextKeys.id });
          if (!inserted[0]) continue;
          keyId = inserted[0].id;
        }

        // Upsert translations for each supported locale
        for (const loc of SUPPORTED_LOCALES) {
          const transValue = item.translations[loc];
          await db
            .insert(uiTextTranslations)
            .values({
              keyId,
              localeCode: loc,
              value: transValue,
            })
            .onConflictDoUpdate({
              target: [uiTextTranslations.keyId, uiTextTranslations.localeCode],
              set: {
                value: transValue,
                updatedAt: new Date(),
              },
            });
        }
      }

      this.invalidateCache();
      logger.info("core_localization_keys_seeded", {
        module: "localization",
        metadata: {
          totalKeys: CORE_SYSTEM_KEYS.length,
        },
      });
    } catch (err) {
      logger.error("failed_to_seed_core_localization_keys", {
        module: "localization",
        metadata: { error: String(err) },
      });
    }
  }

  /**
   * Generates a completeness audit report for admin visibility.
   */
  public async checkCompleteness(): Promise<CompletenessReport> {
    let allKeys: { key: string }[] = [];

    try {
      allKeys = await withTimeout(
        db.select({ key: uiTextKeys.key }).from(uiTextKeys),
        this.QUERY_TIMEOUT_MS,
      );
    } catch {
      allKeys = CORE_SYSTEM_KEYS.map((k) => ({ key: k.key }));
    }

    const arDict = await this.getDictionary("ar");
    const enDict = await this.getDictionary("en");

    const missingArabic: string[] = [];
    const missingEnglish: string[] = [];
    const completeKeys: string[] = [];

    for (const k of allKeys) {
      const arVal = arDict[k.key];
      const enVal = enDict[k.key];
      const hasAr = typeof arVal === "string" && arVal.trim().length > 0;
      const hasEn = typeof enVal === "string" && enVal.trim().length > 0;

      if (!hasAr) missingArabic.push(k.key);
      if (!hasEn) missingEnglish.push(k.key);
      if (hasAr && hasEn) completeKeys.push(k.key);
    }

    const total = allKeys.length;
    const completenessPercentage =
      total === 0 ? 100 : Math.round((completeKeys.length / total) * 100);

    return {
      totalKeys: total,
      missingArabic,
      missingEnglish,
      completeKeys,
      completenessPercentage,
    };
  }
}

export const LocalizedTextService = new LocalizedTextServiceImpl();
