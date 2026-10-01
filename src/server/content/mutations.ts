import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentEntries, contentRevisions } from "@/lib/db/schema";
import {
  COLLECTIONS,
  LOCALES,
  isSingleton,
  type CollectionName,
  type EntryStatus,
  type Locale,
} from "./collections";
import { getRowById, type EntryRow } from "./repository";

export class ContentError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "conflict" | "invalid" = "invalid",
  ) {
    super(message);
    this.name = "ContentError";
  }
}

export interface EntryPatch {
  slug?: string;
  status?: EntryStatus;
  data?: Record<string, unknown>;
  i18n?: Partial<Record<Locale, Record<string, unknown>>>;
  expectedVersion?: number;
  /** Use `data`/`i18n` as the complete new content instead of merging (restoring a revision). */
  replace?: boolean;
}

const isFilled = (v: unknown) =>
  v !== undefined &&
  v !== null &&
  (typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : true);

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function uniqueSlug(
  collection: CollectionName,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = base || `${collection}-${Math.random().toString(36).slice(2, 7)}`;
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const [clash] = await db
      .select({ id: contentEntries.id })
      .from(contentEntries)
      .where(and(eq(contentEntries.collection, collection), eq(contentEntries.slug, candidate)))
      .limit(1);
    if (!clash || clash.id === excludeId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/**
 * Validates a full entry state against its collection schema.
 *  - shared data is parsed strictly (unknown keys dropped, defaults applied);
 *  - each language is validated for types; required fields must exist in at least one language
 *    (the site falls back to the other language field by field).
 */
function validate(
  collection: CollectionName,
  data: Record<string, unknown>,
  i18n: Record<string, Record<string, unknown>>,
) {
  const spec = COLLECTIONS[collection];
  const dataResult = spec.data.safeParse(data);
  if (!dataResult.success)
    throw new ContentError(
      dataResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );

  const partial = spec.i18n.partial();
  const cleanI18n: Record<string, Record<string, unknown>> = {};
  for (const locale of LOCALES) {
    const raw = i18n[locale];
    if (!raw) continue;
    const filled = Object.fromEntries(Object.entries(raw).filter(([, v]) => isFilled(v)));
    if (Object.keys(filled).length === 0) continue;
    const parsed = partial.safeParse(filled);
    if (!parsed.success) {
      throw new ContentError(
        `${locale}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    cleanI18n[locale] = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => isFilled(v)),
    );
  }
  for (const field of spec.fields.filter((f) => f.localized && f.required)) {
    if (!LOCALES.some((l) => isFilled(cleanI18n[l]?.[field.name]))) {
      throw new ContentError(`"${field.label.en}" is required (in at least one language).`);
    }
  }
  return { data: dataResult.data as Record<string, unknown>, i18n: cleanI18n };
}

async function writeRevision(
  row: EntryRow,
  action: "create" | "update" | "delete" | "restore",
  actorId: string | null,
) {
  await db.insert(contentRevisions).values({
    entryId: row.id,
    collection: row.collection,
    slug: row.slug,
    version: row.version,
    action,
    snapshot: {
      slug: row.slug,
      status: row.status,
      orderIndex: row.orderIndex,
      data: row.data,
      i18n: row.i18n,
    },
    actorId,
  });
}

function titleOf(
  collection: CollectionName,
  i18n: Record<string, Record<string, unknown>>,
): string {
  const field = COLLECTIONS[collection].titleField;
  const en = i18n["en"]?.[field];
  const ar = i18n["ar"]?.[field];
  return typeof en === "string" && en.trim() ? en : typeof ar === "string" ? ar : "";
}

export async function createEntry(
  collection: CollectionName,
  patch: EntryPatch,
  actorId: string | null,
): Promise<EntryRow> {
  const spec = COLLECTIONS[collection];
  const { data, i18n } = validate(
    collection,
    patch.data ?? {},
    (patch.i18n ?? {}) as Record<string, Record<string, unknown>>,
  );
  if (isSingleton(collection)) {
    const [existing] = await db
      .select({ id: contentEntries.id })
      .from(contentEntries)
      .where(eq(contentEntries.collection, collection))
      .limit(1);
    if (existing)
      throw new ContentError(`${spec.label.en} already exists; edit it instead.`, "conflict");
  }
  const slug = isSingleton(collection)
    ? "main"
    : await uniqueSlug(collection, slugify(patch.slug || titleOf(collection, i18n)));
  const [{ next } = { next: 0 }] = (await db.execute<{ next: number }>(
    sql`select coalesce(max(order_index) + 1, 0)::int as next from content_entries where collection = ${collection}`,
  )) as unknown as { next: number }[];
  const [inserted] = await db
    .insert(contentEntries)
    .values({ collection, slug, status: patch.status ?? "published", orderIndex: next, data, i18n })
    .returning();
  if (!inserted) throw new ContentError("Could not create the entry.");
  const row = (await getRowById(inserted.id))!;
  await writeRevision(row, "create", actorId);
  return row;
}

export async function updateEntry(
  id: string,
  patch: EntryPatch,
  actorId: string | null,
): Promise<EntryRow> {
  const current = await getRowById(id);
  if (!current) throw new ContentError("This entry no longer exists.", "not_found");
  if (patch.expectedVersion !== undefined && patch.expectedVersion !== current.version) {
    throw new ContentError(
      "This entry was changed somewhere else. Reload to get the latest version.",
      "conflict",
    );
  }
  const collection = current.collection as CollectionName;
  // A restore replaces the content wholesale: fields added after the snapshot must go too.
  const mergedI18n: Record<string, Record<string, unknown>> = patch.replace
    ? {}
    : { ...current.i18n };
  for (const [locale, fields] of Object.entries(patch.i18n ?? {})) {
    if (fields)
      mergedI18n[locale] = patch.replace
        ? { ...fields }
        : { ...(current.i18n[locale] ?? {}), ...fields };
  }
  const { data, i18n } = validate(
    collection,
    patch.replace ? { ...(patch.data ?? {}) } : { ...current.data, ...(patch.data ?? {}) },
    mergedI18n,
  );
  const slug =
    patch.slug !== undefined && !isSingleton(collection)
      ? await uniqueSlug(collection, slugify(patch.slug) || current.slug, id)
      : current.slug;

  const updated = await db
    .update(contentEntries)
    .set({
      data,
      i18n,
      slug,
      status: patch.status ?? current.status,
      version: sql`${contentEntries.version} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(contentEntries.id, id), eq(contentEntries.version, current.version)))
    .returning({ id: contentEntries.id });
  if (updated.length === 0)
    throw new ContentError("This entry was changed at the same moment. Try again.", "conflict");
  const row = (await getRowById(id))!;
  await writeRevision(row, "update", actorId);
  return row;
}

export async function deleteEntry(id: string, actorId: string | null): Promise<EntryRow> {
  const current = await getRowById(id);
  if (!current) throw new ContentError("This entry no longer exists.", "not_found");
  if (isSingleton(current.collection as CollectionName))
    throw new ContentError("The profile can't be deleted.");
  await writeRevision(current, "delete", actorId);
  await db.delete(contentEntries).where(eq(contentEntries.id, id));
  return current;
}

/** Moves an entry one step up or down within its collection. */
export async function moveEntry(id: string, direction: -1 | 1): Promise<EntryRow> {
  const current = await getRowById(id);
  if (!current) throw new ContentError("This entry no longer exists.", "not_found");
  const siblings = await db
    .select({ id: contentEntries.id })
    .from(contentEntries)
    .where(eq(contentEntries.collection, current.collection))
    .orderBy(asc(contentEntries.orderIndex), asc(contentEntries.createdAt));
  const ids = siblings.map((s) => s.id);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return current;
  [ids[from], ids[to]] = [ids[to]!, ids[from]!];
  await reorderEntries(current.collection as CollectionName, ids);
  return (await getRowById(id))!;
}

export async function reorderEntries(
  collection: CollectionName,
  orderedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [index, entryId] of orderedIds.entries()) {
      await tx
        .update(contentEntries)
        .set({ orderIndex: index })
        .where(and(eq(contentEntries.id, entryId), eq(contentEntries.collection, collection)));
    }
  });
}

