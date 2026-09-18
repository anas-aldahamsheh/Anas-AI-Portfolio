import {
  CitationMapping,
  ContextInputCandidate,
  ConversationMode,
  ResponseLanguage,
  ScoredCandidate,
  ScriptDirection,
} from "@/ai/contracts";
import { languageResolver, getScriptDirection } from "@/ai/language";
import { queryRouter } from "@/ai/router";
import { queryRewriter } from "@/ai/query-rewrite";
import { hybridRetriever } from "@/ai/retrieval";
import { getActiveRerankerAdapter } from "@/ai/reranker";
import { contextBuilder } from "@/ai/context";
import { groundedGenerator } from "@/ai/generation";
import { conversationModeService } from "@/ai/modes";
import { logger } from "@/lib/observability/logger";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatOrchestratorInput {
  message: string;
  conversationMode?: ConversationMode | undefined;
  conversationLocale?: ResponseLanguage | undefined;
  previousLanguage?: ResponseLanguage | undefined;
  conversationSummary?: string | undefined;
  projectScopeId?: string | undefined;
  projectScopeTitle?: string | undefined;
  allowGlobalContext?: boolean | undefined;
  history?: ChatHistoryMessage[] | undefined;
}

export interface ChatOrchestratorTelemetry {
  routeId: string;
  language: ResponseLanguage;
  direction: ScriptDirection;
  rewriteCount: number;
  retrievedCount: number;
  rerankedCount: number;
  selectedChunksCount: number;
  tokenCount: number;
  generationLatencyMs: number;
  totalLatencyMs: number;
  strategy: string;
  projectScopeId?: string | undefined;
  isScopedRetrieval: boolean;
}

export interface ChatOrchestratorResult {
  answer: string;
  language: ResponseLanguage;
  direction: ScriptDirection;
  conversationMode: ConversationMode;
  citations: CitationMapping[];
  hasInsufficientEvidence: boolean;
  telemetry: ChatOrchestratorTelemetry;
}

