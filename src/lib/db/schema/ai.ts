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

export const aiProviders = pgTable(
  "ai_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    providerType: text("provider_type").notNull(), // 'openai_compatible', 'anthropic', 'custom_http'
    baseUrl: text("base_url").notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("ai_providers_name_idx").on(table.name)],
);

export const aiModels = pgTable(
  "ai_models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => aiProviders.id, { onDelete: "cascade" }),
    modelId: text("model_id").notNull(), // e.g. "BAAI/bge-m3"
    capability: text("capability").notNull(), // 'generation', 'embedding', 'reranking'
    isEnabled: boolean("is_enabled").default(true).notNull(),
    contextWindow: integer("context_window"),
    maxOutputTokens: integer("max_output_tokens"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ai_models_provider_idx").on(table.providerId),
    index("ai_models_capability_idx").on(table.capability),
  ],
);

export const aiModelAssignments = pgTable(
  "ai_model_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    capability: text("capability").notNull(), // 'generation', 'embedding', 'reranking'
    modelId: uuid("model_id")
      .notNull()
      .references(() => aiModels.id, { onDelete: "cascade" }),
    environment: text("environment").default("production").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("ai_assignment_cap_env_uniq").on(table.capability, table.environment),
    index("ai_assignment_model_idx").on(table.modelId),
  ],
);

export const aiRuntimePolicies = pgTable("ai_runtime_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  timeoutMs: integer("timeout_ms").default(30000).notNull(),
  maxRetries: integer("max_retries").default(2).notNull(),
  rateLimitRpm: integer("rate_limit_rpm").default(30).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("prompts_slug_idx").on(table.slug)],
);

export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    systemPrompt: text("system_prompt").notNull(),
    userTemplate: text("user_template"),
    isActive: boolean("is_active").default(false).notNull(),
    changelog: text("changelog"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("prompt_ver_prompt_num_uniq").on(table.promptId, table.versionNumber),
    index("prompt_ver_prompt_idx").on(table.promptId),
    index("prompt_ver_active_idx").on(table.isActive),
  ],
);

export const ragConfigurations = pgTable(
  "rag_configurations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    isCurrent: boolean("is_current").default(false).notNull(),
    chunkSize: integer("chunk_size").default(512).notNull(),
    chunkOverlap: integer("chunk_overlap").default(64).notNull(),
    topK: integer("top_k").default(10).notNull(),
    rerankTopN: integer("rerank_top_n").default(5).notNull(),
    rerankThreshold: text("rerank_threshold").default("0.3").notNull(),
    hybridAlpha: text("hybrid_alpha").default("0.5").notNull(),
    contextTokenBudget: integer("context_token_budget").default(3000).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("rag_config_current_idx").on(table.isCurrent)],
);

export const ragIndexVersions = pgTable(
  "rag_index_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    versionTag: text("version_tag").notNull().unique(), // e.g. "v1.0.0-bge-m3"
    embeddingModel: text("embedding_model").notNull(),
    denseDimension: integer("dense_dimension").default(1024).notNull(),
    isCurrent: boolean("is_current").default(false).notNull(),
    indexedChunkCount: integer("indexed_chunk_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("rag_index_current_idx").on(table.isCurrent)],
);

export const ingestionJobs = pgTable(
  "ingestion_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
    indexVersionId: uuid("index_version_id")
      .notNull()
      .references(() => ragIndexVersions.id, { onDelete: "cascade" }),
    totalDocuments: integer("total_documents").default(0).notNull(),
    processedDocuments: integer("processed_documents").default(0).notNull(),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("ingestion_jobs_status_idx").on(table.status)],
);

export const sourceDocuments = pgTable(
  "source_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceType: text("source_type").notNull(), // 'project', 'cv', 'page', 'section'
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    contentHash: text("content_hash").notNull(),
    localeCode: text("locale_code").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("source_docs_type_id_idx").on(table.sourceType, table.sourceId),
    index("source_docs_hash_idx").on(table.contentHash),
  ],
);

export const sourceChunks = pgTable(
  "source_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => sourceDocuments.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull(),
    qdrantPointId: text("qdrant_point_id").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("source_chunks_doc_idx").on(table.documentId),
    index("source_chunks_qdrant_idx").on(table.qdrantPointId),
  ],
);
