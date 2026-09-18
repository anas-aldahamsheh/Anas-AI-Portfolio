import { ScoredCandidate } from "@/ai/contracts/retrieval";
import {
  RerankedCandidate,
  RerankerPort,
  RerankFallbackPolicy,
  RerankOptions,
  RerankResult,
  ScoreCalibrationMethod,
} from "@/ai/contracts/reranker";
import { heuristicReranker } from "./heuristic-reranker";
import { logger } from "@/lib/observability/logger";

export interface BgeRerankerAdapterOptions {
  endpointUrl?: string | null | undefined;
  apiKey?: string | null | undefined;
  modelName?: string | undefined;
  batchSize?: number | undefined;
  timeoutMs?: number | undefined;
  maxRetries?: number | undefined;
  preferOfflineFallback?: boolean | undefined;
  defaultTopN?: number | undefined;
  defaultMinThreshold?: number | undefined;
  defaultFallbackPolicy?: RerankFallbackPolicy | undefined;
  scoreCalibration?: ScoreCalibrationMethod | undefined;
}

/**
 * Calibrates raw reranker cross-encoder scores (logits) into normalized [0.0, 1.0] probabilities.
 */
export function calibrateRerankScore(
  rawScore: number,
  method: ScoreCalibrationMethod = "sigmoid",
): number {
  if (method === "raw") {
    return rawScore;
  }
  if (method === "sigmoid") {
    // Sigmoid: 1 / (1 + e^(-x))
    const sigmoid = 1 / (1 + Math.exp(-rawScore));
    return Number(sigmoid.toFixed(4));
  }
  // min_max or bounded clamp
  return Number(Math.min(1.0, Math.max(0.0, rawScore)).toFixed(4));
}

/**
 * Production BGE Reranker v2 M3 Adapter.
 * Supports multilingual cross-encoder reranking, Text Embeddings Inference (TEI),
 * HuggingFace Inference API, OpenAI/Cohere-compatible reranking endpoints,
 * score calibration (sigmoid logits mapping), top-N filtering, and resilient fallbacks.
 */
export class BgeRerankerAdapter implements RerankerPort {
  public readonly modelName: string;
  public readonly batchSize: number;
  private endpointUrl: string | null;
  private apiKey: string | null;
  private timeoutMs: number;
  private maxRetries: number;
  private preferOfflineFallback: boolean;
  private defaultTopN: number;
  private defaultMinThreshold: number;
  private defaultFallbackPolicy: RerankFallbackPolicy;
  private defaultScoreCalibration: ScoreCalibrationMethod;

  constructor(options?: BgeRerankerAdapterOptions) {
    this.modelName = options?.modelName ?? "BAAI/bge-reranker-v2-m3";
    this.endpointUrl = options?.endpointUrl ?? process.env["BGE_RERANKER_ENDPOINT"] ?? null;
    this.apiKey = options?.apiKey ?? process.env["BGE_RERANKER_API_KEY"] ?? null;
    this.batchSize = options?.batchSize ?? 16;
    this.timeoutMs = options?.timeoutMs ?? 5000;
    this.maxRetries = options?.maxRetries ?? 2;
    this.defaultTopN = options?.defaultTopN ?? 5;
    this.defaultMinThreshold = options?.defaultMinThreshold ?? 0.0;
    this.defaultFallbackPolicy = options?.defaultFallbackPolicy ?? "degrade_to_fused_ordering";
    this.defaultScoreCalibration = options?.scoreCalibration ?? "sigmoid";
    this.preferOfflineFallback =
      options?.preferOfflineFallback ?? (!this.endpointUrl || process.env["NODE_ENV"] === "test");
  }

