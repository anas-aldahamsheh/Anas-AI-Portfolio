"use client";

import { createContext, useContext, type ReactNode } from "react";
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
  return (
    <I18nContext.Provider value={{ locale, dir: locale === "ar" ? "rtl" : "ltr", messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  const t = (key: MessageKey) => value.messages[key];
  return { ...value, t };
}
