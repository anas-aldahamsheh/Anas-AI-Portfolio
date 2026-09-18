"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { SupportedLocale } from "../domain/locales";
import type { TranslationDictionary, TranslationParams } from "../domain/types";
import { interpolate } from "../application/get-translations";

interface LocalizationContextValue {
  t: (key: string, params?: TranslationParams) => string;
  locale: SupportedLocale;
  dir: "rtl" | "ltr";
  dictionary: TranslationDictionary;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

interface LocalizationProviderProps {
  children: React.ReactNode;
  locale: SupportedLocale;
  dir: "rtl" | "ltr";
  dictionary: TranslationDictionary;
}

export function LocalizationProvider({
  children,
  locale,
  dir,
  dictionary,
}: LocalizationProviderProps) {
  const value = useMemo<LocalizationContextValue>(() => {
    const t = (key: string, params?: TranslationParams): string => {
      const raw = dictionary[key];
      if (raw === undefined) {
        return `[${key}]`;
      }
      return interpolate(raw, params);
    };

    return {
      t,
      locale,
      dir,
      dictionary,
    };
  }, [dictionary, locale, dir]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useTranslation(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LocalizationProvider");
  }
  return context;
}
