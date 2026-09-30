import { pgTable, uuid, text, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";

export const locales = pgTable("locales", {
  code: text("code").primaryKey(), // 'ar', 'en'
  name: text("name").notNull(),
  dir: text("dir").notNull().default("ltr"), // 'rtl', 'ltr'
  isDefault: boolean("is_default").default(false).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const uiTextKeys = pgTable(
  "ui_text_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(), // e.g. "nav.cv", "home.title"
    category: text("category").notNull().default("general"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("ui_text_keys_key_idx").on(table.key)],
);

export const uiTextTranslations = pgTable(
  "ui_text_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    keyId: uuid("key_id")
      .notNull()
      .references(() => uiTextKeys.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("ui_text_trans_key_locale_uniq").on(table.keyId, table.localeCode),
    index("ui_text_trans_key_idx").on(table.keyId),
    index("ui_text_trans_locale_idx").on(table.localeCode),
  ],
);
