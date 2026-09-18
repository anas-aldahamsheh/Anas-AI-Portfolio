"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditableRef } from "../domain/inline-edit";
import { useAdminEdit } from "./admin-edit-provider";

export interface EditableRegionProps {
  children: React.ReactNode;
  editableRef: EditableRef;
  className?: string | undefined;
}

export function EditableRegion({ children, editableRef, className }: EditableRegionProps) {
  const { isAdmin, isEditMode, openEditor } = useAdminEdit();

  // For regular visitors or when edit mode is OFF, render purely children with zero DOM wrapper overhead
  if (!isAdmin || !isEditMode) {
    return <>{children}</>;
  }

  const label = editableRef.title
    ? `Edit ${editableRef.title}`
    : `Edit ${editableRef.entityType} ${editableRef.fieldOrBlockId}`;

  return (
    <div
      className={cn(
        "group relative rounded-lg outline outline-1 outline-neutral-400/40 transition-all duration-150 outline-dashed hover:outline-neutral-900/70 dark:hover:outline-neutral-100/70",
        className,
      )}
      data-editable-entity={editableRef.entityType}
      data-editable-id={editableRef.entityId}
    >
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openEditor(editableRef);
        }}
        aria-label={label}
        className="absolute end-2 top-2 z-30 inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white/95 px-2 py-0.5 text-xs font-medium text-neutral-800 opacity-70 shadow-sm transition-all group-hover:opacity-100 hover:bg-neutral-100 focus:opacity-100 focus:ring-2 focus:ring-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <Pencil className="h-3 w-3 text-neutral-600 dark:text-neutral-300" aria-hidden="true" />
        <span className="text-[11px]">Edit</span>
      </button>
    </div>
  );
}
