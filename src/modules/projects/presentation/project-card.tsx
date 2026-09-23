"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowRight, Layers } from "lucide-react";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EditableRegion } from "@/modules/admin/presentation";
import { SocialIcon } from "@/modules/social/presentation";
import type { Project } from "../domain/types";

export interface ProjectCardProps {
  project: Project;
  locale: string;
}

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const { t } = useLocalization();
  const [imageFailed, setImageFailed] = useState(false);

  const viewLabel = t("projects.card.view_project") || "View Deep Dive";
  const sourceCodeLabel = t("projects.card.source_code") || "Source Code";
  const liveDemoLabel = t("projects.card.live_demo") || "Live Demo";
  const featuredLabel = t("projects.card.featured_badge") || "Featured";

  const deepDiveHref = `/${locale}/projects/${project.slug}`;

  return (
    <EditableRegion
      editableRef={{
        entityType: "project",
        entityId: project.id,
        fieldOrBlockId: "summary",
        locale: locale === "ar" ? "ar" : "en",
        title: project.title,
        initialData: {
          title: project.title,
          summary: project.summary,
          status: project.status,
          isFeatured: project.isFeatured,
        },
      }}
      className="h-full"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/85 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D0E2FF] hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]">
        {/* Cover Media or Graceful Abstract Fallback */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#07101F]">
          {project.coverImageUrl && !imageFailed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.coverImageUrl}
              alt={project.title}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EBF6FE] via-white to-[#F3EEFE] dark:from-[#0B1728] dark:via-[#07101F] dark:to-[#150E2A]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-xs backdrop-blur-xs dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                <Layers className="h-7 w-7 opacity-90" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute start-3 top-3 flex flex-wrap items-center gap-1.5">
            {project.isFeatured && (
              <span className="rounded-full bg-[#173B6C] px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs dark:bg-indigo-600">
                {featuredLabel}
              </span>
            )}
            {project.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF]/95 px-2.5 py-0.5 text-xs font-medium text-[#2F6FED] backdrop-blur-xs dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-5 sm:p-6 text-start">
          <Link href={deepDiveHref} className="group/link focus:outline-none">
            <h3 className="line-clamp-2 text-base sm:text-lg font-bold text-[#173B6C] transition-colors group-hover/link:text-[#2F6FED] dark:text-[#F4F7FF] dark:group-hover/link:text-indigo-300">
              {project.title}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-relaxed text-[#6C7893] dark:text-[#9AA8C0]">
            {project.summary}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#E5EAF2] bg-[#F8FAFF] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#173B6C] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex-1" />

          {/* Action Links */}
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#E5EAF2] pt-4 dark:border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${sourceCodeLabel}: ${project.title}`}
                  className="rounded-lg p-2 text-[#6C7893] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.08] dark:hover:text-[#F4F7FF]"
                >
                  <SocialIcon name="github" className="h-4 w-4" />
                </a>
              )}
              {project.demoUrl && project.isDemoEnabled !== false && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${liveDemoLabel}: ${project.title}`}
                  className="rounded-lg p-2 text-[#6C7893] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.08] dark:hover:text-[#F4F7FF]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <Link href={deepDiveHref}>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#2F6FED] transition-colors hover:bg-[#EEF5FF] dark:text-indigo-300 dark:hover:bg-white/[0.06]">
                <span>{viewLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </EditableRegion>
  );
}
