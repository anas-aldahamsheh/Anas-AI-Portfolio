import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * Fixed-window counters for rate limiting, shared by every serverless instance.
 * Rows are tiny and expire naturally (old windows are pruned opportunistically).
 */
export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.key, t.windowStart] }),
    index("rate_limit_window_idx").on(t.windowStart),
  ],
);

/**
 * What visitors ask the assistant, so the owner can see what recruiters care about.
 * No IPs or identities are stored: `visitor` is a salted hash that only groups one conversation.
 */
export const assistantTurns = pgTable(
  "assistant_turns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: text("conversation_id").notNull(),
    visitor: text("visitor").notNull(),
    locale: text("locale").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    toolCalls: jsonb("tool_calls").$type<{ name: string; args: unknown }[]>().notNull().default([]),
    sources: jsonb("sources")
      .$type<{ title: string; url?: string | null }[]>()
      .notNull()
      .default([]),
    model: text("model"),
    latencyMs: integer("latency_ms"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("assistant_turns_created_idx").on(t.createdAt),
    index("assistant_turns_conversation_idx").on(t.conversationId),
  ],
);
