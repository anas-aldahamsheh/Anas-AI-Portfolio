"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  EyeOff,
  FileUp,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pencil,
  PencilOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/i18n/provider";
import { authClient } from "@/lib/security/auth-client";
import { isCollectionName, type CollectionName } from "@/server/content/collections";
import { removeEntry, setEntryStatus, shiftEntry, uploadCv } from "@/server/actions/admin";
import { cn } from "@/lib/utils";
import { adminStrings } from "../strings";
import { EntryEditor } from "../editor/entry-editor";
import { UiTextEditor } from "../editor/ui-text-editor";

interface Hovered {
  id: string;
  collection: CollectionName;
  label: string;
  rect: DOMRect;
}

interface ListHover {
  collection: CollectionName;
  rect: DOMRect;
}

type EditorState = { collection: CollectionName; entryId?: string; focusField?: string } | null;

const EDIT_KEY = "pf_edit";

/**
 * The owner's editing layer, mounted only when the admin hint cookie exists and the server
 * confirms the session. It reads the data-edit-* markers the pages render and turns them into
 * click-to-edit text, per-item toolbars and "add" buttons. Every change is saved through server
 * actions that re-check the admin session, refresh the page, and re-index the assistant.
 */
export function AdminOverlay() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);
  const [textKey, setTextKey] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [listHover, setListHover] = useState<ListHover | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const cvInput = useRef<HTMLInputElement>(null);

  const notify = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  // Confirm the session server-side; a stale hint cookie is cleared.
  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ admin: boolean }>)
      .then((result) => {
        if (!result.admin) {
          void fetch("/api/admin/session", { method: "DELETE" });
          document.documentElement.classList.remove("edit-mode");
          return;
        }
        setVerified(true);
        try {
          setEditMode(localStorage.getItem(EDIT_KEY) === "1");
        } catch {
          // storage disabled
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("edit-mode", verified && editMode);
    try {
      localStorage.setItem(EDIT_KEY, editMode ? "1" : "0");
    } catch {
      // storage disabled
    }
  }, [editMode, verified]);

  // Click-to-edit (capture phase, so links and buttons under the marker don't fire).
  useEffect(() => {
    if (!verified || !editMode) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-admin-ui]")) return;
      const field = target.closest<HTMLElement>("[data-edit-field]");
      const text = target.closest<HTMLElement>("[data-edit-ui]");
      const hit = field && text ? (field.contains(text) ? text : field) : (field ?? text);
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      if (hit.dataset["editUi"]) {
        setTextKey(hit.dataset["editUi"]);
        return;
      }
      const collection = hit.dataset["editCollection"] ?? "";
      if (!isCollectionName(collection)) return;
      setEditor({
        collection,
        entryId: hit.dataset["editId"] ?? "",
        focusField: hit.dataset["editField"] ?? "",
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [verified, editMode]);

  // Hover tracking for entry toolbars and list "add" buttons.
  useEffect(() => {
    if (!verified || !editMode) return;
    let frame = 0;
    const update = (target: HTMLElement | null) => {
      if (target?.closest("[data-admin-ui]")) return;
      const entry = target?.closest<HTMLElement>("[data-edit-entry]");
      const collection = entry?.dataset["editCollection"] ?? "";
      if (entry && isCollectionName(collection)) {
        setHovered({
          id: entry.dataset["editEntry"] ?? "",
          collection,
          label: entry.dataset["editLabel"] ?? "",
          rect: entry.getBoundingClientRect(),
        });
      } else {
        setHovered(null);
      }
      const list = target?.closest<HTMLElement>("[data-edit-list]");
      const listCollection = list?.dataset["editList"] ?? "";
      setListHover(
        list && isCollectionName(listCollection)
          ? { collection: listCollection, rect: list.getBoundingClientRect() }
          : null,
      );
    };
    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(target));
    };
    const onScroll = () => {
      setHovered(null);
      setListHover(null);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [verified, editMode]);

  const afterChange = (message = strings.reindexNote) => {
    router.refresh();
    notify(message);
  };

  const act = async (work: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    const result = await work();
    setBusy(false);
    if (result.ok) afterChange();
    else notify(result.error ?? strings.error, "error");
  };

  const signOut = async () => {
    await authClient.signOut();
    await fetch("/api/admin/session", { method: "DELETE" });
    document.documentElement.classList.remove("edit-mode");
    window.location.reload();
  };

  if (!verified) return null;
  const activeHover = editMode ? hovered : null;
  const activeList = editMode ? listHover : null;

  return createPortal(
    <div data-admin-ui="" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Per-entry toolbar */}
      <AnimatePresence>
        {activeHover ? (
          <m.div
            key={activeHover.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[65] flex items-center gap-0.5 rounded-xl border border-cyan-300/50 bg-white/95 p-1 shadow-lg backdrop-blur dark:border-cyan-400/30 dark:bg-[#0B1728]/95"
            style={{
              top: Math.max(8, activeHover.rect.top - 18),
              left: locale === "ar" ? activeHover.rect.left + 8 : undefined,
              right:
                locale === "ar"
                  ? undefined
                  : Math.max(8, window.innerWidth - activeHover.rect.right + 8),
            }}
            onPointerEnter={() => setHovered(activeHover)}
          >
            <ToolbarButton
              label={strings.edit}
              onClick={() =>
                setEditor({ collection: activeHover.collection, entryId: activeHover.id })
              }
            >
              <Pencil className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label={strings.moveUp}
              onClick={() => act(() => shiftEntry(activeHover.id, -1))}
              disabled={busy}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label={strings.moveDown}
              onClick={() => act(() => shiftEntry(activeHover.id, 1))}
              disabled={busy}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label={strings.hide}
              onClick={() => act(() => setEntryStatus(activeHover.id, "hidden"))}
              disabled={busy}
            >
              <EyeOff className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label={strings.delete}
              danger
              disabled={busy}
              onClick={() => {
                if (window.confirm(`${strings.deleteConfirm}\n\n${activeHover.label}`))
                  void act(() => removeEntry(activeHover.id));
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </ToolbarButton>
          </m.div>
        ) : null}
      </AnimatePresence>

      {/* "Add" button for lists */}
      {activeList ? (
        <button
          type="button"
          onClick={() => setEditor({ collection: activeList.collection })}
          className="fixed z-[64] inline-flex items-center gap-1 rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-cyan-500"
          style={{
            top: Math.max(8, activeList.rect.top - 40),
            left: locale === "ar" ? undefined : activeList.rect.left,
            right: locale === "ar" ? window.innerWidth - activeList.rect.right : undefined,
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          {strings.add}
        </button>
      ) : null}

      {/* Dock */}
      <m.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.3 }}
        className="fixed start-1/2 bottom-5 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-[#0B1728]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl rtl:translate-x-1/2"
      >
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          aria-pressed={editMode}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
            editMode
              ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-inner"
              : "text-slate-300 hover:bg-white/10",
          )}
        >
          {editMode ? <Pencil className="h-3.5 w-3.5" /> : <PencilOff className="h-3.5 w-3.5" />}
          {editMode ? strings.editOn : strings.editOff}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => cvInput.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
          title={strings.uploadCv}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileUp className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">CV</span>
        </button>
        <input
          ref={cvInput}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const form = new FormData();
            form.set("file", file);
            void (async () => {
              setBusy(true);
              const result = await uploadCv(form);
              setBusy(false);
              if (result.ok) afterChange(strings.cvUploaded);
              else notify(result.error, "error");
            })();
          }}
        />
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{strings.dashboard}</span>
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label={strings.signOut}
          title={strings.signOut}
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </m.div>

      <AnimatePresence>
        {toast ? (
          <m.p
            key={toast.text}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={cn(
              "fixed start-1/2 bottom-20 z-[61] max-w-[90vw] -translate-x-1/2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xl rtl:translate-x-1/2",
              toast.tone === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white",
            )}
          >
            {toast.text}
          </m.p>
        ) : null}
      </AnimatePresence>

      {editor ? (
        <EntryEditor
          open
          collection={editor.collection}
          entryId={editor.entryId || undefined}
          focusField={editor.focusField || undefined}
          uiLocale={locale}
          strings={strings}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            afterChange();
          }}
        />
      ) : null}
      {textKey ? (
        <UiTextEditor
          key={textKey}
          textKey={textKey}
          uiLocale={locale}
          strings={strings}
          onClose={() => setTextKey(null)}
          onSaved={() => {
            setTextKey(null);
            afterChange(strings.saved);
          }}
        />
      ) : null}
    </div>,
    document.body,
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-lg p-1.5 transition disabled:opacity-40",
        danger
          ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
