import { FusionOptions, FusionStrategyPort, ScoredCandidate } from "@/ai/contracts/retrieval";

interface FusedCandidateAccumulator {
  candidate: ScoredCandidate;
  rrfScore: number;
  denseRank?: number | undefined;
  sparseRank?: number | undefined;
  rawDenseScore?: number | undefined;
  rawSparseScore?: number | undefined;
}

/**
 * Standard Reciprocal Rank Fusion (RRF) algorithm.
 * Combines ranking from dense and sparse retrieval stages without requiring score calibration.
 * Formula: RRF(d) = sum_{m in {dense, sparse}} 1 / (k + rank_m(d))
 */
export class ReciprocalRankFusion implements FusionStrategyPort {
  private defaultK: number;

  constructor(defaultK: number = 60) {
    this.defaultK = defaultK;
  }

  public fuse(
    denseCandidates: ScoredCandidate[],
    sparseCandidates: ScoredCandidate[],
    options?: FusionOptions,
  ): ScoredCandidate[] {
    const k = options?.rrfK ?? this.defaultK;
    const candidateCap = options?.candidateCap ?? 20;
    const minThreshold = options?.minScoreThreshold ?? 0.0;

    const merged = new Map<string, FusedCandidateAccumulator>();

    // Process dense candidates
    denseCandidates.forEach((cand, idx) => {
      const rank = idx + 1;
      const scoreContribution = 1.0 / (k + rank);

      merged.set(cand.id, {
        candidate: cand,
        rrfScore: scoreContribution,
        denseRank: rank,
        rawDenseScore: cand.score,
      });
    });

    // Process sparse candidates
    sparseCandidates.forEach((cand, idx) => {
      const rank = idx + 1;
      const scoreContribution = 1.0 / (k + rank);

      const existing = merged.get(cand.id);
      if (existing) {
        existing.rrfScore += scoreContribution;
        existing.sparseRank = rank;
        existing.rawSparseScore = cand.score;
        // Merge metadata if needed
        if (!existing.candidate.sectionScope && cand.sectionScope) {
          existing.candidate.sectionScope = cand.sectionScope;
        }
      } else {
        merged.set(cand.id, {
          candidate: cand,
          rrfScore: scoreContribution,
          sparseRank: rank,
          rawSparseScore: cand.score,
        });
      }
    });

    // Convert to sorted candidate list
    const items = Array.from(merged.values());
    items.sort((a, b) => b.rrfScore - a.rrfScore);

    const filtered = items.filter((item) => item.rrfScore >= minThreshold);

    return filtered.slice(0, candidateCap).map((item, index) => {
      const inDense = item.denseRank !== undefined;
      const inSparse = item.sparseRank !== undefined;
      const retrieverType: "dense" | "sparse" | "hybrid" =
        inDense && inSparse ? "hybrid" : inDense ? "dense" : "sparse";

      return {
        ...item.candidate,
        score: item.rrfScore,
        rrfScore: item.rrfScore,
        rank: index + 1,
        retrieverType,
        denseRank: item.denseRank,
        sparseRank: item.sparseRank,
        rawDenseScore: item.rawDenseScore,
        rawSparseScore: item.rawSparseScore,
      };
    });
  }
}

/**
 * Linear Score Fusion strategy (Score = alpha * normDense + (1 - alpha) * normSparse).
 * Useful for comparative evaluations against RRF.
 */
export class LinearScoreFusion implements FusionStrategyPort {
  private defaultAlpha: number;

  constructor(defaultAlpha: number = 0.5) {
    this.defaultAlpha = defaultAlpha;
  }

  public fuse(
    denseCandidates: ScoredCandidate[],
    sparseCandidates: ScoredCandidate[],
    options?: FusionOptions,
  ): ScoredCandidate[] {
    const alpha = options?.alpha ?? this.defaultAlpha;
    const candidateCap = options?.candidateCap ?? 20;
    const minThreshold = options?.minScoreThreshold ?? 0.0;

    // Determine max scores for normalization
    const denseScores = denseCandidates.map((c) => c.score);
    const rawMaxDense = denseScores.length > 0 ? Math.max(...denseScores) : 1.0;
    const maxDense = rawMaxDense > 0 ? rawMaxDense : 1.0;

    const sparseScores = sparseCandidates.map((c) => c.score);
    const rawMaxSparse = sparseScores.length > 0 ? Math.max(...sparseScores) : 1.0;
    const maxSparse = rawMaxSparse > 0 ? rawMaxSparse : 1.0;

    const merged = new Map<
      string,
      {
        candidate: ScoredCandidate;
        denseScore: number;
        sparseScore: number;
        denseRank?: number;
        sparseRank?: number;
      }
    >();

    denseCandidates.forEach((cand, idx) => {
      merged.set(cand.id, {
        candidate: cand,
        denseScore: Math.max(0, cand.score) / maxDense,
        sparseScore: 0,
        denseRank: idx + 1,
      });
    });

    sparseCandidates.forEach((cand, idx) => {
      const existing = merged.get(cand.id);
      const normSparse = Math.max(0, cand.score) / maxSparse;

      if (existing) {
        existing.sparseScore = normSparse;
        existing.sparseRank = idx + 1;
      } else {
        merged.set(cand.id, {
          candidate: cand,
          denseScore: 0,
          sparseScore: normSparse,
          sparseRank: idx + 1,
        });
      }
    });

    const scored = Array.from(merged.values()).map((item) => {
      const finalScore = alpha * item.denseScore + (1.0 - alpha) * item.sparseScore;
      const inDense = item.denseRank !== undefined;
      const inSparse = item.sparseRank !== undefined;
      const retrieverType: "dense" | "sparse" | "hybrid" =
        inDense && inSparse ? "hybrid" : inDense ? "dense" : "sparse";

      return {
        ...item.candidate,
        score: finalScore,
        retrieverType,
        denseRank: item.denseRank,
        sparseRank: item.sparseRank,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter((c) => c.score >= minThreshold)
      .slice(0, candidateCap)
      .map((c, idx) => ({ ...c, rank: idx + 1 }));
  }
}

export const rrfFusion = new ReciprocalRankFusion();
export const linearFusion = new LinearScoreFusion();
