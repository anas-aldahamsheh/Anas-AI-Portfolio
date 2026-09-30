"use client";

import { AnimatePresence, m } from "motion/react";
import { History, Languages, Loader2, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  COLLECTIONS,
  isSingleton,
  type CollectionName,
  type EntryStatus,
  type FieldSpec,
} from "@/server/content/collections";
import type { EntryRow } from "@/server/content/repository";
import {
  entryHistory,
  loadEntry,
  reextractDocument,
  removeEntry,
  restoreEntry,
  saveEntry,
  translateAction,
} from "@/server/actions/admin";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { AdminStrings } from "../strings";
import { FieldInput } from "./field-input";

type Tab = "en" | "ar" | "shared";

interface FormState {
  id?: string;
  version?: number;
  slug: string;
  status: EntryStatus;
  data: Record<string, unknown>;
  i18n: { en: Record<string, unknown>; ar: Record<string, unknown> };
}

function emptyState(collection: CollectionName): FormState {
  return {
    slug: "",
    status: "published",
    data: COLLECTIONS[collection].data.parse({}) as Record<string, unknown>,
    i18n: { en: {}, ar: {} },
  };
}

function fromRow(row: EntryRow): FormState {
  return {
    id: row.id,
    version: row.version,
    slug: row.slug,
    status: row.status,
    data: {
      ...(COLLECTIONS[row.collection as CollectionName].data.parse({}) as Record<string, unknown>),
      ...row.data,
    },
    i18n: { en: { ...(row.i18n["en"] ?? {}) }, ar: { ...(row.i18n["ar"] ?? {}) } },
  };
}

const isEmpty = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.every((x) => !String(x).trim()));

