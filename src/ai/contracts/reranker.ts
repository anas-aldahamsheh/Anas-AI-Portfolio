import { z } from "zod";
import { IngestionSourceType, INGESTION_SOURCE_TYPES } from "./ingestion";
import { ScoredCandidate } from "./retrieval";

export type RerankFallbackPolicy = "degrade_to_fused_ordering" | "fail_safely";
export type ScoreCalibrationMethod = "sigmoid" | "min_max" | "raw";

export interface RerankCandidate {
  id: string;
  documentId: string;
  citationId: string;
  content: string;
  score: number;
  sourceType: IngestionSourceType;
  sourceId: string;
  title: string;
  locale: "ar" | "en";
  headingHierarchy?: string[] | undefined;
  tags?: string[] | undefined;
  sectionScope?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  originalCandidate?: ScoredCandidate | undefined;
}

export interface RerankedCandidate extends RerankCandidate {
  rerankScore: number;
  rawRerankScore?: number | undefined;
  rerankRank: number;
  previousRank?: number | undefined;
}

export interface RerankOptions {
  topN?: number | undefined;
  minThreshold?: number | undefined;
  candidateCap?: number | undefined;
  batchSize?: number | undefined;
  timeoutMs?: number | undefined;
  fallbackPolicy?: RerankFallbackPolicy | undefined;
  scoreCalibration?: ScoreCalibrationMethod | undefined;
}

export interface RerankTelemetry {
  inputCandidateCount: number;
  outputCandidateCount: number;
  rerankerModel: string;
  provider: string;
  strategy: "bge_remote" | "lexical_calibrated" | "fused_fallback";
  latencyMs: number;
  fallbackApplied: boolean;
  fallbackReason?: string | undefined;
  topScore?: number | undefined;
  minScore?: number | undefined;
}

export interface RerankResult {
  candidates: RerankedCandidate[];
  telemetry: RerankTelemetry;
}

export interface RerankerPort {
  readonly modelName: string;
  rerank(
    query: string,
    candidates: ScoredCandidate[],
    options?: RerankOptions,
  ): Promise<RerankResult>;
  healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    model: string;
    error?: string | undefined;
  }>;
}

export const RerankCandidateInputSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().default("doc-generic"),
  citationId: z.string().default("cite-generic"),
  content: z.string().min(1),
  score: z.number().default(0.5),
  sourceType: z.enum(INGESTION_SOURCE_TYPES).default("project"),
  sourceId: z.string().default("source-generic"),
  title: z.string().default("Untitled"),
  locale: z.enum(["ar", "en"]).default("en"),
  headingHierarchy: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sectionScope: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const RerankTestInputSchema = z.object({
  query: z.string().min(1).max(1000),
  candidates: z.array(RerankCandidateInputSchema).min(1).max(50),
  topN: z.number().int().min(1).max(20).optional(),
  minThreshold: z.number().min(0).max(1).optional(),
  fallbackPolicy: z.enum(["degrade_to_fused_ordering", "fail_safely"]).optional(),
  scoreCalibration: z.enum(["sigmoid", "min_max", "raw"]).optional(),
});

export type RerankCandidateInput = z.infer<typeof RerankCandidateInputSchema>;
export type RerankTestInput = z.infer<typeof RerankTestInputSchema>;
