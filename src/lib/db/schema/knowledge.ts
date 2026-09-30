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
  vector,
  customType,
} from "drizzle-orm/pg-core";

/** Embedding width stored in the index. Changing it requires a full re-index. */
export const EMBEDDING_DIMENSIONS = 768;

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

/**
 * One row per indexed unit of knowledge (a project in one language, the CV, an uploaded
 * document...). `source_key` is deterministic, so re-indexing replaces instead of duplicating,
 * and deleting the source deletes its row and (by cascade) every chunk: the assistant forgets it.
 */
export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceKey: text("source_key").notNull(),
    entryId: uuid("entry_id"),
    kind: text("kind").notNull(),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    contentHash: text("content_hash").notNull(),
    status: text("status").notNull().default("ready"),
    error: text("error"),
    chunkCount: integer("chunk_count").notNull().default(0),
    embeddingModel: text("embedding_model").notNull(),
    indexedAt: timestamp("indexed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("knowledge_sources_key_uniq").on(t.sourceKey),
    index("knowledge_sources_entry_idx").on(t.entryId),
    index("knowledge_sources_kind_idx").on(t.kind),
  ],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    kind: text("kind").notNull(),
    locale: text("locale").notNull(),
    heading: text("heading").notNull(),
    text: text("text").notNull(),
    searchText: text("search_text").notNull(),
    tsv: tsvector("tsv")
      .notNull()
      .generatedAlwaysAs(sql`to_tsvector('simple'::regconfig, search_text)`),
    // Nullable on purpose: if the embedding API is down during a save, the chunk is still
    // searchable by keywords and gets its vector later (see repairMissingEmbeddings).
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [
    index("knowledge_chunks_source_idx").on(t.sourceId),
    index("knowledge_chunks_kind_idx").on(t.kind),
    index("knowledge_chunks_tsv_idx").using("gin", t.tsv),
    index("knowledge_chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);
