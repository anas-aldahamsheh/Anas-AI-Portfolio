export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "ar";

export interface LocaleMetadata {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: "rtl" | "ltr";
}

export const LOCALES_METADATA: Record<SupportedLocale, LocaleMetadata> = {
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
  },
};

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getDirectionForLocale(locale: string): "rtl" | "ltr" {
  if (locale === "ar") return "rtl";
  return "ltr";
}