export async function listRevisions(entryId: string, limit = 20) {
  const rows = await db
    .select()
    .from(contentRevisions)
    .where(eq(contentRevisions.entryId, entryId))
    .orderBy(desc(contentRevisions.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    version: r.version,
    action: r.action,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Brings back an older version (or a deleted entry) exactly as it was saved. */
export async function restoreRevision(
  revisionId: string,
  actorId: string | null,
): Promise<EntryRow> {
  const [revision] = await db
    .select()
    .from(contentRevisions)
    .where(eq(contentRevisions.id, revisionId))
    .limit(1);
  if (!revision) throw new ContentError("Revision not found.", "not_found");
  const snapshot = revision.snapshot as {
    slug: string;
    status: EntryStatus;
    orderIndex: number;
    data: Record<string, unknown>;
    i18n: Record<string, Record<string, unknown>>;
  };
  const existing = await getRowById(revision.entryId);
  if (existing) {
    return updateEntry(
      existing.id,
      {
        data: snapshot.data,
        i18n: snapshot.i18n,
        status: snapshot.status,
        slug: snapshot.slug,
        replace: true,
      },
      actorId,
    );
  }
  const [inserted] = await db
    .insert(contentEntries)
    .values({
      id: revision.entryId,
      collection: revision.collection,
      slug: await uniqueSlug(revision.collection as CollectionName, snapshot.slug),
      status: snapshot.status,
      orderIndex: snapshot.orderIndex,
      data: snapshot.data,
      i18n: snapshot.i18n,
    })
    .returning({ id: contentEntries.id });
  const row = (await getRowById(inserted!.id))!;
  await writeRevision(row, "restore", actorId);
  return row;
}
