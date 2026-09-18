import {
  CitationMapping,
  ContextInputCandidate,
  ConversationMode,
  ResponseLanguage,
  ScoredCandidate,
  ScriptDirection,
  RagDebugTelemetry,
  RagDebugStageLatency,
  RagDebugSourceItem,
  RagDebugValidationState,
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
  isAdmin?: boolean | undefined;
}

export interface ChatOrchestratorTelemetry extends RagDebugTelemetry {
  generationLatencyMs: number;
  totalLatencyMs: number;
  strategy: string;
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
    const routingStart = performance.now();
    const routeResult = await queryRouter.route(message, {
      forceRouteId: input.projectScopeId ? "project" : undefined,
    });
    const routingMs = Math.round(performance.now() - routingStart);

    // 4. Query Expansion & Rewriting (if route signals rewrite or ambiguous)
    let searchQueries = [message];
    let rewriteCount = 0;
    const rewriteStart = performance.now();
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
    const rewriteMs = Math.round(performance.now() - rewriteStart);

    // 5. Hybrid Retrieval (Dense Vector + Sparse BM25 Fusion)
    const isScoped = Boolean(input.projectScopeId);
    const allowGlobalContext = Boolean(input.allowGlobalContext);

    const retrievalFilter: { sourceId?: string; sourceType?: "project" } = {};
    if (isScoped && input.projectScopeId) {
      retrievalFilter.sourceId = input.projectScopeId;
      retrievalFilter.sourceType = "project";
    }

    const retrievalStart = performance.now();
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
    const retrievalMs = Math.round(performance.now() - retrievalStart);

    // 6. Cross-Encoder Reranking
    let candidatesForContext: ContextInputCandidate[] = candidates;
    let rerankedCount = candidates.length;
    const rerankingStart = performance.now();

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
    const rerankingMs = Math.round(performance.now() - rerankingStart);

    // 7. Context Packing, Token Budgeting & Deduplication
    const contextStart = performance.now();
    const contextResult = await contextBuilder.buildContext(candidatesForContext, {
      language,
      deduplicate: true,
    });
    const contextMs = Math.round(performance.now() - contextStart);

    // 8. Grounded Generation & Citation Validation
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

    // 9. Build Sanitized Engineering Telemetry (Zero hidden prompts or CoT leakage)
    const sources: RagDebugSourceItem[] = contextResult.chunks.map((c) => ({
      id: c.id,
      title: c.title,
      sourceType: c.sourceType,
      score: c.score !== undefined ? Number(c.score.toFixed(4)) : undefined,
      snippet: c.content ? c.content.slice(0, 160) + (c.content.length > 160 ? "..." : "") : undefined,
    }));

    const validationState: RagDebugValidationState = {
      isValid: !groundedAnswer.hasInsufficientEvidence,
      citationsCount: groundedAnswer.citations.length,
      ungroundedCount: groundedAnswer.validation?.invalidCitedIds?.length ?? 0,
    };

    const latencies: RagDebugStageLatency = {
      routingMs,
      rewriteMs,
      retrievalMs,
      rerankingMs,
      contextMs,
      generationMs: genLatency,
      totalMs: totalLatency,
    };

    return {
      answer: groundedAnswer.content,
      language: groundedAnswer.language,
      direction: getScriptDirection(groundedAnswer.language),
      conversationMode: groundedAnswer.conversationMode,
      citations: groundedAnswer.citations,
      hasInsufficientEvidence: groundedAnswer.hasInsufficientEvidence,
      telemetry: {
        routeId: routeResult.route_id,
        routeLabel:
          routeResult.route_id === "project"
            ? "Project Scope & Architecture Intent"
            : routeResult.route_id === "technical_detail"
              ? "Deep Technical Deep Dive"
              : routeResult.route_id === "job_fit" ||
                  routeResult.route_id === "experience" ||
                  routeResult.route_id === "cv"
                ? "Recruiter & Experience Evaluation"
                : "General Portfolio Inquiry",
        language,
        direction,
        conversationMode,
        rewriteCount,
        retrievalMethod: "hybrid",
        retrievedCount: candidates.length,
        rerankedCount,
        selectedChunksCount: contextResult.chunks.length,
        tokenCount: contextResult.telemetry.totalEstimatedTokens,
        modelId: groundedAnswer.telemetry.modelUsed || "gpt-4o",
        providerType: groundedAnswer.telemetry.providerType || "openai_compatible",
        latencies,
        sources,
        validationState,
        projectScopeId: input.projectScopeId,
        isScopedRetrieval: isScoped,
        isAdminView: Boolean(input.isAdmin),
        generationLatencyMs: genLatency,
        totalLatencyMs: totalLatency,
        strategy: groundedAnswer.telemetry.strategy,
      },
    };
  }
}

export const chatOrchestrator = new ChatOrchestrator();
