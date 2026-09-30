"use client";

import { AnimatePresence, m } from "motion/react";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ProjectCard, type ProjectCardData, type ProjectCardLabels } from "./project-card";

/** Search + technology filter with animated re-layout (cards glide into their new places). */
export function ProjectCatalog({
  projects,
  locale,
  labels,
}: {
  projects: ProjectCardData[];
  locale: string;
  labels: ProjectCardLabels & { all: string; search: string; empty: string; count: string };
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects)
      for (const t of project.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([t]) => t);
  }, [projects]);

  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (tag && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return [p.title, p.summary, p.category, ...p.tags].join(" ").toLowerCase().includes(q);
    });
  }, [projects, deferredQuery, tag]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#637089]"
            aria-hidden="true"
          />
          <label htmlFor="project-search" className="sr-only">
            {labels.search}
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            className="h-11 w-full rounded-full border border-[#E5EAF2] bg-white/80 ps-10 pe-10 text-sm text-[#173B6C] shadow-2xs transition-all outline-none placeholder:text-[#637089]/70 focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#637089] hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        {tags.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={labels.all}>
            {[null, ...tags].map((value) => {
              const active = tag === value;
              return (
                <button
                  key={value ?? "all"}
                  type="button"
                  onClick={() => setTag(value)}
                  aria-pressed={active}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "text-white"
                      : "text-[#637089] hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:text-white",
                  )}
                >
                  {active ? (
                    <m.span
                      layoutId="project-filter"
                      className="absolute inset-0 rounded-full bg-[#173B6C] dark:bg-indigo-600"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{value ?? labels.all}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <p className="text-xs font-medium text-[#637089] dark:text-[#9AA8C0]" aria-live="polite">
        {visible.length} {labels.count}
      </p>

      {visible.length === 0 ? (
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-[#D0E2FF] px-6 py-14 text-center text-sm text-[#637089] dark:border-white/[0.1] dark:text-[#9AA8C0]"
        >
          {labels.empty}
        </m.p>
      ) : (
        <m.ul layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" data-edit-list="project">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <m.li
                key={project.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: Math.min(index, 8) * 0.04,
                }}
              >
                <ProjectCard project={project} locale={locale} labels={labels} />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      )}
    </div>
  );
}
