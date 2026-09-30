import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentEntries } from "@/lib/db/schema";
import {
  COLLECTIONS,
  LOCALES,
  type CollectionName,
  type Entry,
  type EntryStatus,
  type Locale,
} from "./collections";
import { contentTag } from "./tags";

/** Serializable row (dates as ISO strings) — safe to return from `use cache` scopes. */
export interface EntryRow {
  id: string;
  collection: string;
  slug: string;
  status: EntryStatus;
  orderIndex: number;
  version: number;
  updatedAt: string;
  data: Record<string, unknown>;
  i18n: Record<string, Record<string, unknown>>;
}

function toRow(row: typeof contentEntries.$inferSelect): EntryRow {
  return {
    id: row.id,
    collection: row.collection,
    slug: row.slug,
    status: row.status as EntryStatus,
    orderIndex: row.orderIndex,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
    data: row.data ?? {},
    i18n: row.i18n ?? {},
  };
}

function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Resolves an entry for one locale. Each field falls back to the other language when it is
 * empty, so a half-translated entry never shows blank text. Invalid data is repaired with the
 * schema defaults instead of crashing the page.
 */
export function resolveEntry<C extends CollectionName>(row: EntryRow, locale: Locale): Entry<C> {
  const spec = COLLECTIONS[row.collection as C];
  const other: Locale = locale === "en" ? "ar" : "en";
  const primary = row.i18n[locale] ?? {};
  const secondary = row.i18n[other] ?? {};
  const merged: Record<string, unknown> = { ...secondary };
  for (const [key, value] of Object.entries(primary)) {
    if (isFilled(value)) merged[key] = value;
  }
  const data = spec.data.safeParse(row.data);
  const t = spec.i18n.safeParse(merged);
  return {
    id: row.id,
    collection: row.collection as C,
    slug: row.slug,
    status: row.status,
    orderIndex: row.orderIndex,
    version: row.version,
    updatedAt: row.updatedAt,
    data: (data.success ? data.data : spec.data.parse({})) as Entry<C>["data"],
    t: (t.success ? t.data : lenientParse(spec.i18n, merged)) as Entry<C>["t"],
    locales: LOCALES.filter((l) => Object.values(row.i18n[l] ?? {}).some(isFilled)),
  };
}

/** Keeps the valid fields of a partially invalid object and fills the rest with defaults. */
function lenientParse(
  schema: (typeof COLLECTIONS)[CollectionName]["i18n"],
  value: Record<string, unknown>,
) {
  const shape = schema.shape as Record<string, import("zod").ZodTypeAny>;
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(shape)) {
    const parsed = field.safeParse(value[key]);
    out[key] = parsed.success
      ? parsed.data
      : field.safeParse(undefined).success
        ? field.parse(undefined)
        : "";
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Cached public reads. Tagged per collection; admin writes expire the tag immediately.
// ---------------------------------------------------------------------------------------------

async function loadPublished(collection: CollectionName): Promise<EntryRow[]> {
  "use cache";
  cacheTag(contentTag(collection));
  try {
    const rows = await db
      .select()
      .from(contentEntries)
      .where(and(eq(contentEntries.collection, collection), eq(contentEntries.status, "published")))
      .orderBy(asc(contentEntries.orderIndex), asc(contentEntries.createdAt));
    cacheLife("hours");
    return rows.map(toRow);
  } catch (error) {
    // Database unreachable (e.g. during a CI build). Serve empty content briefly, then retry.
    console.error(
      "content_load_failed",
      collection,
      error instanceof Error ? error.message : error,
    );
    cacheLife("minutes");
    return [];
  }
}

export async function listEntries<C extends CollectionName>(
  collection: C,
  locale: Locale,
): Promise<Entry<C>[]> {
  const rows = await loadPublished(collection);
  return rows.map((row) => resolveEntry<C>(row, locale));
}

export async function getEntry<C extends CollectionName>(
  collection: C,
  slug: string,
  locale: Locale,
): Promise<Entry<C> | null> {
  const rows = await loadPublished(collection);
  const row = rows.find((r) => r.slug === slug);
  return row ? resolveEntry<C>(row, locale) : null;
}

export async function getProfile(locale: Locale): Promise<Entry<"profile"> | null> {
  return getEntry("profile", "main", locale);
}

// ---------------------------------------------------------------------------------------------
// Uncached reads for the admin and the assistant (always fresh).
// ---------------------------------------------------------------------------------------------

export async function listAllRows(collection?: CollectionName): Promise<EntryRow[]> {
  const rows = await db
    .select()
    .from(contentEntries)
    .where(collection ? eq(contentEntries.collection, collection) : undefined)
    .orderBy(
      asc(contentEntries.collection),
      asc(contentEntries.orderIndex),
      asc(contentEntries.createdAt),
    );
  return rows.map(toRow);
}

export async function getRowById(id: string): Promise<EntryRow | null> {
  const [row] = await db.select().from(contentEntries).where(eq(contentEntries.id, id)).limit(1);
  return row ? toRow(row) : null;
}

export async function listPublishedFresh<C extends CollectionName>(
  collection: C,
  locale: Locale,
): Promise<Entry<C>[]> {
  const rows = await db
    .select()
    .from(contentEntries)
    .where(and(eq(contentEntries.collection, collection), eq(contentEntries.status, "published")))
    .orderBy(asc(contentEntries.orderIndex), asc(contentEntries.createdAt));
  return rows.map((row) => resolveEntry<C>(toRow(row), locale));
}
