import { z } from "zod";

export type MetricCategory = "retrieval" | "generation" | "latency" | "parity";
export type MetricStatus = "passed" | "warning" | "failed";

export interface EvaluationMetricItem {
  id: string;
  name: string;
  label: string;
  value: number;
  formattedValue: string;
  unit: string;
  targetThreshold: number;
  status: MetricStatus;
  category: MetricCategory;
  description: string;
}

export interface EvaluationRunSummary {
  id: string;
  datasetId: string;
  datasetName: string;
  modelId: string;
  promptVersion: string;
  gitCommit?: string | undefined;
  status: "completed" | "running" | "failed" | "pending";
  runAt: string;
  completedAt?: string | undefined;
  totalCases: number;
  passedCases: number;
  passRate: number;
  averageLatencyMs: number;
  metrics: {
    recallAt5: number;
    precisionAt5: number;
    mrr: number;
    ndcgAt5?: number | undefined;
    faithfulness: number;
    citationCorrectness: number;
    answerRelevance: number;
    insufficientEvidenceAccuracy: number;
  };
  failureBreakdown: {
    unsupportedClaim: number;
    missingCitation: number;
    retrievalMiss: number;
    timeoutOrError: number;
  };
}

export interface RegressionDelta {
  baseline: number;
  candidate: number;
  delta: number;
  status: "improved" | "regressed" | "stable";
}

export interface RegressionComparison {
  baselineRun: EvaluationRunSummary;
  candidateRun: EvaluationRunSummary;
  deltas: Record<string, RegressionDelta>;
  hasRegression: boolean;
  regressionCount: number;
  improvementCount: number;
}

export interface DatasetSpecification {
  name: string;
  casesCount: number;
  languages: string[];
  focus: string;
}

export interface EvaluationMethodology {
  principles: string[];
  datasetSpecs: DatasetSpecification[];
  evaluationGates: string[];
}

export interface LanguageParitySummary {
  arabicScore: number;
  englishScore: number;
  parityRatio: number;
  status: "balanced" | "slight_gap" | "imbalanced";
}

export interface ActiveEnvironmentInfo {
  generationModel: string;
  embeddingModel: string;
  rerankerModel: string;
  retrievalPolicy: string;
}

export interface EvaluationDashboardData {
  aggregateMetrics: EvaluationMetricItem[];
  methodology: EvaluationMethodology;
  recentRuns: EvaluationRunSummary[];
  activeBaselineRun: EvaluationRunSummary;
  languageParity: LanguageParitySummary;
  activeEnvironment: ActiveEnvironmentInfo;
}

export const CompareRunsRequestSchema = z.object({
  baselineId: z.string().min(1),
  candidateId: z.string().min(1),
});

export type CompareRunsRequest = z.infer<typeof CompareRunsRequestSchema>;

export type EvaluationCategory =
  | "retrieval"
  | "generation"
  | "negative_refusal"
  | "security_injection"
  | "project_scoped";

export interface EvaluationCaseItem {
  id: string;
  datasetId: string;
  query: string;
  localeCode: "ar" | "en";
  category: EvaluationCategory;
  expectedSourceIds?: string[] | undefined;
  expectedKeywords?: string[] | undefined;
  expectedSupportedFacts?: string[] | undefined;
  prohibitedUnsupportedClaims?: string[] | undefined;
  expectedRefusal?: boolean | undefined;
  projectSlug?: string | undefined;
}

export interface EvaluationCaseResult {
  caseId: string;
  query: string;
  localeCode: "ar" | "en";
  category: EvaluationCategory;
  passed: boolean;
  latencyMs: number;
  metrics: {
    recallAtK?: number | undefined;
    precisionAtK?: number | undefined;
    mrr?: number | undefined;
    faithfulness?: number | undefined;
    citationCorrectness?: number | undefined;
    answerRelevance?: number | undefined;
    refusalCorrectness?: number | undefined;
  };
  failureReason?: string | undefined;
  retrievedSourceIds?: string[] | undefined;
  generatedAnswer?: string | undefined;
}

export type GateVerdict = "PASSED" | "BLOCKED" | "WARNING";

export interface EvaluationGateDecision {
  verdict: GateVerdict;
  passed: boolean;
  message: string;
  regressions: string[];
  warnings: string[];
  metricsSummary: {
    recallAt5: number;
    precisionAt5: number;
    mrr: number;
    faithfulness: number;
    citationCorrectness: number;
    arabicParityRatio: number;
    averageLatencyMs: number;
  };
}

export const RunEvaluationRequestSchema = z.object({
  datasetId: z.string().optional().default("ds-golden-v1"),
  mode: z.enum(["full", "retrieval", "generation"]).optional().default("full"),
  modelId: z.string().optional(),
  promptVersionId: z.string().optional(),
  maxCases: z.number().int().min(1).max(100).optional(),
});

export type RunEvaluationRequest = z.infer<typeof RunEvaluationRequestSchema>;

export interface EvaluationRunExecutionResponse {
  run: EvaluationRunSummary;
  gate: EvaluationGateDecision;
  caseResults: EvaluationCaseResult[];
}

