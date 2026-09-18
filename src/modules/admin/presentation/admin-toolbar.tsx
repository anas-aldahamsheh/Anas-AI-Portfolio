"use client";

import Link from "next/link";
import { Edit3, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <aside
      aria-label="Admin inline editing toolbar"
      className="fixed end-4 bottom-4 z-40 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95"
    >
      <Badge variant="secondary" size="sm" className="hidden select-none sm:inline-flex">
        Admin
      </Badge>

      <Button
        variant={isEditMode ? "primary" : "outline"}
        size="sm"
        onClick={toggleEditMode}
        aria-pressed={isEditMode}
        className="gap-1.5 text-xs font-medium"
      >
        {isEditMode ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Editing Active</span>
          </>
        ) : (
          <>
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Edit Mode</span>
          </>
        )}
      </Button>

      <Link href={adminHref} target="_blank" rel="noopener noreferrer">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-neutral-600 dark:text-neutral-400"
        >
          <span>Control Center</span>
          <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
        </Button>
      </Link>
    </aside>
  );
}
