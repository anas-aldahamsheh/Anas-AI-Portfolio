"use client";

import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import type { ProjectCategory, ProjectTag } from "../domain/types";

export interface ProjectFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  featuredOnly: boolean;
  onFeaturedToggle: (featured: boolean) => void;
  sortBy: "order" | "latest" | "title";
  onSortChange: (sort: "order" | "latest" | "title") => void;
  categories: ProjectCategory[];
  tags: ProjectTag[];
  onReset: () => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  featuredOnly,
  onFeaturedToggle,
  sortBy,
  onSortChange,
  categories,
  tags,
  onReset,
}: ProjectFiltersProps) {
  const { t } = useLocalization();

  const searchPlaceholder =
    t("projects.search.placeholder") || "Search projects by keyword, tech, or topic...";
  const allCategoriesLabel = t("projects.filter.all_categories") || "All Domains";
  const allTagsLabel = t("projects.filter.all_tags") || "All Technologies";
  const featuredLabel = t("projects.filter.featured_only") || "Featured Only";
  const sortOrderLabel = t("projects.sort.order") || "Recommended Order";
  const sortLatestLabel = t("projects.sort.latest") || "Most Recent";
  const sortTitleLabel = t("projects.sort.title") || "Alphabetical";
  const resetLabel = t("projects.empty.reset") || "Reset Filters";

  const isFiltered =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedTag !== "all" ||
    featuredOnly ||
    sortBy !== "order";

  return (
    <div className="space-y-4 rounded-2xl border border-[#E5EAF2] bg-white/85 p-5 shadow-xs backdrop-blur-md sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
      {/* Search Input Row */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-neutral-400">
          <Search className="h-4 w-4" aria-hidden="true" />
        </div>
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="ps-9 pe-9 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search input"
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selectors and Toggles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category / Domain Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            {t("projects.filter.category_label") || "Domain"}
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger aria-label={t("projects.filter.category_label") || "Domain"}>
              <SelectValue placeholder={allCategoriesLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allCategoriesLabel}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Technology Tag Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            {t("projects.filter.tag_label") || "Technology"}
          </label>
          <Select value={selectedTag} onValueChange={onTagChange}>
            <SelectTrigger aria-label={t("projects.filter.tag_label") || "Technology"}>
              <SelectValue placeholder={allTagsLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allTagsLabel}</SelectItem>
              {tags.map((tg) => (
                <SelectItem key={tg.id} value={tg.name}>
                  {tg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            {t("projects.sort.label") || "Sort By"}
          </label>
          <Select
            value={sortBy}
            onValueChange={(val) => onSortChange(val as "order" | "latest" | "title")}
          >
            <SelectTrigger aria-label={t("projects.sort.label") || "Sort By"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">{sortOrderLabel}</SelectItem>
              <SelectItem value="latest">{sortLatestLabel}</SelectItem>
              <SelectItem value="title">{sortTitleLabel}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Filter and Reset Actions */}
        <div className="flex items-end justify-between gap-2 pt-1 sm:pt-0">
          <label className="dark:hover:bg-neutral-850 flex h-9 cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => onFeaturedToggle(e.target.checked)}
              className="h-3.5 w-3.5 rounded-xs border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:focus:ring-neutral-300"
            />
            <span>{featuredLabel}</span>
          </label>

          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 gap-1.5 px-3 text-xs text-neutral-600 dark:text-neutral-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{resetLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
