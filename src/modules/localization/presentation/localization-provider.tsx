"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { SupportedLocale } from "../domain/locales";
import type { TranslationDictionary, TranslationParams } from "../domain/types";
import { interpolate } from "../domain/interpolation";
import { useAdminEdit } from "@/modules/admin/presentation/admin-edit-provider";

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
  dir?: "rtl" | "ltr";
  dictionary: TranslationDictionary;
}

export function LocalizationProvider({
  children,
  locale,
  dir = locale === "ar" ? "rtl" : "ltr",
  dictionary,
}: LocalizationProviderProps) {
  const [dict, setDict] = useState<TranslationDictionary>(dictionary);
  const { registerUpdateHandler } = useAdminEdit();

  // Synchronize when dictionary prop updates from server
  useEffect(() => {
    setDict(dictionary);
  }, [dictionary]);

  // Listen to authoritative inline edit changes in real-time
  useEffect(() => {
    return registerUpdateHandler((result) => {
      if (result.entityType === "ui_text") {
        const textVal =
          typeof result.data === "string"
            ? result.data
            : String((result.data as Record<string, unknown>)["value"] ?? "");
        setDict((prev) => ({
          ...prev,
          [result.entityId]: textVal,
        }));
      }
    });
  }, [registerUpdateHandler]);

  const value = useMemo<LocalizationContextValue>(() => {
    const t = (key: string, params?: TranslationParams): string => {
      const raw = dict[key];
      if (raw === undefined) {
        return `[${key}]`;
      }
      return interpolate(raw, params);
    };

    return {
      t,
      locale,
      dir,
      dictionary: dict,
    };
  }, [dict, locale, dir]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useTranslation(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LocalizationProvider");
  }
  return context;
}

export const useLocalization = useTranslation;
