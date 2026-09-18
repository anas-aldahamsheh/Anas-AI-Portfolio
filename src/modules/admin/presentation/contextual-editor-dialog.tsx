"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { EditableRef } from "../domain/inline-edit";
import { useAdminEdit } from "./admin-edit-provider";

interface ContextualEditorFormProps {
  activeEditableRef: EditableRef;
  onClose: () => void;
}

function getInitialFormState(ref: EditableRef): {
  text: string;
  form: Record<string, unknown>;
} {
  const initial = ref.initialData;
  if (typeof initial === "string") {
    return { text: initial, form: {} };
  }
  if (typeof initial === "object" && initial !== null) {
    let initialText = "";
    if (typeof initial["value"] === "string") {
      initialText = initial["value"];
    } else if (typeof initial["title"] === "string") {
      initialText = initial["title"];
    }
    return { text: initialText, form: initial };
  }
  return { text: "", form: {} };
}

function ContextualEditorForm({ activeEditableRef, onClose }: ContextualEditorFormProps) {
  const router = useRouter();
  const { notifyUpdate } = useAdminEdit();

  const [initialState] = useState(() => getInitialFormState(activeEditableRef));
  const [formData, setFormData] = useState<Record<string, unknown>>(initialState.form);
  const [textValue, setTextValue] = useState<string>(initialState.text);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const title = activeEditableRef.title || `Edit ${activeEditableRef.entityType}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let dataPayload: Record<string, unknown> | string;

      if (activeEditableRef.entityType === "ui_text") {
        dataPayload = textValue;
      } else if (activeEditableRef.entityType === "section") {
        dataPayload = {
          ...formData,
          title: textValue,
          subtitle: (formData["subtitle"] as string) || undefined,
        };
      } else if (activeEditableRef.entityType === "block") {
        dataPayload = {
          content: {
            ...((formData["content"] as Record<string, unknown>) || {}),
            title: textValue,
            text: textValue,
          },
        };
      } else {
        dataPayload = textValue || formData;
      }

      const res = await fetch("/api/admin/inline-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType: activeEditableRef.entityType,
          entityId: activeEditableRef.entityId,
          fieldOrBlockId: activeEditableRef.fieldOrBlockId,
          locale: activeEditableRef.locale,
          expectedVersion: activeEditableRef.version,
          data: dataPayload,
          action: "update",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save changes");
      }

      notifyUpdate(json);
      onClose();
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <h2
            id="contextual-editor-title"
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {title}
          </h2>
          <Badge variant="outline" size="sm" className="capitalize">
            {activeEditableRef.entityType}
          </Badge>
          {activeEditableRef.locale && (
            <Badge variant="secondary" size="sm" className="font-mono uppercase">
              {activeEditableRef.locale}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close editor"
          className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="inline-edit-field"
            className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Content
          </label>
          <Input
            id="inline-edit-field"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Enter updated content..."
            required
            autoFocus
          />
        </div>

        {activeEditableRef.entityType === "section" && (
          <div className="space-y-1.5">
            <label
              htmlFor="inline-edit-subtitle"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Subtitle (Optional)
            </label>
            <Input
              id="inline-edit-subtitle"
              value={(formData["subtitle"] as string) || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Enter section subtitle..."
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ContextualEditorDialog() {
  const { activeEditableRef, closeEditor } = useAdminEdit();

  // Handle ESC key to close modal
  useEffect(() => {
    if (!activeEditableRef) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeEditor();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeEditableRef, closeEditor]);

  if (!activeEditableRef) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contextual-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeEditor();
        }
      }}
    >
      <ContextualEditorForm
        key={`${activeEditableRef.entityId}-${activeEditableRef.fieldOrBlockId}`}
        activeEditableRef={activeEditableRef}
        onClose={closeEditor}
      />
    </div>
  );
}
