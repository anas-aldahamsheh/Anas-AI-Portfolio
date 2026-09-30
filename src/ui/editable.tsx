import type { ElementType, ReactNode } from "react";
import type { MessageKey } from "@/i18n/messages";

/**
 * Markers the admin edit overlay understands. They are plain data attributes: visitors get
 * static HTML with no admin code, and the overlay (loaded only for the owner) finds them.
 */

/** Interface copy (overridable text from the dictionary). */
export function EditableText({
  k,
  children,
  as: Tag = "span",
  className,
}: {
  k: MessageKey;
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag data-edit-ui={k} className={className}>
      {children}
    </Tag>
  );
}

interface EntryRef {
  id: string;
  collection: string;
}

/** One field of a content entry (opens the entry form focused on that field). */
export function fieldProps(entry: EntryRef, field: string) {
  return {
    "data-edit-field": field,
    "data-edit-id": entry.id,
    "data-edit-collection": entry.collection,
  };
}

/** A whole entry card (hover toolbar: edit, move, hide, delete). */
export function entryProps(entry: EntryRef, label: string) {
  return {
    "data-edit-entry": entry.id,
    "data-edit-collection": entry.collection,
    "data-edit-label": label,
  };
}

/** A list of entries (shows an "Add" button in edit mode). */
export function listProps(collection: string) {
  return { "data-edit-list": collection };
}
