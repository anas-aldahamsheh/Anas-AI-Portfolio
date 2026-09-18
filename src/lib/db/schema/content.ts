import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { locales } from "./localization";
import { users } from "./auth";

export const publishStatusEnum = pgEnum("publish_status_enum", ["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    status: publishStatusEnum("status").default("DRAFT").notNull(),
    isHome: boolean("is_home").default(false).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("pages_slug_idx").on(table.slug), index("pages_status_idx").on(table.status)],
);

export const pageTranslations = pgTable(
  "page_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    title: text("title").notNull(),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("page_trans_page_locale_uniq").on(table.pageId, table.localeCode),
    index("page_trans_page_idx").on(table.pageId),
  ],
);

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    sectionType: text("section_type").notNull(), // e.g. "hero", "project_grid", "contact"
    orderIndex: integer("order_index").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    status: publishStatusEnum("status").default("PUBLISHED").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sections_page_id_idx").on(table.pageId),
    index("sections_order_idx").on(table.orderIndex),
  ],
);

export const sectionTranslations = pgTable(
  "section_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    title: text("title"),
    subtitle: text("subtitle"),
    content: jsonb("content"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("section_trans_section_locale_uniq").on(table.sectionId, table.localeCode),
    index("section_trans_section_idx").on(table.sectionId),
  ],
);

export const sectionBlocks = pgTable(
  "section_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    blockType: text("block_type").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    config: jsonb("config"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("section_blocks_section_id_idx").on(table.sectionId),
    index("section_blocks_order_idx").on(table.orderIndex),
  ],
);

export const sectionBlockTranslations = pgTable(
  "section_block_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockId: uuid("block_id")
      .notNull()
      .references(() => sectionBlocks.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    content: jsonb("content").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("block_trans_block_locale_uniq").on(table.blockId, table.localeCode),
    index("block_trans_block_idx").on(table.blockId),
  ],
);

export const publishRevisions = pgTable(
  "publish_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    revisionNumber: integer("revision_number").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("publish_rev_entity_idx").on(table.entityType, table.entityId),
    index("publish_rev_published_at_idx").on(table.publishedAt),
  ],
);
