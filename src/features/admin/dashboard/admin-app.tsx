"use client";

import Link from "next/link";
import { m } from "motion/react";
import {
  BookOpenText,
  Bot,
  ExternalLink,
  LayoutGrid,
  LogOut,
  MessagesSquare,
  PanelsTopLeft,
} from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { authClient } from "@/lib/security/auth-client";
import { cn } from "@/lib/utils";
import { Monogram } from "@/ui/icons";
import { adminStrings } from "../strings";
import { OverviewTab } from "./overview-tab";
import { ContentTab } from "./content-tab";
import { KnowledgeTab } from "./knowledge-tab";
import { AssistantTab } from "./assistant-tab";
import { ConversationsTab } from "./conversations-tab";

export const L = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

const TAB_IDS = ["overview", "content", "knowledge", "assistant", "conversations"] as const;
type TabId = (typeof TAB_IDS)[number];

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

export function AdminApp() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const router = useRouter();
  // The active tab lives in the URL hash, so it survives reloads and can be linked to.
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => "",
  );
  const tab: TabId = (TAB_IDS as readonly string[]).includes(hash) ? (hash as TabId) : "overview";

  useEffect(() => {
    // Visiting the dashboard means the owner is signed in: make sure the site editor loads too.
    void fetch("/api/admin/session", { cache: "no-store" });
  }, []);

  const select = (id: TabId) => {
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  const tabs: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: L(locale, "Overview", "نظرة عامة"), icon: LayoutGrid },
    { id: "content", label: L(locale, "Content", "المحتوى"), icon: PanelsTopLeft },
    {
      id: "knowledge",
      label: L(locale, "Knowledge & CV", "المعرفة والسيرة الذاتية"),
      icon: BookOpenText,
    },
    { id: "assistant", label: L(locale, "AI assistant", "المساعد الذكي"), icon: Bot },
    { id: "conversations", label: L(locale, "Conversations", "المحادثات"), icon: MessagesSquare },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
      <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-64 lg:shrink-0">
        <div className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#0B1728]">
          <div className="flex items-center gap-3 px-1">
            <Monogram className="h-9 w-9" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {L(locale, "Portfolio admin", "إدارة الموقع")}
              </p>
              <p className="text-[11px] text-slate-500">
                {L(
                  locale,
                  "Everything here updates the site and the AI",
                  "كل تعديل هون بيحدّث الموقع والمساعد",
                )}
              </p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(item.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition-colors",
                    active
                      ? "text-indigo-700 dark:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-white",
                  )}
                >
                  {active ? (
                    <m.span
                      layoutId="admin-tab"
                      className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/15"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <Icon className="relative h-4 w-4" aria-hidden="true" />
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </nav>
          {/* Shown on every screen size (it was desktop-only, leaving phones without sign-out). */}
          <div className="mt-auto flex gap-1 border-t border-slate-100 pt-3 lg:block lg:space-y-1 lg:border-0 lg:pt-0 dark:border-white/[0.06]">
            <Link
              href={`/${locale}`}
              className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {strings.viewSite}
            </Link>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                await fetch("/api/admin/session", { method: "DELETE" });
                router.push(`/${locale}`);
                router.refresh();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {strings.signOut}
            </button>
          </div>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 flex-1">
        <m.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "overview" ? <OverviewTab onNavigate={select} /> : null}
          {tab === "content" ? <ContentTab /> : null}
          {tab === "knowledge" ? <KnowledgeTab /> : null}
          {tab === "assistant" ? <AssistantTab /> : null}
          {tab === "conversations" ? <ConversationsTab /> : null}
        </m.div>
      </main>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/[0.06] dark:bg-[#0B1728]",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
