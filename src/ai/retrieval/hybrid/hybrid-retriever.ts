import {
  DenseRetrieverPort,
  FusionStrategyPort,
  HybridRetrievalOptions,
  HybridRetrievalResult,
  RetrievalQuery,
  RetrievalTelemetry,
  ScoredCandidate,
  SparseRetrieverPort,
} from "@/ai/contracts/retrieval";
import { denseRetriever } from "../dense/dense-retriever";
import { sparseRetriever } from "../sparse/sparse-retriever";
import { rrfFusion, linearFusion } from "../fusion/rrf-fusion";

export interface HybridRetrieverConfig {
  denseRetriever?: DenseRetrieverPort | undefined;
  sparseRetriever?: SparseRetrieverPort | undefined;
  fusionStrategy?: FusionStrategyPort | undefined;
  linearFusionStrategy?: FusionStrategyPort | undefined;
}

export class HybridRetriever {
  private denseRetriever: DenseRetrieverPort;
  private sparseRetriever: SparseRetrieverPort;
  private fusionStrategy: FusionStrategyPort;
  private linearFusionStrategy: FusionStrategyPort;

  constructor(config?: HybridRetrieverConfig) {
    this.denseRetriever = config?.denseRetriever ?? denseRetriever;
    this.sparseRetriever = config?.sparseRetriever ?? sparseRetriever;
    this.fusionStrategy = config?.fusionStrategy ?? rrfFusion;
    this.linearFusionStrategy = config?.linearFusionStrategy ?? linearFusion;
  }

  public async retrieve(
    query: RetrievalQuery,
    options?: HybridRetrievalOptions,
  ): Promise<HybridRetrievalResult> {
    const startTotal = performance.now();

    const denseEnabled = options?.denseEnabled ?? true;
    const sparseEnabled = options?.sparseEnabled ?? true;
    const denseTopK = options?.denseTopK ?? 15;
    const sparseTopK = options?.sparseTopK ?? 15;
    const rrfK = options?.rrfK ?? 60;
    const candidateCap = options?.candidateCap ?? 20;
    const minScoreThreshold = options?.minScoreThreshold;
    const strategyName = options?.fusionStrategy ?? "rrf";
    const hybridAlpha = options?.hybridAlpha ?? 0.5;

    const effectiveFilter = options?.filter ?? query.filter;
    const queryWithFilter: RetrievalQuery = {
      ...query,
      filter: effectiveFilter,
    };

    let denseLatencyMs = 0;
    let sparseLatencyMs = 0;
    let fusionLatencyMs = 0;

    // Concurrently trigger dense and sparse retrievers
    const densePromise = denseEnabled
      ? (async () => {
          const start = performance.now();
          const res = await this.denseRetriever.retrieve(queryWithFilter, { topK: denseTopK });
          denseLatencyMs = Math.round(performance.now() - start);
          return res;
        })()
      : Promise.resolve([]);

    const sparsePromise = sparseEnabled
      ? (async () => {
          const start = performance.now();
          const res = await this.sparseRetriever.retrieve(queryWithFilter, { topK: sparseTopK });
          sparseLatencyMs = Math.round(performance.now() - start);
          return res;
        })()
      : Promise.resolve([]);

    const [denseCandidates, sparseCandidates] = await Promise.all([densePromise, sparsePromise]);

    let finalCandidates: ScoredCandidate[] = [];

    if (denseEnabled && sparseEnabled) {
      const startFusion = performance.now();
      const activeFusion =
        strategyName === "linear" ? this.linearFusionStrategy : this.fusionStrategy;

      finalCandidates = activeFusion.fuse(denseCandidates, sparseCandidates, {
        rrfK,
        candidateCap,
        minScoreThreshold,
        alpha: hybridAlpha,
      });
      fusionLatencyMs = Math.round(performance.now() - startFusion);
    } else if (denseEnabled) {
      finalCandidates = denseCandidates.slice(0, candidateCap);
    } else if (sparseEnabled) {
      finalCandidates = sparseCandidates.slice(0, candidateCap);
    }

    const totalLatencyMs = Math.round(performance.now() - startTotal);

    const telemetry: RetrievalTelemetry = {
      denseCandidateCount: denseCandidates.length,
      sparseCandidateCount: sparseCandidates.length,
      fusedCandidateCount: finalCandidates.length,
      denseLatencyMs,
      sparseLatencyMs,
      fusionLatencyMs,
      totalLatencyMs,
      filterApplied: effectiveFilter as Record<string, unknown> | undefined,
    };

    return {
      candidates: finalCandidates,
      telemetry,
    };
  }
}

export const hybridRetriever = new HybridRetriever();
