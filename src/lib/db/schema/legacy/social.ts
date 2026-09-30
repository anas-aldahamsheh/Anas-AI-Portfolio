import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { locales } from "./localization";

export const socialProfiles = pgTable(
  "social_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: text("platform").notNull(), // 'github', 'linkedin', 'x', etc.
    url: text("url").notNull(),
    handle: text("handle"),
    iconName: text("icon_name"),
    orderIndex: integer("order_index").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("social_profiles_platform_idx").on(table.platform),
    index("social_profiles_order_idx").on(table.orderIndex),
  ],
);

export const socialProfileTranslations = pgTable(
  "social_profile_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    socialProfileId: uuid("social_profile_id")
      .notNull()
      .references(() => socialProfiles.id, { onDelete: "cascade" }),
    localeCode: text("locale_code")
      .notNull()
      .references(() => locales.code, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    description: text("description"),
  },
  (table) => [
    unique("social_trans_profile_locale_uniq").on(table.socialProfileId, table.localeCode),
    index("social_trans_profile_idx").on(table.socialProfileId),
  ],
);
