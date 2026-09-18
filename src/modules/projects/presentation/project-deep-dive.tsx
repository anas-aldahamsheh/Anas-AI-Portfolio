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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EditableRegion } from "@/modules/admin/presentation";
import { SocialIcon } from "@/modules/social/presentation";
import type { Project } from "../domain/types";
import { ProjectCard } from "./project-card";

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

  const askAiHref = `/${locale}/chat?project=${project.slug}&projectId=${project.id}`;

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
            <Badge variant="default" size="sm" className="shadow-xs">
              {featuredLabel}
            </Badge>
          )}
          {project.categories.map((cat) => (
            <Badge key={cat} variant="secondary" size="sm">
              {cat}
            </Badge>
          ))}
          {project.status !== "PUBLISHED" && (
            <Badge
              variant="outline"
              size="sm"
              className="border-amber-500 text-amber-600 dark:text-amber-400"
            >
              {project.status}
            </Badge>
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
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-50">
              {project.title}
            </h1>
            <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl dark:text-neutral-300">
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
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-950 focus:ring-2 focus:ring-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <SocialIcon name="github" className="h-4 w-4" />
                <span>{sourceCodeLabel}</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-950 focus:ring-2 focus:ring-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>{liveDemoLabel}</span>
              </a>
            )}
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
                  className="rounded-xl border border-neutral-200/70 bg-white/60 p-6 shadow-2xs backdrop-blur-xs transition-colors hover:border-neutral-300 sm:p-7 dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      <SectionIcon className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                      {heading}
                    </h2>
                  </div>

                  <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-neutral-700 sm:text-base dark:text-neutral-300">
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
            <div className="rounded-xl border border-neutral-200/80 bg-white/70 p-6 shadow-2xs backdrop-blur-xs dark:border-neutral-800/80 dark:bg-neutral-900/60">
              <h3 className="mb-3 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {techStackTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="border-neutral-200 bg-neutral-50 font-mono text-xs dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ask AI Scoped Callout Card */}
          <div className="relative overflow-hidden rounded-xl border border-neutral-200/90 bg-gradient-to-b from-neutral-50 to-white p-6 shadow-xs dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
            {/* Scope Badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/90 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-300">
              <Sparkles
                className="h-3 w-3 text-neutral-500 dark:text-neutral-400"
                aria-hidden="true"
              />
              <span>{scopeBadgeText}</span>
            </div>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {askAiTitle}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              {askAiDesc}
            </p>

            {/* Prompt Concept Suggestions */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
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
                    className="block rounded-md border border-neutral-200/70 bg-white/80 p-2 text-xs text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
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
                <Button variant="primary" size="sm" className="w-full gap-2">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  <span>{askAiCta}</span>
                </Button>
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
            className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
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
