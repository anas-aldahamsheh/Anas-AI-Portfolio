"use client";

import { AnimatePresence, m } from "motion/react";
import { Languages, Loader2, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { loadUiText, saveUiTextAction, translateAction } from "@/server/actions/admin";
import type { Locale } from "@/i18n/config";
import type { AdminStrings } from "../strings";

export function UiTextEditor({
  textKey,
  uiLocale,
  strings,
  onClose,
  onSaved,
}: {
  textKey: string | null;
  uiLocale: Locale;
  strings: AdminStrings;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState({ en: "", ar: "" });
  const [defaults, setDefaults] = useState({ en: "", ar: "" });
  const [busy, setBusy] = useState<"load" | "save" | "translate" | null>(textKey ? "load" : null);
  const [error, setError] = useState("");

  // Mounted per key (see the overlay), so only loading happens here.
  useEffect(() => {
    if (!textKey) return;
    let active = true;
    void loadUiText(textKey).then((result) => {
      if (!active) return;
      setBusy(null);
      if (result.ok) {
        setValues({ en: result.data.en, ar: result.data.ar });
        setDefaults(result.data.defaults);
      } else setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [textKey]);

  const translate = async (from: Locale, to: Locale) => {
    setBusy("translate");
    const result = await translateAction({ text: values[from] }, from, to);
    setBusy(null);
    if (result.ok && typeof result.data["text"] === "string")
      setValues((v) => ({ ...v, [to]: result.data["text"] as string }));
    else if (!result.ok) setError(result.error);
  };

  const save = async () => {
    if (!textKey) return;
    setBusy("save");
    const result = await saveUiTextAction(textKey, values);
    setBusy(null);
    if (result.ok) onSaved();
    else setError(result.error);
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {textKey ? (
        <m.div
          key="ui-text"
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          dir={uiLocale === "ar" ? "rtl" : "ltr"}
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <m.button
            type="button"
            aria-label={strings.close}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={strings.textKey}
            className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#0B1728]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-300">
                  {strings.textKey}
                </p>
                <p className="font-mono text-xs text-slate-500" dir="ltr">
                  {textKey}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label={strings.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {busy === "load" ? (
              <div className="flex justify-center py-10 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {(["en", "ar"] as const).map((locale) => (
                  <div key={locale}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor={`ui-${locale}`}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                      >
                        {locale === "en" ? strings.english : strings.arabic}
                      </label>
                      <button
                        type="button"
                        onClick={() => translate(locale === "en" ? "ar" : "en", locale)}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-white/10"
                      >
                        <Languages className="h-3 w-3" />
                        {locale === "ar" ? strings.translateToAr : strings.translateToEn}
                      </button>
                    </div>
                    <textarea
                      id={`ui-${locale}`}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      autoFocus={locale === uiLocale}
                      rows={Math.max(2, Math.ceil(values[locale].length / 60))}
                      value={values[locale]}
                      onChange={(event) =>
                        setValues((v) => ({ ...v, [locale]: event.target.value }))
                      }
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>
            )}
            {error ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setValues(defaults)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {strings.resetDefault}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {strings.cancel}
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {strings.save}
                </button>
              </div>
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
