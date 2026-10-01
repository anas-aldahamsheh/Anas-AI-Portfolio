import Link from "next/link";
import { ArrowRight, ExternalLink, Layers } from "lucide-react";
import { ViewTransition } from "react";
import { GithubIcon } from "@/ui/icons";
import { MediaImage } from "@/ui/media-image";
import { TiltCard } from "@/ui/tilt-card";
import { cn } from "@/lib/utils";

export interface ProjectCardData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  cover: string;
  demoUrl: string;
  repoUrl: string;
  featured: boolean;
  category: string;
}

export interface ProjectCardLabels {
  caseStudy: string;
  demo: string;
  code: string;
  featured: string;
}

/** Project card; the cover morphs into the case-study hero on navigation (shared view transition). */
export function ProjectCard({
  project,
  locale,
  labels,
}: {
  project: ProjectCardData;
  locale: string;
  labels: ProjectCardLabels;
}) {
  const href = `/${locale}/projects/${project.slug}`;
  return (
    <TiltCard className="rounded-2xl">
      <article
        data-edit-entry={project.id}
        data-edit-collection="project"
        data-edit-label={project.title}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/90 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-[#D0E2FF] hover:shadow-[0_24px_50px_-28px_rgba(23,59,108,0.45)] dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
      >
        <Link
          href={href}
          className="relative block aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#07101F]"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
            <div className="relative h-full w-full">
              {project.cover ? (
                <MediaImage
                  src={project.cover}
                  alt=""
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EBF6FE] via-white to-[#F3EEFE] dark:from-[#0B1728] dark:via-[#07101F] dark:to-[#150E2A]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                    <Layers className="h-7 w-7" />
                  </span>
                </div>
              )}
            </div>
          </ViewTransition>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07101F]/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>
        <div className="absolute start-3 top-3 flex flex-wrap items-center gap-1.5">
          {project.featured ? (
            <span className="rounded-full bg-[#173B6C] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs dark:bg-indigo-600">
              {labels.featured}
            </span>
          ) : null}
          {project.category ? (
            <span className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF]/95 px-2.5 py-0.5 text-[11px] font-medium text-[#2F6FED] backdrop-blur-xs dark:border-white/[0.1] dark:bg-[#07101F]/70 dark:text-indigo-300">
              {project.category}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 text-start sm:p-6">
          <h3 className="line-clamp-2 text-base font-bold text-[#173B6C] sm:text-lg dark:text-[#F4F7FF]">
            <Link
              href={href}
              className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-[#2F6FED] dark:hover:text-indigo-300"
            >
              <span
                data-edit-field="title"
                data-edit-id={project.id}
                data-edit-collection="project"
              >
                {project.title}
              </span>
            </Link>
          </h3>
          <p
            className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#637089] dark:text-[#9AA8C0]"
            data-edit-field="summary"
            data-edit-id={project.id}
            data-edit-collection="project"
          >
            {project.summary}
          </p>
          <ul className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.tags.slice(0, 5).map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[#E5EAF2] bg-[#F8FAFF] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#173B6C] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="flex-1" />
          <div className="relative z-10 mt-5 flex items-center justify-between gap-2 border-t border-[#E5EAF2] pt-4 dark:border-white/[0.08]">
            <div className="flex items-center gap-1">
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${labels.code}: ${project.title}`}
                  className="rounded-lg p-2 text-[#637089] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.08] dark:hover:text-[#F4F7FF]"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
              ) : null}
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${labels.demo}: ${project.title}`}
                  className="rounded-lg p-2 text-[#637089] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.08] dark:hover:text-[#F4F7FF]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#2F6FED] transition-colors group-hover:bg-[#EEF5FF] dark:text-indigo-300 dark:group-hover:bg-white/[0.06]",
              )}
            >
              {labels.caseStudy}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
