import { z } from "zod";
import { IngestionSourceType, INGESTION_SOURCE_TYPES } from "./ingestion";

export interface RetrievalFilter {
  sourceType?: IngestionSourceType | IngestionSourceType[] | undefined;
  sourceId?: string | string[] | undefined;
  locale?: "ar" | "en" | undefined;
  sectionScope?: string | undefined;
  tags?: string[] | undefined;
  customFilters?: Record<string, unknown> | undefined;
}

export interface RetrievalQuery {
  text: string;
  locale?: "ar" | "en" | undefined;
  filter?: RetrievalFilter | undefined;
  topK?: number | undefined;
}

export interface ScoredCandidate {
  id: string; // Point ID or chunk ID
  documentId: string;
  citationId: string;
  content: string;
  score: number; // Final fused or raw score
  sourceType: IngestionSourceType;
  sourceId: string;
  title: string;
  locale: "ar" | "en";
  headingHierarchy: string[];
  tags: string[];
  sectionScope?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  retrieverType: "dense" | "sparse" | "hybrid";
  rank?: number | undefined;
  rawDenseScore?: number | undefined;
  rawSparseScore?: number | undefined;
  denseRank?: number | undefined;
  sparseRank?: number | undefined;
  rrfScore?: number | undefined;
}

export interface DenseRetrieverPort {
  retrieve(query: RetrievalQuery, options?: { topK?: number }): Promise<ScoredCandidate[]>;
}

export interface SparseRetrieverPort {
  retrieve(query: RetrievalQuery, options?: { topK?: number }): Promise<ScoredCandidate[]>;
}

export interface FusionOptions {
  rrfK?: number | undefined;
  candidateCap?: number | undefined;
  minScoreThreshold?: number | undefined;
  alpha?: number | undefined;
}

export interface FusionStrategyPort {
  fuse(
    denseCandidates: ScoredCandidate[],
    sparseCandidates: ScoredCandidate[],
    options?: FusionOptions,
  ): ScoredCandidate[];
}

export interface HybridRetrievalOptions {
  denseEnabled?: boolean | undefined;
  sparseEnabled?: boolean | undefined;
  denseTopK?: number | undefined;
  sparseTopK?: number | undefined;
  rrfK?: number | undefined;
  candidateCap?: number | undefined;
  minScoreThreshold?: number | undefined;
  fusionStrategy?: "rrf" | "linear" | undefined;
  hybridAlpha?: number | undefined;
  filter?: RetrievalFilter | undefined;
}

export interface RetrievalTelemetry {
  denseCandidateCount: number;
  sparseCandidateCount: number;
  fusedCandidateCount: number;
  denseLatencyMs: number;
  sparseLatencyMs: number;
  fusionLatencyMs: number;
  totalLatencyMs: number;
  filterApplied?: Record<string, unknown> | undefined;
}

export interface HybridRetrievalResult {
  candidates: ScoredCandidate[];
  telemetry: RetrievalTelemetry;
}

export const HybridSearchSchema = z.object({
  query: z.string().min(1).max(1000),
  mode: z.enum(["hybrid", "dense", "sparse"]).default("hybrid"),
  locale: z.enum(["ar", "en"]).optional(),
  sourceType: z.enum(INGESTION_SOURCE_TYPES).optional(),
  sourceId: z.string().optional(),
  topK: z.number().int().min(1).max(50).default(10),
  rrfK: z.number().int().min(1).max(200).default(60),
  candidateCap: z.number().int().min(1).max(100).default(20),
  minScoreThreshold: z.number().min(0).max(1).optional(),
});

export type HybridSearchInput = z.infer<typeof HybridSearchSchema>;
