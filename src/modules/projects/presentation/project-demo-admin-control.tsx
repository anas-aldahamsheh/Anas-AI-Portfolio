"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings2,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminEdit } from "@/modules/admin/presentation";

export interface ProjectDemoAdminControlProps {
  projectId: string;
  projectSlug: string;
  projectTitle: string;
  initialIsEnabled: boolean;
  initialDemoUrl?: string | null | undefined;
  locale?: string | undefined;
  onDemoChange?: ((isEnabled: boolean, demoUrl: string) => void) | undefined;
}

export function ProjectDemoAdminControl({
  projectId,
  projectSlug,
  projectTitle,
  initialIsEnabled,
  initialDemoUrl = "",
  locale = "en",
  onDemoChange,
}: ProjectDemoAdminControlProps) {
  const router = useRouter();
  const { isAdmin } = useAdminEdit();

  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [demoUrl, setDemoUrl] = useState(initialDemoUrl ?? "");
  const [savedState, setSavedState] = useState({
    isEnabled: initialIsEnabled,
    demoUrl: initialDemoUrl ?? "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isArabic = locale === "ar";

  // Sync state if props change
  useEffect(() => {
    setIsEnabled(initialIsEnabled);
    setDemoUrl(initialDemoUrl ?? "");
    setSavedState({
      isEnabled: initialIsEnabled,
      demoUrl: initialDemoUrl ?? "",
    });
  }, [initialIsEnabled, initialDemoUrl]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isAdmin) {
    return null;
  }

  const handleOpen = () => {
    setIsEnabled(savedState.isEnabled);
    setDemoUrl(savedState.demoUrl);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetUrl = demoUrl.trim();

    // If enabled, validate URL format
    if (isEnabled && targetUrl) {
      try {
        new URL(targetUrl);
      } catch {
        setErrorMessage(
          isArabic
            ? "يرجى إدخال رابط صالح يبدأ بـ https:// أو http://"
            : "Please enter a valid URL starting with https:// or http://",
        );
        setIsSaving(false);
        return;
      }
    }

    try {
      // Use slug as identifier (fallback to projectId)
      const identifier = projectSlug || projectId;
      const res = await fetch(`/api/admin/projects/${encodeURIComponent(identifier)}/demo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          demoUrl: targetUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update project demo settings");
      }

      setSavedState({
        isEnabled: data.isEnabled,
        demoUrl: data.demoUrl,
      });

      onDemoChange?.(data.isEnabled, data.demoUrl);
      setSuccessMessage(
        isArabic ? "تم حفظ إعدادات العرض المباشر بنجاح!" : "Live demo settings saved successfully!",
      );

      // Refresh server components
      router.refresh();

      // Close modal after brief success confirmation
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to persist project demo configuration",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Admin Trigger Button */}
      {savedState.isEnabled ? (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-xs transition-colors hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          title={
            isArabic
              ? "مسؤول: تعديل أو إيقاف الـ Live Demo"
              : "Admin: Manage or toggle Live Demo"
          }
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>{isArabic ? "اللايف ديمو: مفعّل" : "Live Demo: ON"}</span>
          <Settings2 className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 shadow-xs transition-colors hover:bg-amber-500/20 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
          title={
            isArabic
              ? "مسؤول: الـ Live Demo معطّل ومخفي عن الزوار — اضغط لتفعيله"
              : "Admin: Live Demo is disabled and hidden from visitors — Click to enable"
          }
        >
          <EyeOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>{isArabic ? "اللايف ديمو: معطّل (مخفي)" : "Live Demo: Hidden"}</span>
          <Settings2 className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
        </button>
      )}

      {/* Settings Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-control-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="border-border bg-card text-card-foreground animate-in fade-in-0 zoom-in-95 relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h2 id="demo-control-title" className="text-base font-bold tracking-tight">
                    {isArabic ? "إدارة كبسة Live Demo للمشروع" : "Manage Live Demo for Project"}
                  </h2>
                  <Badge variant="secondary" size="sm" className="text-[10px] font-bold">
                    ADMIN
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs font-medium">
                  {projectTitle} ({projectSlug})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                aria-label={isArabic ? "إغلاق" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="space-y-5 pt-4">
              {/* Informational description */}
              <p className="text-muted-foreground bg-muted/40 rounded-lg p-3 text-xs leading-relaxed">
                {isArabic
                  ? "يمكنك تشغيل أو إيقاف كبسة الـ Live Demo لهذا المشروع بشكل مستقل تماماً. إذا تم إيقافها، فلن تظهر الكبسة إطلاقاً لزوار الموقع."
                  : "Independently toggle the Live Demo button for this project. If turned OFF, the button is completely hidden from public visitors."}
              </p>

              {/* Toggle Switch */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {isArabic ? "حالة كبسة العرض المباشر" : "Live Demo Button"}
                    </span>
                    {isEnabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <Eye className="h-3 w-3" />
                        {isArabic ? "ظاهرة للزوار" : "Visible"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        <EyeOff className="h-3 w-3" />
                        {isArabic ? "مخفية عن الزوار" : "Hidden"}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {isEnabled
                      ? isArabic
                        ? "الكبسة تظهر لجميع الزوار وتنقلهم إلى رابط الديمو."
                        : "Button appears on project deep dive and project cards."
                      : isArabic
                        ? "الكبسة مخفية ولن تظهر لأي زائر عادي في الموقع."
                        : "Button is completely hidden from public view."}
                  </p>
                </div>

                {/* Custom Accessible Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isEnabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="demo-url-input" className="text-xs font-semibold">
                    {isArabic ? "رابط العرض المباشر (Live Demo URL)" : "Live Demo Target URL"}
                  </label>
                  {demoUrl.trim() && (
                    <a
                      href={demoUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 transition-colors"
                    >
                      <span>{isArabic ? "تجربة الرابط" : "Test Link"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  id="demo-url-input"
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://your-demo-url.example.com"
                  className="border-input bg-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 font-mono text-xs shadow-xs focus:ring-2 focus:outline-none"
                />
                <p className="text-muted-foreground text-[11px]">
                  {isArabic
                    ? "الرابط الذي سيتم توجيه المستخدم إليه عند الضغط على كبسة Live Demo."
                    : "The destination URL when visitors click the Live Demo button."}
                </p>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving}
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="min-w-[100px] gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{isArabic ? "جارٍ الحفظ..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{isArabic ? "حفظ التعديلات" : "Save Changes"}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
