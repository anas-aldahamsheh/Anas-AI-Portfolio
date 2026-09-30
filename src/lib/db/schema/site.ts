import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  customType,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";

/**
 * Everything a visitor sees (profile, projects, experience, certificates, skills, knowledge
 * documents...) lives in ONE table, one row per entry. `data` holds locale-neutral fields
 * (urls, dates, tags, media ids) and `i18n` holds `{ en: {...}, ar: {...} }`.
 * Each collection's shape is validated in code with Zod (src/server/content/collections.ts),
 * so adding a field never needs a migration.
 */
export const contentEntries = pgTable(
  "content_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collection: text("collection").notNull(),
    slug: text("slug").notNull(),
    status: text("status").notNull().default("published"),
    orderIndex: integer("order_index").notNull().default(0),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    i18n: jsonb("i18n").$type<Record<string, Record<string, unknown>>>().notNull().default({}),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("content_entries_collection_slug_uniq").on(t.collection, t.slug),
    index("content_entries_listing_idx").on(t.collection, t.status, t.orderIndex),
    check("content_entries_status_chk", sql`${t.status} in ('published', 'draft', 'hidden')`),
  ],
);

/** Append-only history so any edit or delete can be inspected and restored. */
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id").notNull(),
    collection: text("collection").notNull(),
    slug: text("slug").notNull(),
    version: integer("version").notNull(),
    action: text("action").notNull(), // create | update | delete | restore
    snapshot: jsonb("snapshot").notNull(),
    actorId: text("actor_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("content_revisions_entry_idx").on(t.entryId, t.version),
    index("content_revisions_created_idx").on(t.createdAt),
  ],
);

/** Admin overrides for interface copy. Defaults live in code; a row here wins. */
export const uiTexts = pgTable(
  "ui_texts",
  {
    key: text("key").notNull(),
    locale: text("locale").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.locale] })],
);

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/**
 * Uploaded files (CV, images, knowledge documents). Stored in Postgres so the site needs no
 * extra storage service and works on read-only serverless filesystems. Content-addressed by
 * SHA-256, served with immutable caching.
 */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sha256: text("sha256").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("media_assets_sha256_uniq").on(t.sha256)],
);

/** Small key/value store for site-wide settings (assistant models, quick questions...). */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
