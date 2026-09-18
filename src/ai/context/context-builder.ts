import {
  CitationReference,
  ContextBuilderOptions,
  ContextBuilderPort,
  ContextBuilderResult,
  ContextBuilderTelemetry,
  ContextChunk,
  ContextInputCandidate,
} from "@/ai/contracts/context-builder";
import { extractTokenShingles, isNearDuplicate } from "./deduplicator";
import { estimateTokenCount, TokenBudgeter } from "./token-budgeter";
import { formatRetrievedContext } from "./security-delimiters";
import { ingestionService } from "@/ai/ingestion/jobs/ingestion-service";

/**
 * Deterministic, budget-aware context builder for grounded RAG generation.
 * Enforces token budget, deduplication of overlapping passages, per-source caps,
 * citation traceability, and strict untrusted prompt injection boundaries.
 */
export class ContextBuilder implements ContextBuilderPort {
  /**
   * Selects, deduplicates, and formats evidence chunks into structured context.
   */
  public async buildContext(
    candidates: ContextInputCandidate[],
    options?: ContextBuilderOptions,
  ): Promise<ContextBuilderResult> {
    const startTime = Date.now();

    // Resolve configuration limits
    let defaultBudget = 3000;
    try {
      const ragConfig = await ingestionService.getRagConfiguration();
      if (ragConfig?.contextTokenBudget) {
        defaultBudget = ragConfig.contextTokenBudget;
      }
    } catch {
      // Offline fallback budget
      defaultBudget = 3000;
    }

    const maxTokens = options?.maxTokens ?? defaultBudget;
    const maxChunks = options?.maxChunks ?? 8;
    const perSourceCap = options?.perSourceCap ?? 3;
    const deduplicate = options?.deduplicate ?? true;
    const similarityThreshold = options?.similarityThreshold ?? 0.82;
    const language = options?.language ?? "en";

    if (!candidates || candidates.length === 0) {
      return {
        formattedContext: formatRetrievedContext([], language),
        chunks: [],
        availableCitations: [],
        telemetry: {
          inputCandidatesCount: 0,
          selectedChunksCount: 0,
          deduplicatedCount: 0,
          perSourceCappedCount: 0,
          budgetExceededCount: 0,
          totalEstimatedTokens: 0,
          maxTokenBudget: maxTokens,
          uniqueSourcesCount: 0,
          latencyMs: Date.now() - startTime,
        },
      };
    }

    // Sort candidates descending by rerankScore (if available) or raw score
    const sortedCandidates = [...candidates].sort((a, b) => {
      const scoreA = "rerankScore" in a && a.rerankScore !== undefined ? a.rerankScore : a.score;
      const scoreB = "rerankScore" in b && b.rerankScore !== undefined ? b.rerankScore : b.score;
      return scoreB - scoreA;
    });

    const budgeter = new TokenBudgeter(maxTokens);
    const acceptedChunks: ContextChunk[] = [];
    const acceptedShingles: Set<string>[] = [];
    const sourceCountMap = new Map<string, number>();
    const seenContentHashes = new Set<string>();

    let deduplicatedCount = 0;
    let perSourceCappedCount = 0;
    let budgetExceededCount = 0;

    for (const cand of sortedCandidates) {
      if (acceptedChunks.length >= maxChunks) {
        break;
      }

      // Check per-source cap
      const currentSourceCount = sourceCountMap.get(cand.sourceId) ?? 0;
      if (currentSourceCount >= perSourceCap) {
        perSourceCappedCount++;
        continue;
      }

      // Exact content deduplication
      const cleanContent = cand.content.trim().toLowerCase();
      if (seenContentHashes.has(cleanContent)) {
        deduplicatedCount++;
        continue;
      }

      // Near-duplicate lexical shingles deduplication
      if (deduplicate && isNearDuplicate(cand.content, acceptedShingles, similarityThreshold)) {
        deduplicatedCount++;
        continue;
      }

      // Estimate tokens for this chunk
      const chunkTokens = estimateTokenCount(cand.content, cand.locale);

      // Check token budget
      if (!budgeter.allocate(chunkTokens)) {
        budgetExceededCount++;
        continue;
      }

      // Accept chunk
      const rerankScoreVal = "rerankScore" in cand ? cand.rerankScore : undefined;
      const acceptedChunk: ContextChunk = {
        id: cand.id,
        documentId: cand.documentId,
        citationId: cand.citationId,
        content: cand.content,
        score: cand.score,
        rerankScore: rerankScoreVal,
        estimatedTokens: chunkTokens,
        rank: acceptedChunks.length + 1,
        sourceType: cand.sourceType,
        sourceId: cand.sourceId,
        title: cand.title,
        locale: cand.locale,
        headingHierarchy: cand.headingHierarchy,
        tags: cand.tags,
        sectionScope: cand.sectionScope,
      };

      acceptedChunks.push(acceptedChunk);
      seenContentHashes.add(cleanContent);
      if (deduplicate) {
        acceptedShingles.push(extractTokenShingles(cand.content));
      }
      sourceCountMap.set(cand.sourceId, currentSourceCount + 1);
    }

    const formattedContext = formatRetrievedContext(acceptedChunks, language);

    const availableCitations: CitationReference[] = acceptedChunks.map((c) => ({
      citationId: c.citationId,
      sourceId: c.sourceId,
      sourceType: c.sourceType,
      title: c.title,
      locale: c.locale,
      headingHierarchy: c.headingHierarchy,
      tags: c.tags,
      sectionScope: c.sectionScope,
    }));

    const latencyMs = Date.now() - startTime;
    const telemetry: ContextBuilderTelemetry = {
      inputCandidatesCount: candidates.length,
      selectedChunksCount: acceptedChunks.length,
      deduplicatedCount,
      perSourceCappedCount,
      budgetExceededCount,
      totalEstimatedTokens: budgeter.tokensUsed,
      maxTokenBudget: maxTokens,
      uniqueSourcesCount: sourceCountMap.size,
      latencyMs,
    };

    return {
      formattedContext,
      chunks: acceptedChunks,
      availableCitations,
      telemetry,
    };
  }
}

export const contextBuilder = new ContextBuilder();
