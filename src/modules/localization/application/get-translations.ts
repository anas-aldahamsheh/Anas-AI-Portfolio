import {
  type SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  getDirectionForLocale,
} from "../domain/locales";
import type { TranslationParams } from "../domain/types";
import { LocalizedTextService } from "../infrastructure/localized-text-service";

export interface TranslationsContext {
  t: (key: string, params?: TranslationParams) => string;
  locale: SupportedLocale;
  dir: "rtl" | "ltr";
}

/**
 * Interpolates variables in a translated string (e.g. "Hello {name}" -> "Hello Anas").
 */
export function interpolate(text: string, params?: TranslationParams): string {
  if (!params || Object.keys(params).length === 0) {
    return text;
  }

  return text.replace(/\{([^{}]+)\}/g, (match, paramName: string) => {
    const trimmed = paramName.trim();
    if (params[trimmed] !== undefined) {
      return String(params[trimmed]);
    }
    return match;
  });
}

/**
 * Server-side translation helper for React Server Components and route handlers.
 * Resolves the dynamic dictionary from the database registry with memory cache.
 */
export async function getTranslations(localeInput: string): Promise<TranslationsContext> {
  const locale: SupportedLocale = isSupportedLocale(localeInput) ? localeInput : DEFAULT_LOCALE;

  const [primaryDict, fallbackDict] = await Promise.all([
    LocalizedTextService.getDictionary(locale),
    LocalizedTextService.getDictionary(locale === "ar" ? "en" : "ar"),
  ]);

  const dir = getDirectionForLocale(locale);

  const t = (key: string, params?: TranslationParams): string => {
    const rawValue = primaryDict[key] ?? fallbackDict[key];

    if (rawValue === undefined) {
      return `[${key}]`;
    }

    return interpolate(rawValue, params);
  };

  return {
    t,
    locale,
    dir,
  };
}
