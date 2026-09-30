"use server";

import { after } from "next/server";
import { updateTag } from "next/cache";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { assistantTurns, knowledgeSources } from "@/lib/db/schema";
import { requireAdmin, NotAdminError } from "@/server/auth/session";
import {
  COLLECTIONS,
  isCollectionName,
  isSingleton,
  type CollectionName,
  type EntryStatus,
} from "@/server/content/collections";
import {
  ContentError,
  createEntry,
  deleteEntry,
  listRevisions,
  moveEntry,
  restoreRevision,
  updateEntry,
  type EntryPatch,
} from "@/server/content/mutations";
import { getRowById, listAllRows, type EntryRow } from "@/server/content/repository";
import { contentTag, SETTINGS_TAG, UI_TEXT_TAG } from "@/server/content/tags";
import { getUiTextValues, saveUiText } from "@/server/content/ui-text";
import { translateFields } from "@/server/content/translate";
import { syncEntryKnowledge, rebuildKnowledge } from "@/server/knowledge/sync";
import { storeMedia, readMedia, mediaIdFromUrl, UploadError } from "@/server/media/store";
import { extractText } from "@/server/documents/extract";
import { hybridSearch } from "@/ai/knowledge/retriever";
import { aiSettingsSchema, getAiSettings, saveAiSettings, type AiSettings } from "@/ai/settings";
import type { Locale } from "@/i18n/config";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(work: (actorId: string) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const admin = await requireAdmin();
    return { ok: true, data: await work(admin.id) };
  } catch (error) {
    if (error instanceof NotAdminError)
      return { ok: false, error: "Your session expired. Sign in again." };
    if (error instanceof ContentError || error instanceof UploadError)
      return { ok: false, error: error.message };
    console.error("admin_action_failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong." };
  }
}

/** Expires the public pages that show this collection and re-indexes the entry after the response. */
function published(collection: string, entryId: string) {
  if (isCollectionName(collection)) updateTag(contentTag(collection));
  after(async () => {
    try {
      await syncEntryKnowledge(entryId);
    } catch (error) {
      console.error("knowledge_sync_failed", entryId, error);
    }
  });
}

// ---------------------------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------------------------

export async function adminWhoAmI(): Promise<ActionResult<{ name: string; email: string }>> {
  return run(async () => {
    const admin = await requireAdmin();
    return { name: admin.name, email: admin.email };
  });
}

// ---------------------------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------------------------

export interface EditableEntry {
  row: EntryRow;
  collection: CollectionName;
}

export async function loadEntry(id: string): Promise<ActionResult<EntryRow>> {
  return run(async () => {
    const row = await getRowById(id);
    if (!row) throw new ContentError("This entry no longer exists.", "not_found");
    return row;
  });
}

export async function loadCollection(collection: string): Promise<ActionResult<EntryRow[]>> {
  return run(async () => {
    if (!isCollectionName(collection)) throw new ContentError("Unknown collection.");
    return listAllRows(collection);
  });
}

export async function saveEntry(input: {
  id?: string;
  collection: string;
  patch: EntryPatch;
}): Promise<ActionResult<EntryRow>> {
  return run(async (actorId) => {
    if (!isCollectionName(input.collection)) throw new ContentError("Unknown collection.");
    const row = input.id
      ? await updateEntry(input.id, input.patch, actorId)
      : await createEntry(input.collection, input.patch, actorId);
    published(row.collection, row.id);
    return row;
  });
}

export async function removeEntry(id: string): Promise<ActionResult<{ collection: string }>> {
  return run(async (actorId) => {
    const row = await deleteEntry(id, actorId);
    published(row.collection, row.id);
    return { collection: row.collection };
  });
}

export async function setEntryStatus(
  id: string,
  status: EntryStatus,
): Promise<ActionResult<EntryRow>> {
  return run(async (actorId) => {
    const row = await updateEntry(id, { status }, actorId);
    published(row.collection, row.id);
    return row;
  });
}

export async function shiftEntry(id: string, direction: -1 | 1): Promise<ActionResult<EntryRow>> {
  return run(async () => {
    const row = await moveEntry(id, direction);
    if (isCollectionName(row.collection)) updateTag(contentTag(row.collection));
    return row;
  });
}

