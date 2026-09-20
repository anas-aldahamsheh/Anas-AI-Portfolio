"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 shadow-xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
        {/* Cover Media or Graceful Abstract Fallback */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {project.coverImageUrl && !imageFailed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.coverImageUrl}
              alt={project.title}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-200/50 to-neutral-300/30 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900/50">
              <div className="dark:bg-neutral-850 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200/60 bg-white/80 text-neutral-600 shadow-xs backdrop-blur-xs dark:border-neutral-700/60 dark:text-neutral-300">
                <Layers className="h-7 w-7 opacity-80" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute start-3 top-3 flex flex-wrap items-center gap-1.5">
            {project.isFeatured && (
              <Badge variant="default" size="sm" className="shadow-xs">
                {featuredLabel}
              </Badge>
            )}
            {project.categories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                size="sm"
                className="bg-white/90 backdrop-blur-xs dark:bg-neutral-900/90"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-5">
          <Link href={deepDiveHref} className="group/link focus:outline-none">
            <h3 className="line-clamp-2 text-base font-bold text-neutral-900 transition-colors group-hover/link:text-neutral-600 dark:text-neutral-100 dark:group-hover/link:text-neutral-300">
              {project.title}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {project.summary}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                size="sm"
                className="border-neutral-200/60 bg-neutral-50/50 font-mono text-[10px] dark:border-neutral-800 dark:bg-neutral-900/50"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex-1" />

          {/* Action Links */}
          <div className="dark:border-neutral-850 mt-5 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-1.5">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${sourceCodeLabel}: ${project.title}`}
                  className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
                  className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <Link href={deepDiveHref}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <span>{viewLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </EditableRegion>
  );
}
