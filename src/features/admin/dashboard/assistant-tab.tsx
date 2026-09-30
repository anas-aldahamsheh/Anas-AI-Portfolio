"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import type { AiSettings } from "@/ai/settings";
import { loadAssistantSettings, saveAssistantSettings } from "@/server/actions/admin";
import { adminStrings } from "../strings";
import { L, Panel } from "./admin-app";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100";

export function AssistantTab() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    void loadAssistantSettings().then((r) => r.ok && setSettings(r.data));
  }, []);

  if (!settings) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const set = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) =>
    setSettings({ ...settings, [key]: value });
  const lines = (text: string) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const save = async () => {
    setBusy(true);
    const result = await saveAssistantSettings(settings);
    setBusy(false);
    if (result.ok) setSettings(result.data);
    setMessage(result.ok ? { text: strings.saved, ok: true } : { text: result.error, ok: false });
  };

  return (
    <div className="space-y-6">
      <Panel
        title={L(locale, "How the assistant talks", "كيف بيحكي المساعد")}
        description={L(
          locale,
          "Extra guidance on top of the built-in rules (it always stays factual and cites sources).",
          "توجيهات إضافية فوق القواعد الأساسية (بيضل ملتزم بالحقائق وبيذكر المصادر).",
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {(["en", "ar"] as const).map((l) => (
            <div key={l}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                {l === "en" ? strings.english : strings.arabic}
              </label>
              <textarea
                dir={l === "ar" ? "rtl" : "ltr"}
                rows={6}
                value={settings.instructions[l]}
                onChange={(e) =>
                  set("instructions", { ...settings.instructions, [l]: e.target.value })
                }
                placeholder={
                  l === "en"
                    ? "e.g. Mention that I'm available to start within 2 weeks."
                    : "مثلاً: اذكر إني متاح أبلش خلال أسبوعين."
                }
                className={input}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title={L(locale, "Suggested questions", "الأسئلة المقترحة")}
        description={L(
          locale,
          "Shown to visitors before they type. One per line; leave empty for the defaults.",
          "بتظهر للزوار قبل ما يكتبوا. سؤال بكل سطر، واتركها فاضية للافتراضي.",
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {(["en", "ar"] as const).map((l) => (
            <textarea
              key={l}
              dir={l === "ar" ? "rtl" : "ltr"}
              rows={5}
              value={settings.quickQuestions[l].join("\n")}
              onChange={(e) =>
                set("quickQuestions", { ...settings.quickQuestions, [l]: lines(e.target.value) })
              }
              className={input}
            />
          ))}
        </div>
      </Panel>

      <Panel
        title={L(locale, "Models & behaviour", "النماذج والسلوك")}
        description={L(
          locale,
          "Models are tried in order; the next one takes over if one is busy or out of quota.",
          "النماذج بتنجرب بالترتيب؛ إذا واحد مشغول أو خلصت حصته بيستلم اللي بعده.",
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {L(locale, "Assistant models", "نماذج المساعد")}
            </label>
            <textarea
              dir="ltr"
              rows={3}
              value={settings.agentModels.join("\n")}
              onChange={(e) => set("agentModels", lines(e.target.value))}
              className={`${input} font-mono text-xs`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {L(locale, "Fast helper models", "نماذج مساعدة سريعة")}
            </label>
            <textarea
              dir="ltr"
              rows={3}
              value={settings.fastModels.join("\n")}
              onChange={(e) => set("fastModels", lines(e.target.value))}
              className={`${input} font-mono text-xs`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {L(locale, "Thinking depth", "عمق التفكير")}
            </label>
            <select
              value={settings.thinking}
              onChange={(e) => set("thinking", e.target.value as AiSettings["thinking"])}
              className={input}
            >
              <option value="minimal">minimal ({L(locale, "fastest", "الأسرع")})</option>
              <option value="low">low ({L(locale, "balanced", "متوازن")})</option>
              <option value="medium">medium</option>
              <option value="high">high ({L(locale, "slowest", "الأبطأ")})</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {L(locale, "Creativity", "الإبداع")}: {settings.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min={0}
              max={1.2}
              step={0.1}
              value={settings.temperature}
              onChange={(e) => set("temperature", Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-white/10">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {L(locale, "AI reranking of search results", "إعادة ترتيب النتائج بالذكاء")}
            </span>
            <input
              type="checkbox"
              checked={settings.rerank}
              onChange={(e) => set("rerank", e.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-white/10">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {L(locale, "Keep a log of questions", "حفظ سجل الأسئلة")}
            </span>
            <input
              type="checkbox"
              checked={settings.logConversations}
              onChange={(e) => set("logConversations", e.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
          </label>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {message ? (
          <p
            className={
              message.ok
                ? "text-sm font-medium text-emerald-600"
                : "text-sm font-medium text-rose-600"
            }
          >
            {message.text}
          </p>
        ) : null}
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {strings.save}
        </button>
      </div>
    </div>
  );
}