export async function entryHistory(id: string) {
  return run(async () => listRevisions(id));
}

export async function restoreEntry(revisionId: string): Promise<ActionResult<EntryRow>> {
  return run(async (actorId) => {
    const row = await restoreRevision(revisionId, actorId);
    published(row.collection, row.id);
    return row;
  });
}

// ---------------------------------------------------------------------------------------------
// Interface text
// ---------------------------------------------------------------------------------------------

export async function loadUiText(key: string) {
  return run(async () => getUiTextValues(key));
}

export async function saveUiTextAction(
  key: string,
  values: Partial<Record<Locale, string>>,
): Promise<ActionResult> {
  return run(async () => {
    await saveUiText(key, values);
    updateTag(UI_TEXT_TAG);
    return undefined;
  });
}

// ---------------------------------------------------------------------------------------------
// Translation
// ---------------------------------------------------------------------------------------------

export async function translateAction(
  fields: Record<string, string | string[]>,
  from: Locale,
  to: Locale,
) {
  return run(async () => translateFields(fields, from, to));
}

// ---------------------------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------------------------

export async function uploadMedia(
  form: FormData,
): Promise<ActionResult<{ url: string; fileName: string; mimeType: string; sizeBytes: number }>> {
  return run(async () => {
    const file = form.get("file");
    if (!(file instanceof File)) throw new UploadError("No file received.");
    const accept = form.get("accept") === "image" ? "image" : "any";
    const media = await storeMedia(file, { accept });
    return {
      url: media.url,
      fileName: media.fileName,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
    };
  });
}

/** Reads a stored file with Gemini and saves the text on the document entry, then re-indexes it. */
async function extractInto(entryId: string) {
  const row = await getRowById(entryId);
  if (!row) return;
  const fileUrl = typeof row.data["file"] === "string" ? (row.data["file"] as string) : "";
  const mediaId = mediaIdFromUrl(fileUrl);
  const media = mediaId ? await readMedia(mediaId) : null;
  if (!media) return;
  try {
    const text = await extractText(media.data, media.mimeType);
    await updateEntry(
      entryId,
      { data: { extractedText: text, extractedAt: new Date().toISOString(), extractionError: "" } },
      null,
    );
  } catch (error) {
    await updateEntry(
      entryId,
      {
        data: {
          extractionError:
            error instanceof Error ? error.message.slice(0, 300) : "Extraction failed",
        },
      },
      null,
    ).catch(() => {});
  }
  await syncEntryKnowledge(entryId);
}

/**
 * Replaces the CV: stores the PDF, links it from the profile (download buttons), and makes it
 * the assistant's "cv" knowledge document. The previous CV's text is removed from the index.
 */
export async function uploadCv(form: FormData): Promise<ActionResult<{ url: string }>> {
  return run(async (actorId) => {
    const file = form.get("file");
    if (!(file instanceof File)) throw new UploadError("No file received.");
    const media = await storeMedia(file);
    if (media.mimeType !== "application/pdf") throw new UploadError("The CV must be a PDF.");

    const profile = (await listAllRows("profile"))[0];
    if (profile) {
      await updateEntry(
        profile.id,
        { data: { cv: media.url, cvFileName: media.fileName } },
        actorId,
      );
      updateTag(contentTag("profile"));
    }

    const existing = (await listAllRows("document")).find((d) => d.data["role"] === "cv");
    const patch: EntryPatch = {
      data: {
        file: media.url,
        fileName: media.fileName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        role: "cv",
        extractedText: "",
        extractedAt: "",
        extractionError: "",
      },
      i18n: { en: { title: "Curriculum Vitae (CV)" }, ar: { title: "السيرة الذاتية" } },
    };
    const doc = existing
      ? await updateEntry(existing.id, patch, actorId)
      : await createEntry("document", { ...patch, slug: "cv" }, actorId);
    updateTag(contentTag("document"));
    after(() => extractInto(doc.id));
    return { url: media.url };
  });
}

