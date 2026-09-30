"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { recentConversations } from "@/server/actions/admin";
import { L, Panel } from "./admin-app";

type Turn = {
  id: string;
  question: string;
  answer: string;
  tools: string[];
  model: string | null;
  latencyMs: number | null;
  error: string | null;
  createdAt: string;
};

export function ConversationsTab() {
  const { locale } = useI18n();
  const [turns, setTurns] = useState<Turn[] | null>(null);

  useEffect(() => {
    void recentConversations(100).then((r) => setTurns(r.ok ? r.data : []));
  }, []);

  return (
    <Panel
      title={L(locale, "What visitors asked", "شو سأل الزوار")}
      description={L(
        locale,
        "No names or IPs are stored, only the questions and answers.",
        "ما بنحفظ أسماء ولا عناوين IP، بس الأسئلة والأجوبة.",
      )}
    >
      {turns === null ? (
        <div className="flex justify-center py-10 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : turns.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          {L(locale, "No conversations yet.", "ما في محادثات لسا.")}
        </p>
      ) : (
        <ul className="space-y-3">
          {turns.map((turn) => (
            <li
              key={turn.id}
              className="rounded-2xl border border-slate-100 p-4 dark:border-white/5"
            >
              <details>
                <summary className="cursor-pointer list-none">
                  <p
                    className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                    dir="auto"
                  >
                    {turn.question}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    <span>
                      {new Date(turn.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                    </span>
                    {turn.latencyMs ? <span>{(turn.latencyMs / 1000).toFixed(1)}s</span> : null}
                    {turn.model ? <span className="font-mono">{turn.model}</span> : null}
                    {turn.tools.length ? (
                      <span className="font-mono">{turn.tools.join(", ")}</span>
                    ) : null}
                    {turn.error ? (
                      <span className="text-rose-500">{L(locale, "error", "خطأ")}</span>
                    ) : null}
                  </p>
                </summary>
                <p
                  className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-600 dark:bg-white/5 dark:text-slate-300"
                  dir="auto"
                >
                  {turn.answer || turn.error}
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