export class ChatOrchestrator {
  /**
   * Coordinates the full end-to-end RAG chat pipeline:
   * Language Resolution -> Router -> Rewriter -> Hybrid Retrieval -> Reranker -> Context Builder -> Grounded Generator.
   */
  public async processChat(input: ChatOrchestratorInput): Promise<ChatOrchestratorResult> {
    const start = performance.now();
    const message = input.message.trim();

    // 1. Conversation Language & Direction Resolution
    const langResult = await languageResolver.resolveLanguage({
      message,
      conversationLocale: input.conversationLocale,
      previousLanguage: input.previousLanguage,
    });
    const language = langResult.language;
    const direction = langResult.direction;

    // 2. Resolve & Verify Conversation Mode against enabled published policies
    const conversationMode: ConversationMode = await conversationModeService.verifyMode(
      input.conversationMode,
    );

    // 3. Query Routing & Policy Selection
    const routeResult = await queryRouter.route(message, {
      forceRouteId: input.projectScopeId ? "project" : undefined,
    });

    // 3. Query Expansion & Rewriting (if route signals rewrite or ambiguous)
    let searchQueries = [message];
    let rewriteCount = 0;
    if (routeResult.needs_rewrite) {
      try {
        const rewriteResult = await queryRewriter.rewrite({
          userMessage: message,
          language,
          route: routeResult.route_id,
          currentScope: input.projectScopeId,
          conversationSummary: input.conversationSummary,
        });
        if (rewriteResult.rewrittenQueries.length > 0) {
          searchQueries = rewriteResult.rewrittenQueries;
          rewriteCount = rewriteResult.rewrittenQueries.length;
        }
      } catch (err) {
        logger.warn("Query rewriting failed gracefully, falling back to original message", {
          module: "chat_orchestrator",
          metadata: { error: String(err) },
        });
      }
    }

    // 4. Hybrid Retrieval (Dense Vector + Sparse BM25 Fusion)
    const isScoped = Boolean(input.projectScopeId);
    const allowGlobalContext = Boolean(input.allowGlobalContext);

    const retrievalFilter: { sourceId?: string; sourceType?: "project" } = {};
    if (isScoped && input.projectScopeId) {
      retrievalFilter.sourceId = input.projectScopeId;
      retrievalFilter.sourceType = "project";
    }

    let candidates: ScoredCandidate[] = [];
    try {
      // Execute hybrid retrieval for primary query with hard scope filter
      const primaryRes = await hybridRetriever.retrieve({
        text: searchQueries[0] || message,
        filter: Object.keys(retrievalFilter).length > 0 ? retrievalFilter : undefined,
      });

      // If additional rewritten queries exist, retrieve and merge uniquely
      if (searchQueries.length > 1) {
        const secondaryResults = await Promise.all(
          searchQueries.slice(1).map((q) =>
            hybridRetriever.retrieve({
              text: q,
              filter: Object.keys(retrievalFilter).length > 0 ? retrievalFilter : undefined,
            }),
          ),
        );
        const seenIds = new Set(primaryRes.candidates.map((c) => c.id));
        candidates = [...primaryRes.candidates];
        for (const subRes of secondaryResults) {
          for (const cand of subRes.candidates) {
            if (!seenIds.has(cand.id)) {
              seenIds.add(cand.id);
              candidates.push(cand);
            }
          }
        }
      } else {
        candidates = primaryRes.candidates;
      }

      // Optional global context: if allowed and scoped, retrieve broad evidence, preserving project chunks as primary
      if (isScoped && allowGlobalContext) {
        try {
          const globalRes = await hybridRetriever.retrieve({
            text: message,
            topK: 4,
          });
          const projectCandidateIds = new Set(candidates.map((c) => c.id));
          for (const cand of globalRes.candidates) {
            if (!projectCandidateIds.has(cand.id)) {
              projectCandidateIds.add(cand.id);
              candidates.push({ ...cand, score: cand.score * 0.5 });
            }
          }
        } catch {
          // Ignore global context errors
        }
      }
    } catch (err) {
      logger.warn("Hybrid retrieval failed in chat orchestrator", {
        module: "chat_orchestrator",
        metadata: { error: String(err) },
      });
      candidates = [];
    }

    // 5. Cross-Encoder Reranking
    let candidatesForContext: ContextInputCandidate[] = candidates;
    let rerankedCount = candidates.length;

    if (candidates.length > 0) {
      try {
        const reranker = await getActiveRerankerAdapter();
        const rerankResult = await reranker.rerank(message, candidates, {
          topN: 6,
          minThreshold: 0.05,
        });
        candidatesForContext = rerankResult.candidates;
        rerankedCount = rerankResult.candidates.length;
      } catch (err) {
        logger.warn("Reranker failed in chat orchestrator, degrading to fused retrieval order", {
          module: "chat_orchestrator",
          metadata: { error: String(err) },
        });
      }
    }

    // 6. Context Packing, Token Budgeting & Deduplication
    const contextResult = await contextBuilder.buildContext(candidatesForContext, {
      language,
      deduplicate: true,
    });

    // 7. Grounded Generation & Citation Validation
    const genStart = performance.now();
    const groundedAnswer = await groundedGenerator.generate({
      userMessage: message,
      contextChunks: contextResult.chunks,
      availableCitations: contextResult.availableCitations,
      formattedContext: contextResult.formattedContext,
      responseLanguage: language,
      conversationMode,
      conversationSummary: input.conversationSummary,
      currentScope: input.projectScopeTitle || input.projectScopeId,
    });
    const genLatency = Math.round(performance.now() - genStart);

    const totalLatency = Math.round(performance.now() - start);

    return {
      answer: groundedAnswer.content,
      language: groundedAnswer.language,
      direction: getScriptDirection(groundedAnswer.language),
      conversationMode: groundedAnswer.conversationMode,
      citations: groundedAnswer.citations,
      hasInsufficientEvidence: groundedAnswer.hasInsufficientEvidence,
      telemetry: {
        routeId: routeResult.route_id,
        language,
        direction,
        rewriteCount,
        retrievedCount: candidates.length,
        rerankedCount,
        selectedChunksCount: contextResult.chunks.length,
        tokenCount: contextResult.telemetry.totalEstimatedTokens,
        generationLatencyMs: genLatency,
        totalLatencyMs: totalLatency,
        strategy: groundedAnswer.telemetry.strategy,
        projectScopeId: input.projectScopeId,
        isScopedRetrieval: isScoped,
      },
    };
  }
}

export const chatOrchestrator = new ChatOrchestrator();
