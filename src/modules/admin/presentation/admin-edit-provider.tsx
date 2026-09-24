"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { EditableRef, InlineEditResult } from "../domain/inline-edit";

interface AdminEditContextValue {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
  activeEditableRef: EditableRef | null;
  openEditor: (ref: EditableRef) => void;
  closeEditor: () => void;
  notifyUpdate: (result: InlineEditResult) => void;
  registerUpdateHandler: (handler: (result: InlineEditResult) => void) => () => void;
}

const AdminEditContext = createContext<AdminEditContextValue>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  setEditMode: () => {},
  activeEditableRef: null,
  openEditor: () => {},
  closeEditor: () => {},
  notifyUpdate: () => {},
  registerUpdateHandler: () => () => {},
});

export interface AdminEditProviderProps {
  children: React.ReactNode;
  isAdmin?: boolean | undefined;
  initialEditMode?: boolean | undefined;
}

export function AdminEditProvider({
  children,
  isAdmin = false,
  initialEditMode = false,
}: AdminEditProviderProps) {
  const [isEditMode, setIsEditMode] = useState<boolean>(isAdmin && initialEditMode);
  const [activeEditableRef, setActiveEditableRef] = useState<EditableRef | null>(null);
  const [updateHandlers, setUpdateHandlers] = useState<Array<(result: InlineEditResult) => void>>(
    [],
  );

  // Synchronize edit mode from localStorage or URL parameter on mount
  React.useEffect(() => {
    if (!isAdmin) return;
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("editMode") === "true") {
          setIsEditMode(true);
          localStorage.setItem("admin_inline_edit_mode", "true");
          return;
        }
        const saved = localStorage.getItem("admin_inline_edit_mode");
        if (saved === "true") {
          setIsEditMode(true);
        }
      }
    } catch {
      // Ignore security/storage sandbox errors
    }
  }, [isAdmin]);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_inline_edit_mode", String(next));
        }
      } catch {
        // Ignore
      }
      return next;
    });
  }, [isAdmin]);

  const setEditMode = useCallback(
    (enabled: boolean) => {
      if (!isAdmin) return;
      setIsEditMode(enabled);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_inline_edit_mode", String(enabled));
        }
      } catch {
        // Ignore
      }
    },
    [isAdmin],
  );

  const openEditor = useCallback(
    (ref: EditableRef) => {
      if (!isAdmin || !isEditMode) return;
      setActiveEditableRef(ref);
    },
    [isAdmin, isEditMode],
  );

  const closeEditor = useCallback(() => {
    setActiveEditableRef(null);
  }, []);

  const notifyUpdate = useCallback(
    (result: InlineEditResult) => {
      for (const handler of updateHandlers) {
        handler(result);
      }
    },
    [updateHandlers],
  );

  const registerUpdateHandler = useCallback((handler: (result: InlineEditResult) => void) => {
    setUpdateHandlers((prev) => [...prev, handler]);
    return () => {
      setUpdateHandlers((prev) => prev.filter((h) => h !== handler));
    };
  }, []);

  return (
    <AdminEditContext.Provider
      value={{
        isAdmin,
        isEditMode: isAdmin && isEditMode,
        toggleEditMode,
        setEditMode,
        activeEditableRef,
        openEditor,
        closeEditor,
        notifyUpdate,
        registerUpdateHandler,
      }}
    >
      {children}
    </AdminEditContext.Provider>
  );
}

export function useAdminEdit(): AdminEditContextValue {
  return useContext(AdminEditContext);
}