export async function uploadDocument(form: FormData): Promise<ActionResult<EntryRow>> {
  return run(async (actorId) => {
    const file = form.get("file");
    if (!(file instanceof File)) throw new UploadError("No file received.");
    const media = await storeMedia(file);
    const title = String(form.get("title") ?? "").trim() || media.fileName.replace(/\.[^.]+$/, "");
    const doc = await createEntry(
      "document",
      {
        data: {
          file: media.url,
          fileName: media.fileName,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
          role: "document",
        },
        i18n: { en: { title, description: String(form.get("description") ?? "") } },
      },
      actorId,
    );
    updateTag(contentTag("document"));
    after(() => extractInto(doc.id));
    return doc;
  });
}

export async function reextractDocument(id: string): Promise<ActionResult> {
  return run(async () => {
    after(() => extractInto(id));
    return undefined;
  });
}

// ---------------------------------------------------------------------------------------------
// Knowledge index
// ---------------------------------------------------------------------------------------------

export interface IndexSource {
  id: string;
  title: string;
  kind: string;
  locale: string;
  status: string;
  chunkCount: number;
  indexedAt: string;
  error: string | null;
}

export async function indexOverview(): Promise<
  ActionResult<{ sources: IndexSource[]; chunks: number; missingEmbeddings: number }>
> {
  return run(async () => {
    const sources = await db
      .select()
      .from(knowledgeSources)
      .orderBy(desc(knowledgeSources.indexedAt));
    const [stats] = (await db.execute<{ chunks: number; missing: number }>(
      sql`select count(*)::int as chunks, count(*) filter (where embedding is null)::int as missing from knowledge_chunks`,
    )) as unknown as { chunks: number; missing: number }[];
    return {
      sources: sources.map((s) => ({
        id: s.id,
        title: s.title,
        kind: s.kind,
        locale: s.locale,
        status: s.status,
        chunkCount: s.chunkCount,
        indexedAt: s.indexedAt.toISOString(),
        error: s.error,
      })),
      chunks: Number(stats?.chunks ?? 0),
      missingEmbeddings: Number(stats?.missing ?? 0),
    };
  });
}

export async function rebuildIndexAction() {
  return run(async () => rebuildKnowledge());
}

export async function searchPlayground(query: string, rerank: boolean) {
  return run(async () =>
    (await hybridSearch({ query, limit: 10, rerank })).map((hit) => ({
      title: hit.title,
      heading: hit.heading,
      kind: hit.kind,
      locale: hit.locale,
      text: hit.text.slice(0, 500),
      score: hit.score,
      signals: hit.signals,
    })),
  );
}

// ---------------------------------------------------------------------------------------------
// Assistant settings & conversations
// ---------------------------------------------------------------------------------------------

export async function loadAssistantSettings(): Promise<ActionResult<AiSettings>> {
  return run(async () => getAiSettings());
}

export async function saveAssistantSettings(input: unknown): Promise<ActionResult<AiSettings>> {
  return run(async () => {
    const parsed = aiSettingsSchema.safeParse(input);
    if (!parsed.success)
      throw new ContentError(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      );
    const saved = await saveAiSettings(parsed.data);
    updateTag(SETTINGS_TAG);
    return saved;
  });
}

export async function recentConversations(limit = 50) {
  return run(async () => {
    const rows = await db
      .select()
      .from(assistantTurns)
      .orderBy(desc(assistantTurns.createdAt))
      .limit(Math.min(limit, 200));
    return rows.map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      locale: r.locale,
      question: r.question,
      answer: r.answer,
      tools: r.toolCalls.map((c) => c.name),
      model: r.model,
      latencyMs: r.latencyMs,
      error: r.error,
      createdAt: r.createdAt.toISOString(),
    }));
  });
}

// ---------------------------------------------------------------------------------------------
// Collection specs for the generic editor (serializable subset).
// ---------------------------------------------------------------------------------------------

export async function collectionSpecs() {
  return run(async () =>
    Object.fromEntries(
      Object.values(COLLECTIONS).map((spec) => [
        spec.name,
        {
          name: spec.name,
          label: spec.label,
          singleton: isSingleton(spec.name as CollectionName),
          titleField: spec.titleField,
          fields: spec.fields,
        },
      ]),
    ),
  );
}
