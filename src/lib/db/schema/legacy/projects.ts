import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  index,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { locales } from "./localization";
import { publishStatusEnum } from "./content";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    status: publishStatusEnum("status").default("PUBLISHED").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    coverImageUrl: text("cover_image_url"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("projects_slug_idx").on(table.slug),
    index("projects_status_idx").on(table.status),
    index("projects_order_idx").on(table.orderIndex),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    problem: text("problem"),
    constraints: text("constraints"),
    solution: text("solution"),
    architecture: text("architecture"),
    implementation: text("implementation"),
    challenges: text("challenges"),
    decisionsTradeoffs: text("decisions_tradeoffs"),
    results: text("results"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("proj_trans_proj_locale_uniq").on(table.projectId, table.localeCode),
    index("proj_trans_proj_idx").on(table.projectId),
  ],
);

export const projectCategories = pgTable("project_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const projectCategoryLinks = pgTable(
  "project_category_links",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => projectCategories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.categoryId] })],
);

export const projectTags = pgTable("project_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const projectTagLinks = pgTable(
  "project_tag_links",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => projectTags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.tagId] })],
);

export const projectBlocks = pgTable(
  "project_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    blockType: text("block_type").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    data: jsonb("data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("proj_blocks_proj_idx").on(table.projectId),
    index("proj_blocks_order_idx").on(table.orderIndex),
  ],
);

export const projectBlockTranslations = pgTable(
  "project_block_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockId: uuid("block_id")
      .notNull()
      .references(() => projectBlocks.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    content: jsonb("content").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("proj_block_trans_uniq").on(table.blockId, table.localeCode),
    index("proj_block_trans_block_idx").on(table.blockId),
  ],
);

export const projectLinks = pgTable(
  "project_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    labelKey: text("label_key").notNull(),
    url: text("url").notNull(),
    linkType: text("link_type").default("external").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [index("proj_links_proj_idx").on(table.projectId)],
);

export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    mediaType: text("media_type").default("image").notNull(), // image, video
    altTextKey: text("alt_text_key"),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [index("proj_media_proj_idx").on(table.projectId)],
);