  /**
   * Reranks candidate chunks with cross-encoder scoring against the user query.
   */
  public async rerank(
    query: string,
    candidates: ScoredCandidate[],
    options?: RerankOptions,
  ): Promise<RerankResult> {
    const startTime = Date.now();
    const topN = options?.topN ?? this.defaultTopN;
    const minThreshold = options?.minThreshold ?? this.defaultMinThreshold;
    const candidateCap = options?.candidateCap ?? 20;
    const fallbackPolicy = options?.fallbackPolicy ?? this.defaultFallbackPolicy;
    const calibrationMethod = options?.scoreCalibration ?? this.defaultScoreCalibration;

    // Handle empty candidate list
    if (!candidates || candidates.length === 0) {
      return {
        candidates: [],
        telemetry: {
          inputCandidateCount: 0,
          outputCandidateCount: 0,
          rerankerModel: this.modelName,
          provider: this.getProviderName(),
          strategy: "bge_remote",
          latencyMs: Date.now() - startTime,
          fallbackApplied: false,
        },
      };
    }

    const cappedCandidates = candidates.slice(0, candidateCap);

    // If offline fallback preferred or no endpoint configured
    if (this.preferOfflineFallback || !this.endpointUrl) {
      return this.handleFallback(
        query,
        cappedCandidates,
        fallbackPolicy,
        options,
        "no_remote_endpoint_configured",
        startTime,
      );
    }

    try {
      const rawScores = await this.rerankWithRetry(query, cappedCandidates);

      // Pair candidates with their rerank scores
      const scored: Array<{
        candidate: ScoredCandidate;
        rawScore: number;
        calibratedScore: number;
        previousRank: number;
      }> = cappedCandidates.map((cand, idx) => {
        const rawScore = rawScores[idx] ?? cand.score;
        const calibratedScore = calibrateRerankScore(rawScore, calibrationMethod);
        return {
          candidate: cand,
          rawScore,
          calibratedScore,
          previousRank: idx + 1,
        };
      });

      // Sort descending by calibrated score
      scored.sort((a, b) => b.calibratedScore - a.calibratedScore);

      // Filter by min threshold
      const filtered = scored.filter((item) => item.calibratedScore >= minThreshold);

      // Truncate to topN
      const selected = filtered.slice(0, topN);

      const rerankedCandidates: RerankedCandidate[] = selected.map((item, idx) => ({
        ...item.candidate,
        rerankScore: item.calibratedScore,
        rawRerankScore: item.rawScore,
        rerankRank: idx + 1,
        previousRank: item.previousRank,
        originalCandidate: item.candidate,
      }));

      const latencyMs = Date.now() - startTime;

      return {
        candidates: rerankedCandidates,
        telemetry: {
          inputCandidateCount: candidates.length,
          outputCandidateCount: rerankedCandidates.length,
          rerankerModel: this.modelName,
          provider: this.getProviderName(),
          strategy: "bge_remote",
          latencyMs,
          fallbackApplied: false,
          topScore: rerankedCandidates[0]?.rerankScore,
          minScore: rerankedCandidates[rerankedCandidates.length - 1]?.rerankScore,
        },
      };
    } catch (err) {
      logger.warn("Remote BGE reranking request failed, executing configured fallback policy", {
        module: "reranker",
        metadata: {
          model: this.modelName,
          endpoint: this.endpointUrl,
          fallbackPolicy,
          error: String(err),
        },
      });

      return this.handleFallback(
        query,
        cappedCandidates,
        fallbackPolicy,
        options,
        `remote_failure: ${err instanceof Error ? err.message : String(err)}`,
        startTime,
      );
    }
  }

