import { pgTable, uuid, text, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const themeConfigurations = pgTable(
  "theme_configurations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    isActive: boolean("is_active").default(true).notNull(),
    accentColor: text("accent_color").default("240 5.9% 10%").notNull(),
    neutralFamily: text("neutral_family").default("zinc").notNull(),
    radiusScale: text("radius_scale").default("0.5rem").notNull(),
    density: text("density").default("comfortable").notNull(),
    motionIntensity: text("motion_intensity").default("normal").notNull(),
    maxWidth: text("max_width").default("1200px").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("theme_config_active_idx").on(table.isActive)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(), // 'create', 'update', 'delete', 'publish', 'login', 'config_change'
    entityType: text("entity_type").notNull(), // 'project', 'prompt', 'section', 'ai_provider'
    entityId: text("entity_id"),
    previousState: jsonb("previous_state"),
    newState: jsonb("new_state"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_events_user_idx").on(table.userId),
    index("audit_events_action_idx").on(table.action),
    index("audit_events_entity_idx").on(table.entityType, table.entityId),
    index("audit_events_created_at_idx").on(table.createdAt),
  ],
);

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const secretReferences = pgTable(
  "secret_references",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(), // e.g. "ai_provider_groq_key"
    encryptedValue: text("encrypted_value").notNull(),
    iv: text("iv").notNull(),
    tag: text("tag").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("secret_refs_key_idx").on(table.key)],
);
