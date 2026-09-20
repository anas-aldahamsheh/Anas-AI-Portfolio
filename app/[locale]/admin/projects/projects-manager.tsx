"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/modules/projects/domain/types";

export interface ProjectsManagerProps {
  initialProjects: Project[];
  locale: string;
}

interface ProjectEditState {
  isEnabled: boolean;
  demoUrl: string;
  isSaving: boolean;
  savedSuccess: boolean;
  error: string | null;
}

export function ProjectsManager({ initialProjects, locale }: ProjectsManagerProps) {
  const isArabic = locale === "ar";

  const [editStates, setEditStates] = useState<Record<string, ProjectEditState>>(() => {
    const initial: Record<string, ProjectEditState> = {};
    for (const p of initialProjects) {
      initial[p.slug] = {
        isEnabled: p.isDemoEnabled ?? Boolean(p.demoUrl),
        demoUrl: p.demoUrl ?? "",
        isSaving: false,
        savedSuccess: false,
        error: null,
      };
    }
    return initial;
  });

  const handleToggle = (slug: string) => {
    setEditStates((prev) => {
      const current = prev[slug];
      if (!current) return prev;
      return {
        ...prev,
        [slug]: {
          ...current,
          isEnabled: !current.isEnabled,
          savedSuccess: false,
          error: null,
        },
      };
    });
  };

  const handleUrlChange = (slug: string, url: string) => {
    setEditStates((prev) => {
      const current = prev[slug];
      if (!current) return prev;
      return {
        ...prev,
        [slug]: {
          ...current,
          demoUrl: url,
          savedSuccess: false,
          error: null,
        },
      };
    });
  };

  const handleSave = async (slug: string) => {
    const current = editStates[slug];
    if (!current) return;

    // Validate URL if enabled and provided
    const targetUrl = current.demoUrl.trim();
    if (current.isEnabled && targetUrl) {
      try {
        new URL(targetUrl);
      } catch {
        setEditStates((prev) => ({
          ...prev,
          [slug]: {
            ...prev[slug]!,
            error: isArabic
              ? "يرجى إدخال رابط صالح يبدأ بـ https:// أو http://"
              : "Please enter a valid URL starting with https:// or http://",
          },
        }));
        return;
      }
    }

    setEditStates((prev) => ({
      ...prev,
      [slug]: { ...prev[slug]!, isSaving: true, error: null, savedSuccess: false },
    }));

    try {
      const res = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}/demo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled: current.isEnabled,
          demoUrl: targetUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update demo settings");
      }

      setEditStates((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug]!,
          isEnabled: data.isEnabled,
          demoUrl: data.demoUrl,
          isSaving: false,
          savedSuccess: true,
          error: null,
        },
      }));

      // Hide success mark after 3s
      setTimeout(() => {
        setEditStates((prev) => {
          const s = prev[slug];
          if (!s) return prev;
          return {
            ...prev,
            [slug]: { ...s, savedSuccess: false },
          };
        });
      }, 3000);
    } catch (err) {
      setEditStates((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug]!,
          isSaving: false,
          error: err instanceof Error ? err.message : "Failed to persist",
        },
      }));
    }
  };

  return (
    <div className="space-y-4">
      {initialProjects.map((project) => {
        const state = editStates[project.slug] || {
          isEnabled: Boolean(project.demoUrl),
          demoUrl: project.demoUrl ?? "",
          isSaving: false,
          savedSuccess: false,
          error: null,
        };

        const viewHref = `/${locale}/projects/${project.slug}`;

        return (
          <div
            key={project.id}
            className="border-border bg-card text-card-foreground hover:border-border/80 rounded-xl border p-5 shadow-xs transition-all"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Project Info */}
              <div className="space-y-1.5 lg:max-w-md">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight">{project.title}</h3>
                  {project.isFeatured && (
                    <Badge variant="default" size="sm" className="text-[10px]">
                      {isArabic ? "مميز" : "Featured"}
                    </Badge>
                  )}
                  {state.isEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <Eye className="h-3 w-3" />
                      {isArabic ? "العرض مفعل" : "Demo Active"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <EyeOff className="h-3 w-3" />
                      {isArabic ? "العرض مخفي" : "Demo Hidden"}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-1 text-xs">{project.summary}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="text-muted-foreground font-mono">/{project.slug}</span>
                  <span>•</span>
                  <Link
                    href={viewHref}
                    target="_blank"
                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1 underline underline-offset-4"
                  >
                    <span>{isArabic ? "عرض الصفحة" : "View Page"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                {/* Toggle switch */}
                <div className="flex items-center gap-2 sm:border-e sm:pe-4 dark:border-neutral-800">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {isArabic ? "تشغيل / إطفاء:" : "Toggle Demo:"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.isEnabled}
                    onClick={() => handleToggle(project.slug)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      state.isEnabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        state.isEnabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* URL Input */}
                <div className="flex flex-1 items-center gap-2 lg:max-w-md">
                  <input
                    type="url"
                    value={state.demoUrl}
                    onChange={(e) => handleUrlChange(project.slug, e.target.value)}
                    placeholder="https://demo.example.com"
                    className="border-input bg-background focus:ring-ring h-9 flex-1 rounded-lg border px-3 text-xs shadow-xs focus:ring-2 focus:outline-none"
                  />
                  {state.demoUrl.trim() && (
                    <a
                      href={state.demoUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={isArabic ? "فتح الرابط" : "Open URL"}
                      className="border-input text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={state.isSaving}
                    onClick={() => handleSave(project.slug)}
                    className="gap-1.5"
                  >
                    {state.isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="hidden sm:inline">
                          {isArabic ? "حفظ..." : "Saving..."}
                        </span>
                      </>
                    ) : state.savedSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="hidden sm:inline">{isArabic ? "تم!" : "Saved!"}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{isArabic ? "حفظ" : "Save"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {state.error && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-lg border p-2 text-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