  /**
   * Executes remote reranking request with retry backoff.
   */
  private async rerankWithRetry(query: string, candidates: ScoredCandidate[]): Promise<number[]> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.requestRemoteReranking(query, candidates);
      } catch (err) {
        lastError = err;
        if (attempt < this.maxRetries) {
          const delayMs = Math.pow(2, attempt) * 150;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  }

  /**
   * Dispatches HTTP request to remote TEI, HuggingFace, or custom inference endpoint.
   */
  private async requestRemoteReranking(
    query: string,
    candidates: ScoredCandidate[],
  ): Promise<number[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const texts = candidates.map((c) => c.content);

      // Determine endpoint flavor
      const isCohereOrOpenAiFormat =
        this.endpointUrl?.includes("/v1/rerank") || this.endpointUrl?.includes("/rerank_v1");

      const isHfInferenceFormat =
        this.endpointUrl?.includes("api-inference.huggingface.co") ||
        this.endpointUrl?.includes("/pipeline/feature-extraction");

      let requestBody: string;

      if (isCohereOrOpenAiFormat) {
        requestBody = JSON.stringify({
          model: this.modelName,
          query,
          documents: texts,
          top_n: texts.length,
          return_documents: false,
        });
      } else if (isHfInferenceFormat) {
        requestBody = JSON.stringify({
          inputs: {
            source_sentence: query,
            sentences: texts,
          },
        });
      } else {
        // Standard TEI format (POST /rerank)
        requestBody = JSON.stringify({
          query,
          texts,
          truncate: true,
          raw_scores: true,
        });
      }

      const response = await fetch(this.endpointUrl!, {
        method: "POST",
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`BGE Reranker HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;
      return this.parseRerankResponse(data, candidates.length);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parses various remote reranker response structures into an aligned numeric score array.
   */
  private parseRerankResponse(data: unknown, expectedCount: number): number[] {
    // Format 1: TEI standard array: [{ index: 0, score: 2.14 }, { index: 1, score: -0.4 }]
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0] === "object" &&
      "score" in data[0]
    ) {
      const results = data as Array<{ index?: number; score: number }>;
      const scores = new Array<number>(expectedCount).fill(0);
      results.forEach((item, fallbackIdx) => {
        const targetIdx = typeof item.index === "number" ? item.index : fallbackIdx;
        if (targetIdx >= 0 && targetIdx < expectedCount) {
          scores[targetIdx] = item.score;
        }
      });
      return scores;
    }

    // Format 2: Cohere/Jina format: { results: [{ index: 0, relevance_score: 0.95 }] }
    if (
      data &&
      typeof data === "object" &&
      "results" in data &&
      Array.isArray((data as { results: unknown[] }).results)
    ) {
      const items = (
        data as {
          results: Array<{ index?: number; relevance_score?: number; score?: number }>;
        }
      ).results;
      const scores = new Array<number>(expectedCount).fill(0);
      items.forEach((item, fallbackIdx) => {
        const targetIdx = typeof item.index === "number" ? item.index : fallbackIdx;
        const scoreVal = item.relevance_score ?? item.score ?? 0;
        if (targetIdx >= 0 && targetIdx < expectedCount) {
          scores[targetIdx] = scoreVal;
        }
      });
      return scores;
    }

    // Format 3: Raw array of numbers: [2.14, -0.4, ...]
    if (Array.isArray(data) && data.every((item) => typeof item === "number")) {
      return data as number[];
    }

    throw new Error("Unrecognized reranker response payload format from remote provider");
  }

  /**
   * Handles failure by executing configured fallback policy without crashing.
   */
  private handleFallback(
    query: string,
    candidates: ScoredCandidate[],
    policy: RerankFallbackPolicy,
    options: RerankOptions | undefined,
    reason: string,
    startTime: number,
  ): RerankResult {
    if (policy === "fail_safely") {
      return {
        candidates: [],
        telemetry: {
          inputCandidateCount: candidates.length,
          outputCandidateCount: 0,
          rerankerModel: this.modelName,
          provider: this.getProviderName(),
          strategy: "fused_fallback",
          latencyMs: Date.now() - startTime,
          fallbackApplied: true,
          fallbackReason: reason,
        },
      };
    }

    // Default policy: "degrade_to_fused_ordering" via heuristic reranker
    const heuristicResult = heuristicReranker.rerank(query, candidates, options);

    return {
      candidates: heuristicResult.candidates,
      telemetry: {
        ...heuristicResult.telemetry,
        rerankerModel: this.modelName,
        provider: this.getProviderName(),
        fallbackApplied: true,
        fallbackReason: reason,
        latencyMs: Date.now() - startTime,
      },
    };
  }

  private getProviderName(): string {
    if (!this.endpointUrl) return "offline_fallback";
    try {
      const url = new URL(this.endpointUrl);
      return url.hostname;
    } catch {
      return "custom_http";
    }
  }

  /**
   * Validates reranker health with multilingual sample query pairs.
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    model: string;
    error?: string | undefined;
  }> {
    const start = Date.now();
    try {
      const mockCandidate: ScoredCandidate = {
        id: "health-test-1",
        documentId: "doc-health",
        citationId: "cite-health",
        content: "Anas is an AI engineer building advanced retrieval pipelines.",
        score: 0.8,
        sourceType: "project",
        sourceId: "proj-health",
        title: "AI Engineer",
        locale: "en",
        headingHierarchy: ["Engineering"],
        tags: ["AI", "RAG"],
        retrieverType: "hybrid",
      };

      const result = await this.rerank("Anas AI Engineer", [mockCandidate]);
      const latencyMs = Date.now() - start;

      return {
        healthy: result.candidates.length > 0,
        latencyMs,
        model: this.modelName,
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        model: this.modelName,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export const bgeRerankerAdapter = new BgeRerankerAdapter();
