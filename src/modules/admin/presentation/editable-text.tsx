"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminEdit } from "./admin-edit-provider";
import { useTranslation } from "@/modules/localization/presentation/localization-provider";

export interface EditableTextProps {
  /**
   * Unique dictionary key for this text (e.g. "certificates.catalog.title", "about.hero.subtitle")
   */
  textKey: string;
  /**
   * Fallback text if the dictionary does not have a value yet
   */
  fallback?: string;
  /**
   * Locale to edit (defaults to current active locale from useTranslation)
   */
  locale?: "ar" | "en";
  /**
   * Human-readable label shown in the editor modal title
   */
  label?: string;
  /**
   * HTML tag to render as ("span", "p", "h1", "h2", "h3", "h4", "div", etc.)
   */
  as?: React.ElementType;
  /**
   * Additional styling classes
   */
  className?: string;
  /**
   * If true, uses a multiline textarea in the modal editor
   */
  multiline?: boolean;
  /**
   * Custom children or formatting
   */
  children?: React.ReactNode;
}

export function EditableText({
  textKey,
  fallback,
  locale,
  label,
  as: Component = "span",
  className,
  multiline,
  children,
}: EditableTextProps) {
  const { isAdmin, isEditMode, openEditor } = useAdminEdit();
  const { locale: currentLocale, dictionary } = useTranslation();

  const targetLocale = locale ?? currentLocale;
  const rawDictValue = dictionary[textKey];
  const resolvedText =
    rawDictValue !== undefined && rawDictValue.trim().length > 0
      ? rawDictValue
      : fallback ?? (typeof children === "string" ? children : "");

  // If not admin or edit mode is off, render pure, unadorned element
  if (!isAdmin || !isEditMode) {
    return (
      <Component className={className}>
        {resolvedText || children}
      </Component>
    );
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openEditor({
      entityType: "ui_text",
      entityId: textKey,
      fieldOrBlockId: "value",
      locale: targetLocale,
      title: label || textKey,
      initialData: resolvedText,
      multiline,
    });
  };

  return (
    <Component
      className={cn(
        "group/editable relative inline-flex items-baseline flex-wrap gap-1 rounded outline outline-1 outline-dashed outline-indigo-400/50 hover:outline-indigo-500 hover:bg-indigo-500/5 px-1 -mx-1 transition-all",
        className,
      )}
      data-editable-key={textKey}
    >
      <span>{resolvedText || children}</span>
      <button
        type="button"
        onClick={handleEditClick}
        aria-label={`Edit ${label || textKey}`}
        title={`Edit: ${label || textKey} (${targetLocale.toUpperCase()})`}
        className="inline-flex items-center justify-center h-4 w-4 rounded bg-[#4F46E5] text-white shadow-xs hover:bg-[#4338CA] hover:scale-110 opacity-75 group-hover/editable:opacity-100 transition-all z-20 cursor-pointer align-middle shrink-0 ms-1"
      >
        <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    </Component>
  );
}
