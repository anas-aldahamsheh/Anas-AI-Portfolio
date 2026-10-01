"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { MessageKey, Messages } from "./messages";

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  messages: Messages;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({ locale, dir: locale === "ar" ? "rtl" : "ltr", messages }),
    [locale, messages],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  const messages = value?.messages;
  // Stable between renders, so components can list `t` in effect dependencies safely.
  const t = useCallback((key: MessageKey) => (messages ? messages[key] : key), [messages]);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return { ...value, t };
}
