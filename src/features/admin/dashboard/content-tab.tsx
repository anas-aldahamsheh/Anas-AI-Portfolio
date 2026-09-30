"use client";

import { AnimatePresence, m } from "motion/react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import {
  COLLECTIONS,
  COLLECTION_NAMES,
  isSingleton,
  type CollectionName,
} from "@/server/content/collections";
import type { EntryRow } from "@/server/content/repository";
import { loadCollection, shiftEntry } from "@/server/actions/admin";
import { cn } from "@/lib/utils";
import { adminStrings } from "../strings";
import { EntryEditor } from "../editor/entry-editor";
import { L, Panel } from "./admin-app";

const VISIBLE: CollectionName[] = COLLECTION_NAMES.filter((c) => c !== "document");

function titleOf(row: EntryRow, locale: "en" | "ar"): string {
  const field = COLLECTIONS[row.collection as CollectionName].titleField;
  const value = row.i18n[locale]?.[field] ?? row.i18n["en"]?.[field] ?? row.i18n["ar"]?.[field];
  return typeof value === "string" && value ? value : row.slug;
}

export function ContentTab({ only }: { only?: CollectionName[] } = {}) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const collections = only ?? VISIBLE;
  const [collection, setCollection] = useState<CollectionName>(collections[0] ?? "project");
  const [rows, setRows] = useState<EntryRow[] | null>(null);
  const [editor, setEditor] = useState<{ entryId?: string } | null>(null);
  const [error, setError] = useState("");

  const apply = useCallback((result: Awaited<ReturnType<typeof loadCollection>>) => {
    if (result.ok) setRows(result.data);
    else setError(result.error);
  }, []);

  // Reload after a change (called from event handlers).
  const load = useCallback(() => loadCollection(collection).then(apply), [collection, apply]);

  useEffect(() => {
    let active = true;
    void loadCollection(collection).then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [collection, apply]);

  const spec = COLLECTIONS[collection];
  const singleton = isSingleton(collection);

  return (
    <div className="space-y-5">
      {collections.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {collections.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setRows(null);
                setCollection(name);
              }}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                collection === name
                  ? "text-white"
                  : "bg-white text-slate-600 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white",
              )}
            >
              {collection === name ? (
                <m.span
                  layoutId="content-pill"
                  className="absolute inset-0 rounded-full bg-indigo-600"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">{COLLECTIONS[name].label[locale]}</span>
            </button>
          ))}
        </div>
      ) : null}

      <Panel
        title={spec.label[locale]}
        description={L(
          locale,
          "Changes appear on the site immediately and the AI assistant re-learns them.",
          "التعديلات بتظهر على الموقع فوراً والمساعد الذكي بيتعلمها من جديد.",
        )}
        action={
          !singleton || (rows && rows.length === 0) ? (
            <button
              type="button"
              onClick={() => setEditor({})}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" />
              {strings.add}
            </button>
          ) : null
        }
      >
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        {rows === null ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            {L(locale, "Nothing here yet.", "ما في إشي لسا.")}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            <AnimatePresence initial={false}>
              {rows.map((row, index) => (
                <m.li
                  key={row.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <button
                    type="button"
                    onClick={() => setEditor({ entryId: row.id })}
                    className="min-w-0 flex-1 text-start"
                  >
                    <p
                      className="truncate text-sm font-semibold text-slate-800 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                      dir="auto"
                    >
                      {titleOf(row, locale)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-px font-semibold",
                          row.status === "published"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10",
                        )}
                      >
                        {strings[row.status]}
                      </span>
                      {!row.i18n["ar"] || Object.keys(row.i18n["ar"]).length === 0 ? (
                        <span className="text-amber-600">
                          {L(locale, "No Arabic yet", "بدون عربي")}
                        </span>
                      ) : null}
                      {!row.i18n["en"] || Object.keys(row.i18n["en"]).length === 0 ? (
                        <span className="text-amber-600">
                          {L(locale, "No English yet", "بدون إنجليزي")}
                        </span>
                      ) : null}
                    </p>
                  </button>
                  {!singleton ? (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={async () => {
                          await shiftEntry(row.id, -1);
                          void load();
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-white/10"
                        aria-label={strings.moveUp}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === rows.length - 1}
                        onClick={async () => {
                          await shiftEntry(row.id, 1);
                          void load();
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-white/10"
                        aria-label={strings.moveDown}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEditor({ entryId: row.id })}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/10"
                    aria-label={strings.edit}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>

      {editor ? (
        <EntryEditor
          open
          collection={collection}
          entryId={editor.entryId}
          uiLocale={locale}
          strings={strings}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            void load();
          }}
        />
      ) : null}
    </div>
  );
}
