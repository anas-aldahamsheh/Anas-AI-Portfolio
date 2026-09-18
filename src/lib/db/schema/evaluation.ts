import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const evaluationDatasets = pgTable("evaluation_datasets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const evaluationCases = pgTable(
  "evaluation_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => evaluationDatasets.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    expectedAnswer: text("expected_answer"),
    contextGroundTruth: text("context_ground_truth"),
    localeCode: text("locale_code").default("en").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("eval_cases_dataset_idx").on(table.datasetId)],
);

export const evaluationRuns = pgTable(
  "evaluation_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => evaluationDatasets.id, { onDelete: "cascade" }),
    promptVersionId: uuid("prompt_version_id"),
    modelId: text("model_id").notNull(),
    gitCommit: text("git_commit"),
    triggeredBy: text("triggered_by").default("automated").notNull(),
    status: text("status").default("pending").notNull(), // 'pending', 'running', 'completed', 'failed'
    runAt: timestamp("run_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("eval_runs_dataset_idx").on(table.datasetId),
    index("eval_runs_status_idx").on(table.status),
  ],
);

export const evaluationResults = pgTable(
  "evaluation_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    runId: uuid("run_id")
      .notNull()
      .references(() => evaluationRuns.id, { onDelete: "cascade" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => evaluationCases.id, { onDelete: "cascade" }),
    generatedResponse: text("generated_response").notNull(),
    retrievedContext: jsonb("retrieved_context"),
    latencyMs: integer("latency_ms"),
    tokenCount: integer("token_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("eval_results_run_idx").on(table.runId),
    index("eval_results_case_idx").on(table.caseId),
  ],
);

export const evaluationMetrics = pgTable(
  "evaluation_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resultId: uuid("result_id")
      .notNull()
      .references(() => evaluationResults.id, { onDelete: "cascade" }),
    metricName: text("metric_name").notNull(), // 'faithfulness', 'answer_relevance', 'context_recall'
    score: text("score").notNull(), // formatted score string (e.g. "0.95")
    passed: boolean("passed").default(true).notNull(),
    reason: text("reason"),
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("eval_metrics_result_idx").on(table.resultId),
    index("eval_metrics_metric_idx").on(table.metricName),
  ],
);
