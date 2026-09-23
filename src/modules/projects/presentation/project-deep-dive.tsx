"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Bot,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Cpu,
  Code2,
  GitFork,
  Workflow,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EditableRegion } from "@/modules/admin/presentation";
import { SocialIcon } from "@/modules/social/presentation";
import type { Project } from "../domain/types";
import { ProjectCard } from "./project-card";
import { ProjectDemoAdminControl } from "./project-demo-admin-control";

export interface ProjectDeepDiveProps {
  project: Project;
  relatedProjects?: Project[];
  locale: string;
}

interface NarrativeSectionConfig {
  key: keyof Pick<
    Project,
    | "problem"
    | "constraints"
    | "solution"
    | "architecture"
    | "implementation"
    | "challenges"
    | "decisionsTradeoffs"
    | "results"
  >;
  i18nKey: string;
  defaultTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NARRATIVE_SECTIONS: NarrativeSectionConfig[] = [
  {
    key: "problem",
    i18nKey: "project.detail.problem",
    defaultTitle: "Problem & Context",
    icon: AlertCircle,
  },
  {
    key: "constraints",
    i18nKey: "project.detail.constraints",
    defaultTitle: "Engineering Constraints",
    icon: ShieldAlert,
  },
  {
    key: "solution",
    i18nKey: "project.detail.solution",
    defaultTitle: "Solution & Strategy",
    icon: Workflow,
  },
  {
    key: "architecture",
    i18nKey: "project.detail.architecture",
    defaultTitle: "System Architecture & Patterns",
    icon: Cpu,
  },
  {
    key: "implementation",
    i18nKey: "project.detail.implementation",
    defaultTitle: "Implementation Details",
    icon: Code2,
  },
  {
    key: "challenges",
    i18nKey: "project.detail.challenges",
    defaultTitle: "Key Challenges & Mitigations",
    icon: Flame,
  },
  {
    key: "decisionsTradeoffs",
    i18nKey: "project.detail.tradeoffs",
    defaultTitle: "Decisions & Trade-offs",
    icon: GitFork,
  },
  {
    key: "results",
    i18nKey: "project.detail.results",
    defaultTitle: "Impact & Measurable Results",
    icon: CheckCircle2,
  },
];

export function ProjectDeepDive({ project, relatedProjects = [], locale }: ProjectDeepDiveProps) {
  const { t } = useLocalization();
  const [imageFailed, setImageFailed] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(
    project.isDemoEnabled ?? Boolean(project.demoUrl),
  );
  const [currentDemoUrl, setCurrentDemoUrl] = useState<string>(project.demoUrl ?? "");

  // Localization labels
  const backLabel = t("project.detail.back_to_projects") || "Back to Projects";
  const featuredLabel = t("projects.card.featured_badge") || "Featured";
  const sourceCodeLabel = t("projects.card.source_code") || "Source Code";
  const liveDemoLabel = t("projects.card.live_demo") || "Live Demo";
  const techStackTitle = t("project.detail.tech_stack") || "Technologies & Tools";
  const askAiTitle = t("project.detail.ask_ai") || "Ask AI About This Project";
  const askAiDesc =
    t("project.detail.ask_ai_desc") ||
    "Ask verified architectural, code, or design questions grounded specifically in this project's evidence.";
  const askAiCta = t("project.detail.ask_ai_cta") || "Launch AI Project Query";
  const scopeBadgeText =
    t("project.detail.scope_badge") || "Scoped Retrieval: Project Evidence Only";
  const relatedProjectsTitle = t("project.detail.related_projects") || "Related Projects";

  const askAiHref = `/${locale}?chat=open&project=${project.slug}&projectId=${project.id}`;

  // Filter sections that have non-empty content
  const activeSections = NARRATIVE_SECTIONS.filter((sec) => {
    const val = project[sec.key];
    return typeof val === "string" && val.trim().length > 0;
  });

  const promptSuggestions =
    locale === "ar"
      ? [
          "ما هي أبرز المفاضلات والقرارات المعمارية في هذا النظام؟",
          "كيف تم التعامل مع قيود الأداء وزمن الاستجابة؟",
          "اشرح بنية تدفق البيانات وآليات الموثوقية.",
        ]
      : [
          "What architectural decisions and trade-offs were made?",
          "How were performance and latency constraints addressed?",
          "Explain the end-to-end data pipeline and reliability mechanisms.",
        ];

  const openProjectChat = (promptText?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-project-chat", {
          detail: {
            projectId: project.id,
            projectTitle: project.title,
            prompt: promptText,
          },
        }),
      );
    }
  };

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Back Link Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href={`/${locale}/projects`}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus:underline focus:outline-none dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
      </nav>

      {/* Hero Header */}
      <header className="space-y-6 border-b border-neutral-200/80 pb-8 dark:border-neutral-800/80">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {project.isFeatured && (
            <span className="rounded-full bg-[#173B6C] px-3 py-1 text-xs font-semibold text-white shadow-xs dark:bg-indigo-600">
              {featuredLabel}
            </span>
          )}
          {project.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300"
            >
              {cat}
            </span>
          ))}
          {project.status !== "PUBLISHED" && (
            <span className="rounded-full border border-amber-500/40 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400">
              {project.status}
            </span>
          )}
        </div>

        {/* Title and Summary wrapped in Admin EditableRegion */}
        <EditableRegion
          editableRef={{
            entityType: "project",
            entityId: project.id,
            fieldOrBlockId: "title",
            locale: locale === "ar" ? "ar" : "en",
            title: project.title,
            initialData: {
              title: project.title,
              summary: project.summary,
              status: project.status,
              isFeatured: project.isFeatured,
            },
          }}
        >
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#173B6C] sm:text-4xl lg:text-5xl dark:text-neutral-50">
              {project.title}
            </h1>
            <p className="text-lg leading-relaxed text-[#6C7893] sm:text-xl dark:text-[#9AA8C0]">
              {project.summary}
            </p>
          </div>
        </EditableRegion>

        {/* Actions & Links Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5EAF2] bg-white px-4 py-2 text-sm font-semibold text-[#173B6C] shadow-2xs transition-colors hover:bg-neutral-50 hover:border-[#D0E2FF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
              >
                <SocialIcon name="github" className="h-4 w-4" />
                <span>{sourceCodeLabel}</span>
              </a>
            )}
            {Boolean(isDemoActive && currentDemoUrl) && (
              <a
                href={currentDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5EAF2] bg-white px-4 py-2 text-sm font-semibold text-[#173B6C] shadow-2xs transition-colors hover:bg-neutral-50 hover:border-[#D0E2FF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>{liveDemoLabel}</span>
              </a>
            )}

            {/* Admin Live Demo toggle and URL controller */}
            <ProjectDemoAdminControl
              projectId={project.id}
              projectSlug={project.slug}
              projectTitle={project.title}
              initialIsEnabled={isDemoActive}
              initialDemoUrl={currentDemoUrl}
              locale={locale}
              onDemoChange={(enabled, newUrl) => {
                setIsDemoActive(enabled);
                setCurrentDemoUrl(newUrl);
              }}
            />
          </div>

          <Link
            href={askAiHref}
            onClick={(e) => {
              e.preventDefault();
              openProjectChat();
            }}
          >
            <Button variant="primary" size="sm" className="gap-2 shadow-xs">
              <Bot className="h-4 w-4" aria-hidden="true" />
              <span>{askAiCta}</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Cover Media Visual or Architectural Fallback */}
      <div className="my-8 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        {project.coverImageUrl && !imageFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.coverImageUrl}
            alt={project.title}
            onError={() => setImageFailed(true)}
            className="h-auto max-h-[460px] w-full object-cover"
          />
        ) : (
          <div className="dark:via-neutral-850 flex h-56 w-full items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-200/40 to-neutral-300/20 p-8 sm:h-72 dark:from-neutral-900 dark:to-neutral-900/60">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/90 text-neutral-700 shadow-sm backdrop-blur-xs dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-neutral-200">
                <Layers className="h-8 w-8 opacity-80" aria-hidden="true" />
              </div>
              <div className="font-mono text-xs tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {project.slug}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid: Narrative Blocks + Sidebar Info */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Main Narrative Column */}
        <div className="space-y-10 lg:col-span-8">
          {activeSections.map((sec) => {
            const SectionIcon = sec.icon;
            const heading = t(sec.i18nKey) || sec.defaultTitle;
            const content = project[sec.key];

            return (
              <EditableRegion
                key={sec.key}
                editableRef={{
                  entityType: "project",
                  entityId: project.id,
                  fieldOrBlockId: sec.key,
                  locale: locale === "ar" ? "ar" : "en",
                  title: `${project.title} - ${heading}`,
                  initialData: {
                    [sec.key]: content,
                  },
                }}
              >
                <section
                  id={`section-${sec.key}`}
                  className="rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#D0E2FF] hover:shadow-md sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                      <SectionIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
                      {heading}
                    </h2>
                  </div>

                  <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-[15px] leading-relaxed whitespace-pre-line text-[#6C7893] dark:text-[#9AA8C0]">
                    {content}
                  </div>
                </section>
              </EditableRegion>
            );
          })}
        </div>

        {/* Sidebar Column: Tech Stack & Scoped AI Query Callout */}
        <aside className="space-y-8 lg:col-span-4">
          {/* Tech Stack & Tags */}
          {project.tags.length > 0 && (
            <div className="rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-xs backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.02]">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-[#173B6C] uppercase dark:text-indigo-300">
                {techStackTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#E5EAF2] bg-[#F8FAFF] px-3 py-1 font-mono text-xs font-medium text-[#173B6C] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ask AI Scoped Callout Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E5EAF2] bg-gradient-to-b from-[#F8FAFF] to-white p-6 shadow-xs dark:border-white/[0.08] dark:from-white/[0.03] dark:to-white/[0.01]">
            {/* Scope Badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
              <Sparkles
                className="h-3.5 w-3.5 text-[#2F6FED] dark:text-indigo-300"
                aria-hidden="true"
              />
              <span>{scopeBadgeText}</span>
            </div>

            <h3 className="text-lg font-bold text-[#173B6C] dark:text-[#F4F7FF]">
              {askAiTitle}
            </h3>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6C7893] dark:text-[#9AA8C0]">
              {askAiDesc}
            </p>

            {/* Prompt Concept Suggestions */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-semibold tracking-wide text-[#173B6C]/70 uppercase dark:text-indigo-300/70">
                {locale === "ar" ? "أسئلة مقترحة:" : "Suggested Questions:"}
              </span>
              <div className="space-y-1.5">
                {promptSuggestions.map((prompt) => (
                  <Link
                    key={prompt}
                    href={`${askAiHref}&prompt=${encodeURIComponent(prompt)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      openProjectChat(prompt);
                    }}
                    className="block rounded-xl border border-[#E5EAF2] bg-white/90 p-2.5 text-xs text-[#173B6C] transition-all hover:border-[#D0E2FF] hover:bg-[#EEF5FF]/50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-indigo-500/30"
                  >
                    &ldquo;{prompt}&rdquo;
                  </Link>
                ))}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-5">
              <Link
                href={askAiHref}
                onClick={(e) => {
                  e.preventDefault();
                  openProjectChat();
                }}
                className="w-full"
              >
                <button
                  type="button"
                  className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#173B6C] text-white hover:bg-[#1E4B8A] shadow-xs hover:shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  <span>{askAiCta}</span>
                </button>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Projects Section */}
      {relatedProjects.length > 0 && (
        <section
          aria-labelledby="related-projects-heading"
          className="mt-16 border-t border-neutral-200/80 pt-10 dark:border-neutral-800/80"
        >
          <h2
            id="related-projects-heading"
            className="mb-8 text-2xl font-bold tracking-tight text-[#173B6C] dark:text-neutral-100"
          >
            {relatedProjectsTitle}
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {relatedProjects.map((rel) => (
              <ProjectCard key={rel.id} project={rel} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
