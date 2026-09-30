export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "pf_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ar";
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
export const otherLocale = (locale: Locale): Locale => (locale === "ar" ? "en" : "ar");
