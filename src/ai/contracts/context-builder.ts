import { z } from "zod";
import { IngestionSourceType, INGESTION_SOURCE_TYPES } from "./ingestion";
import { ScoredCandidate } from "./retrieval";
import { RerankedCandidate } from "./reranker";

export type ContextInputCandidate = ScoredCandidate | RerankedCandidate;

export interface CitationReference {
  citationId: string;
  sourceId: string;
  sourceType: IngestionSourceType;
  title: string;
  locale: "ar" | "en";
  headingHierarchy?: string[] | undefined;
  tags?: string[] | undefined;
  sectionScope?: string | undefined;
}

export interface ContextChunk extends CitationReference {
  id: string;
  content: string;
  score: number;
  rerankScore?: number | undefined;
  estimatedTokens: number;
  rank: number;
  documentId: string;
}

export interface ContextBuilderOptions {
  maxTokens?: number | undefined;
  maxChunks?: number | undefined;
  perSourceCap?: number | undefined;
  deduplicate?: boolean | undefined;
  similarityThreshold?: number | undefined;
  language?: "ar" | "en" | undefined;
}

export interface ContextBuilderTelemetry {
  inputCandidatesCount: number;
  selectedChunksCount: number;
  deduplicatedCount: number;
  perSourceCappedCount: number;
  budgetExceededCount: number;
  totalEstimatedTokens: number;
  maxTokenBudget: number;
  uniqueSourcesCount: number;
  latencyMs: number;
}

export interface ContextBuilderResult {
  formattedContext: string;
  chunks: ContextChunk[];
  availableCitations: CitationReference[];
  telemetry: ContextBuilderTelemetry;
}

export interface ContextBuilderPort {
  buildContext(
    candidates: ContextInputCandidate[],
    options?: ContextBuilderOptions,
  ): Promise<ContextBuilderResult>;
}

export const ContextBuilderOptionsSchema = z.object({
  maxTokens: z.number().int().min(100).max(16000).optional(),
  maxChunks: z.number().int().min(1).max(30).optional(),
  perSourceCap: z.number().int().min(1).max(10).optional(),
  deduplicate: z.boolean().optional(),
  similarityThreshold: z.number().min(0.1).max(1.0).optional(),
  language: z.enum(["ar", "en"]).optional(),
});

export const ContextBuilderTestInputSchema = z.object({
  candidates: z
    .array(
      z.object({
        id: z.string().min(1),
        documentId: z.string().default("doc-test"),
        citationId: z.string().default("cite-test"),
        content: z.string().min(1),
        score: z.number().default(0.5),
        rerankScore: z.number().optional(),
        sourceType: z.enum(INGESTION_SOURCE_TYPES).default("project"),
        sourceId: z.string().default("source-test"),
        title: z.string().default("Test Title"),
        locale: z.enum(["ar", "en"]).default("en"),
        headingHierarchy: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        sectionScope: z.string().optional(),
      }),
    )
    .min(1),
  options: ContextBuilderOptionsSchema.optional(),
});

export type ContextBuilderOptionsInput = z.infer<typeof ContextBuilderOptionsSchema>;
export type ContextBuilderTestInput = z.infer<typeof ContextBuilderTestInputSchema>;
