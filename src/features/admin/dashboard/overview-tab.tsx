"use client";

import { m } from "motion/react";
import {
  BookOpenText,
  Bot,
  CheckCircle2,
  FileUp,
  Loader2,
  MessagesSquare,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { COLLECTIONS, COLLECTION_NAMES } from "@/server/content/collections";
import {
  indexOverview,
  loadCollection,
  rebuildIndexAction,
  recentConversations,
  uploadCv,
} from "@/server/actions/admin";
import { adminStrings } from "../strings";
import { L, Panel } from "./admin-app";

export function OverviewTab({
  onNavigate,
}: {
  onNavigate: (tab: "content" | "knowledge" | "conversations") => void;
}) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [index, setIndex] = useState<{
    sources: number;
    chunks: number;
    missing: number;
    failed: number;
  } | null>(null);
  const [questions, setQuestions] = useState<{ id: string; question: string; createdAt: string }[]>(
    [],
  );
  const [busy, setBusy] = useState<"cv" | "rebuild" | null>(null);
  const [message, setMessage] = useState("");
  const cvInput = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    const all = await Promise.all(COLLECTION_NAMES.map((name) => loadCollection(name)));
    const [overview, turns] = await Promise.all([indexOverview(), recentConversations(6)]);
    return { all, overview, turns };
  };

  const apply = useCallback(({ all, overview, turns }: Awaited<ReturnType<typeof fetchAll>>) => {
    setCounts(
      Object.fromEntries(
        COLLECTION_NAMES.map((name, i) => [name, all[i]?.ok ? all[i].data.length : 0]),
      ),
    );
    if (overview.ok)
      setIndex({
        sources: overview.data.sources.length,
        chunks: overview.data.chunks,
        missing: overview.data.missingEmbeddings,
        failed: overview.data.sources.filter((s) => s.status !== "ready").length,
      });
    if (turns.ok) setQuestions(turns.data);
  }, []);

  const refresh = () => fetchAll().then(apply);

  useEffect(() => {
    let active = true;
    void fetchAll().then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const rebuild = async () => {
    setBusy("rebuild");
    const result = await rebuildIndexAction();
    setBusy(null);
    setMessage(
      result.ok
        ? L(
            locale,
            `Index rebuilt: ${result.data.added} added, ${result.data.updated} updated, ${result.data.removed} removed.`,
            `تمت إعادة البناء: ${result.data.added} جديد، ${result.data.updated} محدّث، ${result.data.removed} محذوف.`,
          )
        : result.error,
    );
    void refresh();
  };

  const cards = [
    {
      label: L(locale, "Indexed chunks", "أجزاء مفهرسة"),
      value: index?.chunks ?? "…",
      icon: BookOpenText,
      tone: "from-indigo-500 to-violet-500",
    },
    {
      label: L(locale, "Knowledge sources", "مصادر المعرفة"),
      value: index?.sources ?? "…",
      icon: Bot,
      tone: "from-cyan-500 to-blue-500",
    },
    {
      label: L(locale, "Projects", "المشاريع"),
      value: counts["project"] ?? "…",
      icon: CheckCircle2,
      tone: "from-emerald-500 to-teal-500",
    },
    {
      label: L(locale, "Recent questions", "أسئلة حديثة"),
      value: questions.length,
      icon: MessagesSquare,
      tone: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {L(locale, "Welcome back", "أهلاً فيك")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {L(
              locale,
              "Tip: turn on edit mode on the site to change any text or item in place.",
              "نصيحة: فعّل وضع التعديل على الموقع لتعدّل أي نص أو عنصر مكانه.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => cvInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {busy === "cv" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4" />
            )}
            {strings.uploadCv}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={rebuild}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {busy === "rebuild" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {L(locale, "Rebuild AI index", "إعادة بناء فهرس الذكاء")}
          </button>
          <input
            ref={cvInput}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const form = new FormData();
              form.set("file", file);
              setBusy("cv");
              const result = await uploadCv(form);
              setBusy(null);
              setMessage(result.ok ? strings.cvUploaded : result.error);
              setTimeout(() => void refresh(), 15_000);
            }}
          />
        </div>
      </div>

      {message ? (
        <m.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
        >
          {message}
        </m.p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <m.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-[#0B1728]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow ${card.tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-3xl font-bold text-slate-900 tabular-nums dark:text-white">
                {card.value}
              </p>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
            </m.div>
          );
        })}
      </div>

      {index && (index.missing > 0 || index.failed > 0) ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {L(
            locale,
            `${index.missing} chunks are waiting for embeddings (the AI service was unavailable). Rebuild the index to finish them; keyword search already works.`,
            `${index.missing} جزء بانتظار التضمين (خدمة الذكاء كانت مش متاحة). أعد بناء الفهرس لإكمالها، والبحث بالكلمات شغّال.`,
          )}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title={L(locale, "Your content", "محتواك")}
          action={
            <button
              type="button"
              onClick={() => onNavigate("content")}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
            >
              {L(locale, "Manage", "إدارة")}
            </button>
          }
        >
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {COLLECTION_NAMES.map((name) => (
              <li key={name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {COLLECTIONS[name].label[locale]}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 tabular-nums dark:bg-white/10 dark:text-slate-300">
                  {counts[name] ?? "…"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title={L(locale, "What visitors ask", "شو بيسألوا الزوار")}
          action={
            <button
              type="button"
              onClick={() => onNavigate("conversations")}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
            >
              {L(locale, "All", "الكل")}
            </button>
          }
        >
          {questions.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              {L(locale, "No questions yet.", "ما في أسئلة لسا.")}
            </p>
          ) : (
            <ul className="space-y-2">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200"
                  dir="auto"
                >
                  {q.question}
                  <span className="mt-1 block text-[11px] text-slate-400">
                    {new Date(q.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
