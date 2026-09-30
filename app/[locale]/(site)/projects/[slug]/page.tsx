import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Compass,
  ExternalLink,
  Flag,
  Lightbulb,
  Mountain,
  Rocket,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { LOCALES, toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages";
import { getEntry, listEntries } from "@/server/content/repository";
import { formatPeriod } from "@/server/content/knowledge-sources";
import { AuroraBackdrop } from "@/ui/page-hero";
import { Reveal, SplitText } from "@/ui/motion/reveal";
import { Card, Container, TechChips } from "@/ui/primitives";
import { entryProps, fieldProps } from "@/ui/editable";
import { GithubIcon } from "@/ui/icons";
import { MediaImage } from "@/ui/media-image";
import { AskButton } from "@/features/assistant/ask-button";

export async function generateStaticParams() {
  const all = await Promise.all(LOCALES.map((locale) => listEntries("project", locale)));
  const slugs = [...new Set(all.flat().map((p) => p.slug))];
  // At least one param per locale so the route always has a static shell.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const project = await getEntry("project", slug, locale);
  if (!project) return {};
  return {
    title: project.t.title,
    description: project.t.summary,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { en: `/en/projects/${slug}`, ar: `/ar/projects/${slug}` },
    },
    openGraph: { title: project.t.title, description: project.t.summary, type: "article" },
  };
}

