"use client";

import { useState, useMemo } from "react";
import { FolderGit2, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import type { Project, ProjectCategory, ProjectTag } from "../domain/types";
import { ProjectCard } from "./project-card";
import { ProjectFilters } from "./project-filters";

export interface ProjectCatalogProps {
  initialProjects: Project[];
  categories: ProjectCategory[];
  tags: ProjectTag[];
  locale: string;
}

export function ProjectCatalog({ initialProjects, categories, tags, locale }: ProjectCatalogProps) {
  const { t } = useLocalization();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"order" | "latest" | "title">("order");

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedTag("all");
    setFeaturedOnly(false);
    setSortBy("order");
  };

  const filteredProjects = useMemo(() => {
    let result = [...initialProjects];

    // Featured only
    if (featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    // Category
    if (selectedCategory !== "all") {
      const target = selectedCategory.toLowerCase();
      result = result.filter((p) =>
        p.categories.some(
          (c) => c.toLowerCase() === target || c.toLowerCase().replace(/\s+/g, "-") === target,
        ),
      );
    }

    // Tag
    if (selectedTag !== "all") {
      const target = selectedTag.toLowerCase();
      result = result.filter((p) =>
        p.tags.some(
          (t) => t.toLowerCase() === target || t.toLowerCase().replace(/\s+/g, "-") === target,
        ),
      );
    }

    // Search query
    if (search.trim() !== "") {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inSummary = p.summary.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const inCategories = p.categories.some((c) => c.toLowerCase().includes(q));
        return inTitle || inSummary || inTags || inCategories;
      });
    }

    // Sorting
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title, locale));
    } else {
      result.sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return result;
  }, [initialProjects, search, selectedCategory, selectedTag, featuredOnly, sortBy, locale]);

  const countText =
    t("projects.count", { count: filteredProjects.length }) ||
    `${filteredProjects.length} projects found`;
  const emptyTitle = t("projects.empty.title") || "No projects match your filter criteria";
  const emptyDescription =
    t("projects.empty.description") ||
    "Try adjusting your search keywords, domain, or technology tags.";
  const resetLabel = t("projects.empty.reset") || "Reset Filters";

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        featuredOnly={featuredOnly}
        onFeaturedToggle={setFeaturedOnly}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        tags={tags}
        onReset={resetFilters}
      />

      {/* Results Header / Live count */}
      <div className="flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <span aria-live="polite">{countText}</span>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <FadeIn>
          <EmptyState
            icon={<FolderGit2 className="h-6 w-6" aria-hidden="true" />}
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{resetLabel}</span>
              </Button>
            }
          />
        </FadeIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <StaggerItem key={project.id} className="h-full">
              <ProjectCard project={project} locale={locale} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
