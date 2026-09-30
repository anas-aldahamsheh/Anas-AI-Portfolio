"use client";

import { FileText, FileUp, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import type { EntryRow } from "@/server/content/repository";
import {
  indexOverview,
  loadCollection,
  rebuildIndexAction,
  reextractDocument,
  removeEntry,
  searchPlayground,
  uploadCv,
  uploadDocument,
  type IndexSource,
} from "@/server/actions/admin";
import { cn } from "@/lib/utils";
import { adminStrings } from "../strings";
import { ContentTab } from "./content-tab";
import { L, Panel } from "./admin-app";

type Hit = {
  title: string;
  heading: string;
  kind: string;
  locale: string;
  text: string;
  score: number;
  signals: {
    dense: number | null;
    lexical: number | null;
    title: number | null;
    rerank: number | null;
  };
};

export function KnowledgeTab() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const [docs, setDocs] = useState<EntryRow[] | null>(null);
  const [sources, setSources] = useState<IndexSource[]>([]);
  const [stats, setStats] = useState({ chunks: 0, missing: 0 });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [rerank, setRerank] = useState(true);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);

  const apply = useCallback(
    ([d, o]: [
      Awaited<ReturnType<typeof loadCollection>>,
      Awaited<ReturnType<typeof indexOverview>>,
    ]) => {
      if (d.ok) setDocs(d.data);
      if (o.ok) {
        setSources(o.data.sources);
        setStats({ chunks: o.data.chunks, missing: o.data.missingEmbeddings });
      }
    },
    [],
  );
  const fetchAll = () => Promise.all([loadCollection("document"), indexOverview()]);
  const refresh = useCallback(() => fetchAll().then(apply), [apply]);

  useEffect(() => {
    let active = true;
    void fetchAll().then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const upload = async (file: File, kind: "cv" | "doc") => {
    const form = new FormData();
    form.set("file", file);
    setBusy(kind);
    const result = kind === "cv" ? await uploadCv(form) : await uploadDocument(form);
    setBusy(null);
    setMessage(result.ok ? strings.cvUploaded : result.error);
    void refresh();
    // Extraction runs in the background; check again shortly.
    setTimeout(() => void refresh(), 20_000);
  };

  const search = async () => {
    if (!query.trim()) return;
    setBusy("search");
    const result = await searchPlayground(query, rerank);
    setBusy(null);
    setHits(result.ok ? result.data : []);
  };

  return (
    <div className="space-y-6">
      <Panel
        title={L(locale, "CV & knowledge files", "السيرة الذاتية وملفات المعرفة")}
        description={L(
          locale,
          "Upload your CV or any document about you (PDF, image, TXT, MD). The AI reads it and answers from it; delete a file and it forgets it.",
          "ارفع سيرتك الذاتية أو أي ملف عنك (PDF، صورة، TXT، MD). المساعد بيقرأه وبيجاوب منه، وإذا حذفت الملف بينساه.",
        )}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => cvInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {busy === "cv" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileUp className="h-3.5 w-3.5" />
              )}
              {strings.uploadCv}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => docInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {busy === "doc" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileUp className="h-3.5 w-3.5" />
              )}
              {L(locale, "Upload a file", "رفع ملف")}
            </button>
            <input
              ref={cvInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void upload(f, "cv");
              }}
            />
            <input
              ref={docInput}
              type="file"
              accept=".pdf,.txt,.md,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void upload(f, "doc");
              }}
            />
          </div>
        }
      >
        {message ? (
          <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            {message}
          </p>
        ) : null}
        {docs === null ? (
          <div className="flex justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {L(
              locale,
              "No files yet. Start with your CV.",
              "ما في ملفات لسا. ابدأ بسيرتك الذاتية.",
            )}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {docs.map((doc) => {
              const extracted = Boolean(doc.data["extractedText"]);
              const failed = Boolean(doc.data["extractionError"]);
              const title = (doc.i18n[locale]?.["title"] ??
                doc.i18n["en"]?.["title"] ??
                doc.slug) as string;
              return (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100"
                        dir="auto"
                      >
                        {title}{" "}
                        {doc.data["role"] === "cv" ? (
                          <span className="ms-1 rounded-full bg-indigo-600 px-1.5 py-px text-[10px] font-bold text-white">
                            CV
                          </span>
                        ) : null}
                      </p>
                      <p
                        className={cn(
                          "text-[11px]",
                          failed
                            ? "text-rose-600"
                            : extracted
                              ? "text-emerald-600"
                              : "text-amber-600",
                        )}
                      >
                        {failed
                          ? `${L(locale, "Could not read", "ما قدر يقرأ")}: ${String(doc.data["extractionError"])}`
                          : extracted
                            ? L(
                                locale,
                                `Read by the AI · ${String(doc.data["extractedText"]).length.toLocaleString()} characters`,
                                `قرأه المساعد · ${String(doc.data["extractedText"]).length.toLocaleString()} حرف`,
                              )
                            : L(locale, "Reading…", "عم يقرأ…")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {typeof doc.data["file"] === "string" && doc.data["file"] ? (
                      <a
                        href={doc.data["file"] as string}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        {L(locale, "Open", "فتح")}
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={async () => {
                        await reextractDocument(doc.id);
                        setMessage(L(locale, "Re-reading the file…", "عم يعيد قراءة الملف…"));
                        setTimeout(() => void refresh(), 20_000);
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-white/10"
                    >
                      {L(locale, "Re-read", "إعادة قراءة")}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(strings.deleteConfirm)) return;
                        await removeEntry(doc.id);
                        void refresh();
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      {strings.delete}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <ContentTab only={["note"]} />

      <Panel
        title={L(locale, "Test the AI search", "جرّب بحث الذكاء")}
        description={L(
          locale,
          "See exactly what the assistant retrieves: semantic, keyword and title signals, plus the AI reranker score.",
          "شوف بالضبط شو بيسترجع المساعد: إشارات المعنى والكلمات والعنوان، وتقييم إعادة الترتيب.",
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
          className="flex flex-wrap gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L(
                locale,
                "e.g. experience with evaluation pipelines",
                "مثلاً: خبرة بتقييم النماذج",
              )}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-9 pe-3 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              dir="auto"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={rerank}
              onChange={(e) => setRerank(e.target.checked)}
              className="accent-indigo-600"
            />
            {L(locale, "AI rerank", "إعادة ترتيب بالذكاء")}
          </label>
          <button
            type="submit"
            disabled={busy === "search"}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            {busy === "search" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {L(locale, "Search", "بحث")}
          </button>
        </form>
        {hits ? (
          <ol className="mt-4 space-y-2">
            {hits.length === 0 ? (
              <li className="text-sm text-slate-400">{L(locale, "No results.", "ما في نتائج.")}</li>
            ) : null}
            {hits.map((hit, i) => (
              <li key={i} className="rounded-xl border border-slate-100 p-3 dark:border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                    dir="auto"
                  >
                    {i + 1}. {hit.heading}
                  </p>
                  <p className="flex flex-wrap gap-1 font-mono text-[10px] text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-white/10">
                      {hit.kind}/{hit.locale}
                    </span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                      dense #{hit.signals.dense ?? "–"}
                    </span>
                    <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200">
                      keyword #{hit.signals.lexical ?? "–"}
                    </span>
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
                      title #{hit.signals.title ?? "–"}
                    </span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                      rerank {hit.signals.rerank ?? "–"}/3
                    </span>
                  </p>
                </div>
                <p
                  className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-500"
                  dir="auto"
                >
                  {hit.text}
                </p>
              </li>
            ))}
          </ol>
        ) : null}
      </Panel>

      <Panel
        title={L(locale, "Index", "الفهرس")}
        description={L(
          locale,
          `${sources.length} sources · ${stats.chunks} chunks${stats.missing ? ` · ${stats.missing} waiting for embeddings` : ""}`,
          `${sources.length} مصدر · ${stats.chunks} جزء${stats.missing ? ` · ${stats.missing} بانتظار التضمين` : ""}`,
        )}
        action={
          <button
            type="button"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("rebuild");
              const r = await rebuildIndexAction();
              setBusy(null);
              setMessage(r.ok ? L(locale, "Index rebuilt.", "تمت إعادة بناء الفهرس.") : r.error);
              void refresh();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {busy === "rebuild" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {L(locale, "Rebuild", "إعادة بناء")}
          </button>
        }
      >
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white text-start text-slate-400 dark:bg-[#0B1728]">
              <tr>
                <th className="py-2 text-start font-semibold">{L(locale, "Source", "المصدر")}</th>
                <th className="py-2 text-start font-semibold">{L(locale, "Type", "النوع")}</th>
                <th className="py-2 text-start font-semibold">{L(locale, "Chunks", "الأجزاء")}</th>
                <th className="py-2 text-start font-semibold">{L(locale, "Status", "الحالة")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {sources.map((s) => (
                <tr key={s.id}>
                  <td
                    className="max-w-[18rem] truncate py-2 pe-3 font-medium text-slate-700 dark:text-slate-200"
                    dir="auto"
                  >
                    {s.title}
                  </td>
                  <td className="py-2 pe-3 text-slate-500">
                    {s.kind}/{s.locale}
                  </td>
                  <td className="py-2 pe-3 text-slate-500 tabular-nums">{s.chunkCount}</td>
                  <td
                    className={cn(
                      "py-2 font-semibold",
                      s.status === "ready" ? "text-emerald-600" : "text-amber-600",
                    )}
                  >
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
