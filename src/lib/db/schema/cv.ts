import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const cvVersions = pgTable(
  "cv_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    versionNumber: integer("version_number").notNull(),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").default("application/pdf").notNull(),
    changelog: text("changelog"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("cv_versions_num_idx").on(table.versionNumber)],
);

export const cvPublications = pgTable(
  "cv_publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cvVersionId: uuid("cv_version_id")
      .notNull()
      .references(() => cvVersions.id, { onDelete: "cascade" }),
    isCurrent: boolean("is_current").default(false).notNull(),
    publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cv_pub_current_idx").on(table.isCurrent),
    index("cv_pub_version_idx").on(table.cvVersionId),
  ],
);