const SECTIONS: {
  field: "role" | "problem" | "solution" | "architecture" | "challenges" | "decisions" | "results";
  key: MessageKey;
  icon: LucideIcon;
}[] = [
  { field: "role", key: "project.role", icon: UserRound },
  { field: "problem", key: "project.problem", icon: Target },
  { field: "solution", key: "project.solution", icon: Rocket },
  { field: "architecture", key: "project.architecture", icon: Boxes },
  { field: "challenges", key: "project.challenges", icon: Mountain },
  { field: "decisions", key: "project.decisions", icon: Compass },
  { field: "results", key: "project.results", icon: Flag },
];

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const [{ t, tx }, project, all] = await Promise.all([
    getTranslator(locale),
    getEntry("project", slug, locale),
    listEntries("project", locale),
  ]);
  if (!project) notFound();

  const index = all.findIndex((p) => p.id === project.id);
  const previous = index > 0 ? all[index - 1] : undefined;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;
  const period = formatPeriod(locale, project.data.startDate, project.data.endDate);
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;
  const Forward = locale === "ar" ? ArrowLeft : ArrowRight;
  const sections = SECTIONS.filter((s) => project.t[s.field]);

  return (
    <article className="w-full" {...entryProps(project, project.t.title)}>
      <header className="grain relative w-full overflow-hidden border-b border-[#E5EAF2] bg-white dark:border-white/[0.08] dark:bg-[#07101F]">
        <AuroraBackdrop />
        <Container className="relative z-10 py-10 sm:py-14">
          <Link
            href={`/${locale}/projects`}
            className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#637089] transition-colors hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:text-white"
          >
            <Back
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
              aria-hidden="true"
            />
            {tx("project.back")}
          </Link>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2" data-reveal="fade">
                {project.data.category ? (
                  <span className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                    {project.data.category}
                  </span>
                ) : null}
                {period ? (
                  <span className="text-xs font-medium text-[#637089] dark:text-[#9AA8C0]">
                    {period}
                  </span>
                ) : null}
              </div>
              <h1
                className="font-display text-3xl leading-[1.15] font-bold tracking-tight text-[#173B6C] sm:text-4xl md:text-5xl dark:text-[#F4F7FF]"
                {...fieldProps(project, "title")}
              >
                <SplitText text={project.t.title} baseDelay={60} />
              </h1>
              <p
                data-reveal="blur"
                style={{ ["--reveal-delay" as string]: "240ms" }}
                className="font-ui max-w-2xl text-base leading-relaxed text-[#637089] sm:text-lg dark:text-[#9AA8C0]"
                {...fieldProps(project, "summary")}
              >
                {project.t.summary}
              </p>
              <div
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: "360ms" }}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                {project.data.demoUrl ? (
                  <a
                    href={project.data.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-primary"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {tx("projects.demo")}
                  </a>
                ) : null}
                {project.data.repoUrl ? (
                  <a
                    href={project.data.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-secondary"
                  >
                    <GithubIcon className="h-4 w-4" />
                    {tx("projects.code")}
                  </a>
                ) : null}
                <AskButton
                  variant={project.data.demoUrl ? "secondary" : "primary"}
                  prompt={
                    locale === "ar"
                      ? `احكيلي عن مشروع "${project.t.title}": شو المشكلة وشو بنى أنس وشو النتيجة؟`
                      : `Tell me about the "${project.t.title}" project: the problem, what Anas built, and the result.`
                  }
                >
                  {t("project.ask")}
                </AskButton>
              </div>
            </div>
            <div data-reveal="scale" style={{ ["--reveal-delay" as string]: "200ms" }}>
              <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
                <div
                  className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#E5EAF2] bg-neutral-100 shadow-[0_30px_80px_-40px_rgba(23,59,108,0.55)] dark:border-white/[0.08] dark:bg-[#0B1728]"
                  {...fieldProps(project, "cover")}
                >
                  {project.data.cover ? (
                    <MediaImage
                      src={project.data.cover}
                      alt={project.t.title}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#EBF6FE] via-white to-[#F3EEFE] dark:from-[#0B1728] dark:via-[#07101F] dark:to-[#150E2A]" />
                  )}
                </div>
              </ViewTransition>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.field} delay={Math.min(i, 3) * 60}>
                  <Card as="section" className="group p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300"
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 space-y-2">
                        <h2 className="text-base font-bold text-[#173B6C] sm:text-lg dark:text-[#F4F7FF]">
                          {tx(section.key)}
                        </h2>
                        <div
                          className="space-y-3 text-sm leading-7 text-[#637089] dark:text-[#9AA8C0]"
                          {...fieldProps(project, section.field)}
                        >
                          {project.t[section.field].split(/\n{2,}/).map((paragraph, p) => (
                            <p key={p}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
            {project.t.highlights.length ? (
              <Reveal>
                <Card as="section" className="p-6 sm:p-7">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#173B6C] sm:text-lg dark:text-[#F4F7FF]">
                    <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    {tx("project.highlights")}
                  </h2>
                  <ul className="space-y-2.5 text-sm" {...fieldProps(project, "highlights")}>
                    {project.t.highlights.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[#637089] dark:text-[#9AA8C0]"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6FED] dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Reveal variant="end">
              <Card className="space-y-4 p-6">
                <h2 className="text-xs font-bold tracking-wider text-[#173B6C] uppercase dark:text-[#F4F7FF]">
                  {tx("project.stack")}
                </h2>
                <div {...fieldProps(project, "tags")}>
                  <TechChips items={project.data.tags} />
                </div>
                {period ? (
                  <div className="border-t border-[#E5EAF2] pt-4 text-sm dark:border-white/[0.08]">
                    <p className="text-xs font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                      {t("project.period")}
                    </p>
                    <p className="mt-1 font-medium text-[#173B6C] dark:text-[#E2E8F0]">{period}</p>
                  </div>
                ) : null}
              </Card>
            </Reveal>
            {previous || next ? (
              <Reveal variant="end" delay={100}>
                <nav className="grid gap-3" aria-label={t("nav.projects")}>
                  {next ? (
                    <Link
                      href={`/${locale}/projects/${next.slug}`}
                      className="group rounded-2xl border border-[#E5EAF2] bg-white/85 p-4 transition-all hover:border-[#D0E2FF] hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
                    >
                      <p className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                        {t("project.next")}
                        <Forward
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                          aria-hidden="true"
                        />
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#173B6C] dark:text-[#F4F7FF]">
                        {next.t.title}
                      </p>
                    </Link>
                  ) : null}
                  {previous ? (
                    <Link
                      href={`/${locale}/projects/${previous.slug}`}
                      className="group rounded-2xl border border-[#E5EAF2] bg-white/60 p-4 transition-all hover:border-[#D0E2FF] dark:border-white/[0.08] dark:bg-white/[0.015]"
                    >
                      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                        <Back
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                        {t("project.prev")}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#173B6C] dark:text-[#F4F7FF]">
                        {previous.t.title}
                      </p>
                    </Link>
                  ) : null}
                </nav>
              </Reveal>
            ) : null}
          </aside>
        </div>
      </Container>
    </article>
  );
}
