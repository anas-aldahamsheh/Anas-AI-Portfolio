import { ScoredCandidate } from "@/ai/contracts/retrieval";
import {
  RerankedCandidate,
  RerankOptions,
  RerankResult,
  RerankTelemetry,
} from "@/ai/contracts/reranker";
import { tokenizeMultilingual } from "@/ai/retrieval/sparse/arabic-bm25-tokenizer";

/**
 * Deterministic heuristic reranker providing offline and fallback cross-scoring.
 * Combines prior candidate retrieval score with bilingual keyword coverage,
 * title/heading matches, and exact phrase boosts without requiring an external service.
 */
export class HeuristicReranker {
  public readonly modelName: string = "heuristic-lexical-reranker";

  public rerank(
    query: string,
    candidates: ScoredCandidate[],
    options?: RerankOptions,
  ): RerankResult {
    const startTime = Date.now();
    const topN = options?.topN ?? 5;
    const minThreshold = options?.minThreshold ?? 0.0;
    const candidateCap = options?.candidateCap ?? 20;

    if (!candidates || candidates.length === 0) {
      return {
        candidates: [],
        telemetry: {
          inputCandidateCount: 0,
          outputCandidateCount: 0,
          rerankerModel: this.modelName,
          provider: "local_heuristic",
          strategy: "lexical_calibrated",
          latencyMs: Date.now() - startTime,
          fallbackApplied: true,
          fallbackReason: "empty_candidates",
        },
      };
    }

    const cappedCandidates = candidates.slice(0, candidateCap);
    const queryClean = query.trim().toLowerCase();
    const queryTokens = tokenizeMultilingual(query);

    // Score each candidate
    const scored: Array<{
      candidate: ScoredCandidate;
      calibratedScore: number;
      rawScore: number;
      previousRank: number;
    }> = cappedCandidates.map((cand, idx) => {
      const contentTokens = tokenizeMultilingual(cand.content);
      const titleTokens = tokenizeMultilingual(cand.title);
      const headingTokens = (cand.headingHierarchy ?? []).flatMap((h) => tokenizeMultilingual(h));

      // Overlap ratio with query tokens
      let overlapCount = 0;
      const contentSet = new Set(contentTokens);
      for (const token of queryTokens) {
        if (contentSet.has(token)) {
          overlapCount++;
        }
      }
      const overlapRatio = queryTokens.length > 0 ? overlapCount / queryTokens.length : 0;

      // Title & heading match bonuses
      let titleBonus = 0;
      const titleSet = new Set(titleTokens);
      for (const token of queryTokens) {
        if (titleSet.has(token)) {
          titleBonus += 0.1;
        }
      }

      let headingBonus = 0;
      const headingSet = new Set(headingTokens);
      for (const token of queryTokens) {
        if (headingSet.has(token)) {
          headingBonus += 0.05;
        }
      }

      // Exact substring match bonus
      let phraseBonus = 0;
      if (queryClean.length > 3 && cand.content.toLowerCase().includes(queryClean)) {
        phraseBonus = 0.2;
      }

      // Normalize prior score to [0, 1]
      const priorScore = Math.min(1.0, Math.max(0.0, cand.score));

      // Composite heuristic calibration
      const rawScore =
        0.35 * priorScore +
        0.35 * overlapRatio +
        0.15 * Math.min(1.0, titleBonus) +
        0.1 * Math.min(1.0, headingBonus) +
        0.05 * phraseBonus;

      const calibratedScore = Math.min(1.0, Math.max(0.0, rawScore));

      return {
        candidate: cand,
        calibratedScore,
        rawScore,
        previousRank: idx + 1,
      };
    });

    // Sort descending by calibrated score
    scored.sort((a, b) => b.calibratedScore - a.calibratedScore);

    // Apply minimum threshold
    const filtered = scored.filter((s) => s.calibratedScore >= minThreshold);

    // Truncate to topN
    const selected = filtered.slice(0, topN);

    // Map to RerankedCandidate
    const rerankedCandidates: RerankedCandidate[] = selected.map((item, idx) => ({
      ...item.candidate,
      rerankScore: Number(item.calibratedScore.toFixed(4)),
      rawRerankScore: Number(item.rawScore.toFixed(4)),
      rerankRank: idx + 1,
      previousRank: item.previousRank,
      originalCandidate: item.candidate,
    }));

    const latencyMs = Date.now() - startTime;
    const telemetry: RerankTelemetry = {
      inputCandidateCount: candidates.length,
      outputCandidateCount: rerankedCandidates.length,
      rerankerModel: this.modelName,
      provider: "local_heuristic",
      strategy: "lexical_calibrated",
      latencyMs,
      fallbackApplied: true,
      fallbackReason: options?.fallbackPolicy
        ? `policy_${options.fallbackPolicy}`
        : "heuristic_fallback",
      topScore: rerankedCandidates[0]?.rerankScore,
      minScore: rerankedCandidates[rerankedCandidates.length - 1]?.rerankScore,
    };

    return {
      candidates: rerankedCandidates,
      telemetry,
    };
  }
}

export const heuristicReranker = new HeuristicReranker();