export function EntryEditor({
  open,
  collection,
  entryId,
  focusField,
  uiLocale,
  strings,
  onClose,
  onSaved,
}: {
  open: boolean;
  collection: CollectionName;
  entryId?: string | undefined;
  focusField?: string | undefined;
  uiLocale: Locale;
  strings: AdminStrings;
  onClose: () => void;
  onSaved: (row: EntryRow | null) => void;
}) {
  const spec = COLLECTIONS[collection];
  const fields = spec.fields as FieldSpec[];
  const focusSpec = fields.find((f) => f.name === focusField);
  const [tab, setTab] = useState<Tab>(
    focusSpec ? (focusSpec.localized ? uiLocale : "shared") : uiLocale,
  );
  const [form, setForm] = useState<FormState>(() => emptyState(collection));
  const [loading, setLoading] = useState(Boolean(entryId));
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<
    { id: string; version: number; action: string; createdAt: string }[] | null
  >(null);
  const [originalFile, setOriginalFile] = useState<unknown>(undefined);

  // Mounted fresh for each edit; only an existing entry needs loading.
  useEffect(() => {
    if (!entryId) return;
    let active = true;
    void loadEntry(entryId).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.ok) {
        setForm(fromRow(result.data));
        setOriginalFile(result.data.data["file"]);
      } else setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [entryId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const title = useMemo(() => {
    const t =
      form.i18n[uiLocale][spec.titleField] ??
      form.i18n.en[spec.titleField] ??
      form.i18n.ar[spec.titleField];
    return typeof t === "string" && t ? t : spec.label[uiLocale];
  }, [form, spec, uiLocale]);

  const setField = (field: FieldSpec, locale: Locale, value: unknown) =>
    setForm((prev) =>
      field.localized
        ? {
            ...prev,
            i18n: { ...prev.i18n, [locale]: { ...prev.i18n[locale], [field.name]: value } },
          }
        : { ...prev, data: { ...prev.data, [field.name]: value } },
    );

  const translate = async () => {
    const target: Locale = tab === "ar" ? "ar" : "en";
    const source: Locale = target === "ar" ? "en" : "ar";
    const pending: Record<string, string | string[]> = {};
    for (const field of fields.filter((f) => f.localized)) {
      const from = form.i18n[source][field.name];
      if (!isEmpty(from) && isEmpty(form.i18n[target][field.name]))
        pending[field.name] = from as string | string[];
    }
    if (Object.keys(pending).length === 0) return;
    setTranslating(true);
    const result = await translateAction(pending, source, target);
    setTranslating(false);
    if (result.ok)
      setForm((prev) => ({
        ...prev,
        i18n: { ...prev.i18n, [target]: { ...prev.i18n[target], ...result.data } },
      }));
    else setError(result.error);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const clean = (record: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(record).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : v,
        ]),
      );
    const result = await saveEntry({
      ...(form.id ? { id: form.id } : {}),
      collection,
      patch: {
        status: form.status,
        data: clean(form.data),
        i18n: { en: clean(form.i18n.en), ar: clean(form.i18n.ar) },
        ...(form.version !== undefined ? { expectedVersion: form.version } : {}),
        ...(form.slug && !isSingleton(collection) ? { slug: form.slug } : {}),
      },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (collection === "document" && result.data.data["file"] !== originalFile)
      void reextractDocument(result.data.id);
    onSaved(result.data);
  };

  const remove = async () => {
    if (!form.id || !window.confirm(strings.deleteConfirm)) return;
    setSaving(true);
    const result = await removeEntry(form.id);
    setSaving(false);
    if (result.ok) onSaved(null);
    else setError(result.error);
  };

  const tabFields = fields.filter((f) => (tab === "shared" ? !f.localized : f.localized));
  const hasShared = fields.some((f) => !f.localized);
  const tabs: { id: Tab; label: string }[] = [
    { id: "en", label: strings.english },
    { id: "ar", label: strings.arabic },
    ...(hasShared ? [{ id: "shared" as const, label: strings.shared }] : []),
  ];

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div
          key="editor"
          className="fixed inset-0 z-[70] flex justify-end"
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
          <m.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-[#0B1728]"
            initial={{ x: uiLocale === "ar" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: uiLocale === "ar" ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
          >
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-300">
                  {spec.label[uiLocale]}
                </p>
                <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label={strings.close}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex items-center gap-1 border-b border-slate-200 px-5 pt-3 dark:border-white/10">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative rounded-t-lg px-3 pt-1.5 pb-2.5 text-xs font-semibold transition-colors",
                    tab === t.id
                      ? "text-indigo-700 dark:text-indigo-200"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white",
                  )}
                >
                  {t.label}
                  {tab === t.id ? (
                    <m.span
                      layoutId="editor-tab"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-300"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {tab !== "shared" ? (
                    <button
                      type="button"
                      onClick={translate}
                      disabled={translating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60 dark:bg-indigo-500/15 dark:text-indigo-200"
                    >
                      {translating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Languages className="h-3.5 w-3.5" />
                      )}
                      {translating
                        ? strings.translating
                        : tab === "ar"
                          ? strings.translateToAr
                          : strings.translateToEn}
                    </button>
                  ) : null}
                  {tabFields.map((field) => (
                    <FieldInput
                      key={`${tab}-${field.name}`}
                      field={field}
                      locale={tab === "shared" ? uiLocale : tab}
                      value={
                        field.localized
                          ? form.i18n[tab as Locale][field.name]
                          : form.data[field.name]
                      }
                      onChange={(value) =>
                        setField(field, tab === "shared" ? uiLocale : (tab as Locale), value)
                      }
                      strings={strings}
                      autoFocus={field.name === focusField}
                    />
                  ))}
                  {tab === "shared" && !isSingleton(collection) ? (
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                        htmlFor="entry-slug"
                      >
                        {strings.slug}
                      </label>
                      <input
                        id="entry-slug"
                        dir="ltr"
                        value={form.slug}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, slug: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                      />
                    </div>
                  ) : null}
                  {collection === "document" &&
                  typeof form.data["extractedText"] === "string" &&
                  form.data["extractedText"] ? (
                    <details className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10">
                      <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                        Extracted text
                      </summary>
                      <pre
                        className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-slate-600 dark:text-slate-300"
                        dir="auto"
                      >
                        {String(form.data["extractedText"]).slice(0, 8000)}
                      </pre>
                    </details>
                  ) : null}
                  {history ? (
                    <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                      {history.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300"
                        >
                          <span>
                            v{h.version} · {h.action} ·{" "}
                            {new Date(h.createdAt).toLocaleString(uiLocale === "ar" ? "ar" : "en")}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              const result = await restoreEntry(h.id);
                              if (result.ok) onSaved(result.data);
                              else setError(result.error);
                            }}
                            className="rounded-md px-2 py-1 font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-white/10"
                          >
                            {strings.restore}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {error ? (
              <p className="mx-5 mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            ) : null}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <select
                  aria-label={strings.status}
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as EntryStatus }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <option value="published">{strings.published}</option>
                  <option value="draft">{strings.draft}</option>
                  <option value="hidden">{strings.hidden}</option>
                </select>
                {form.id ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await entryHistory(form.id!);
                      if (result.ok) setHistory(result.data);
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                    aria-label={strings.history}
                    title={strings.history}
                  >
                    <History className="h-4 w-4" />
                  </button>
                ) : null}
                {form.id && !isSingleton(collection) ? (
                  <button
                    type="button"
                    onClick={remove}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    aria-label={strings.delete}
                    title={strings.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
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
                  disabled={saving || loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? strings.saving : strings.save}
                </button>
              </div>
            </footer>
          </m.section>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
