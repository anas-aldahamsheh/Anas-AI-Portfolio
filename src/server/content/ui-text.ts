import { cacheLife, cacheTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { uiTexts } from "@/lib/db/schema";
import { MESSAGES, isMessageKey, type Messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { UI_TEXT_TAG } from "./tags";

async function loadOverrides(locale: Locale): Promise<Record<string, string>> {
  "use cache";
  cacheTag(UI_TEXT_TAG);
  try {
    const rows = await db
      .select({ key: uiTexts.key, value: uiTexts.value })
      .from(uiTexts)
      .where(eq(uiTexts.locale, locale));
    cacheLife("hours");
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  } catch (error) {
    console.error("ui_text_load_failed", error instanceof Error ? error.message : error);
    cacheLife("minutes");
    return {};
  }
}

/** Interface copy for one language: code defaults with the admin's overrides on top. */
export async function getMessages(locale: Locale): Promise<Messages> {
  const overrides = await loadOverrides(locale);
  const messages: Messages = { ...MESSAGES[locale] };
  for (const [key, value] of Object.entries(overrides)) {
    if (isMessageKey(key) && value.trim()) messages[key] = value;
  }
  return messages;
}

export async function getUiTextValues(
  key: string,
): Promise<{ en: string; ar: string; defaults: { en: string; ar: string } }> {
  const rows = await db.select().from(uiTexts).where(eq(uiTexts.key, key));
  const en = rows.find((r) => r.locale === "en")?.value;
  const ar = rows.find((r) => r.locale === "ar")?.value;
  const defaults = isMessageKey(key)
    ? { en: MESSAGES.en[key], ar: MESSAGES.ar[key] }
    : { en: "", ar: "" };
  return { en: en ?? defaults.en, ar: ar ?? defaults.ar, defaults };
}

/** Saves overrides; an empty value (or the default) removes the override. */
export async function saveUiText(
  key: string,
  values: Partial<Record<Locale, string>>,
): Promise<void> {
  if (!isMessageKey(key)) throw new Error(`Unknown text key "${key}"`);
  for (const [locale, raw] of Object.entries(values) as [Locale, string | undefined][]) {
    if (raw === undefined) continue;
    const value = raw.trim().slice(0, 4000);
    if (!value || value === MESSAGES[locale][key]) {
      await db.delete(uiTexts).where(and(eq(uiTexts.key, key), eq(uiTexts.locale, locale)));
      continue;
    }
    await db
      .insert(uiTexts)
      .values({ key, locale, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [uiTexts.key, uiTexts.locale],
        set: { value, updatedAt: new Date() },
      });
  }
}
