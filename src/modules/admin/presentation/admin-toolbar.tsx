"use client";

import Link from "next/link";
import { Edit3, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminEdit } from "./admin-edit-provider";

export interface AdminToolbarProps {
  locale?: string | undefined;
}

export function AdminToolbar({ locale }: AdminToolbarProps) {
  const { isAdmin, isEditMode, toggleEditMode } = useAdminEdit();

  if (!isAdmin) {
    return null;
  }

  const adminHref = locale ? `/${locale}/admin` : "/admin";
  const isArabic = locale === "ar";

  return (
    <aside
      aria-label="Admin inline editing toolbar"
      className="fixed end-4 bottom-4 z-40 flex items-center gap-2 rounded-2xl border border-indigo-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-indigo-900/50 dark:bg-[#0B1528]/95"
    >
      <Badge variant="secondary" size="sm" className="hidden select-none sm:inline-flex font-mono">
        Admin
      </Badge>

      <Button
        variant={isEditMode ? "primary" : "outline"}
        size="sm"
        onClick={toggleEditMode}
        aria-pressed={isEditMode}
        className={cn(
          "gap-1.5 text-xs font-semibold tracking-tight transition-all",
          isEditMode
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40"
            : "hover:border-indigo-400 dark:hover:border-indigo-600"
        )}
      >
        {isEditMode ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isArabic ? "وضع التعديل نشط (Editing Active)" : "Editing Active"}</span>
          </>
        ) : (
          <>
            <Edit3 className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
            <span>{isArabic ? "تشغيل وضع التعديل (Edit Mode)" : "Edit Mode"}</span>
          </>
        )}
      </Button>

      <Link href={adminHref} target="_blank" rel="noopener noreferrer">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <span>{isArabic ? "لوحة الإدارة" : "Control Center"}</span>
          <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
        </Button>
      </Link>
    </aside>
  );
}
