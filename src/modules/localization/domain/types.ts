import type { SupportedLocale } from "./locales";

export type TranslationDictionary = Record<string, string>;

export type TranslationParams = Record<string, string | number>;

export interface CompletenessReport {
  totalKeys: number;
  missingArabic: string[];
  missingEnglish: string[];
  completeKeys: string[];
  completenessPercentage: number;
}

export interface TranslationResult {
  value: string;
  locale: SupportedLocale;
  isFallback: boolean;
}
