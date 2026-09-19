import {
  QueryRewriteInput,
  QueryRewriteOptions,
  QueryRewriteResult,
  QueryRewriterPort,
  RewriteQueriesSchema,
} from "@/ai/contracts/query-rewriter";
import { rewriteQueryHeuristic } from "./heuristic-rewriter";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { secretsService } from "@/lib/security/secrets-service";
import { promptService } from "@/ai/prompts";
import { logger } from "@/lib/observability/logger";

export interface QueryRewriterConfig {
  defaultTimeoutMs?: number;
  defaultMaxQueries?: number;
  defaultTemperature?: number;
}

export class QueryRewriter implements QueryRewriterPort {
  private defaultTimeoutMs: number;
  private defaultMaxQueries: number;
  private defaultTemperature: number;

  constructor(config?: QueryRewriterConfig) {
    this.defaultTimeoutMs = config?.defaultTimeoutMs ?? 5000;
    this.defaultMaxQueries = config?.defaultMaxQueries ?? 3;
    this.defaultTemperature = config?.defaultTemperature ?? 0.2;
  }

  public async rewrite(
    input: QueryRewriteInput,
    options?: QueryRewriteOptions,
  ): Promise<QueryRewriteResult> {
    const original = input.userMessage.trim();
    if (!original) {
      return {
        originalQuery: "",
        rewrittenQueries: [],
        wasRewritten: false,
        strategy: "noop",
        latencyMs: 0,
      };
    }

    if (options?.enabled === false) {
      return {
        originalQuery: original,
        rewrittenQueries: [original],
        wasRewritten: false,
        strategy: "noop",
        latencyMs: 0,
      };
    }

    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
    const maxQueries = options?.maxQueries ?? this.defaultMaxQueries;
    const temperature = options?.temperature ?? this.defaultTemperature;

    const start = performance.now();

    // Attempt LLM rewrite via active model in registry
    try {
      const [assignments, providers] = await Promise.all([
        modelRegistryService.listAssignments("production"),
        modelRegistryService.listProviders(),
      ]);

      const activeAssignment =
        assignments.find((a) => a.capability === "rewrite" && a.isActive) ??
        assignments.find((a) => a.capability === "generation" && a.isActive);

      if (activeAssignment) {
        const provider = providers.find((p) => p.id === activeAssignment.providerId);
        if (provider && provider.isEnabled) {
          let apiKey: string | null = null;
          if (provider.hasApiKey) {
            try {
              apiKey = await secretsService.getSecret(`ai_provider_${provider.id}_api_key`);
            } catch {
              // Ignore secret error, provider might not require apiKey (e.g. local ollama)
            }
          }

          // Render system & user prompt templates
          const rendered = await promptService.renderPrompt("query_rewriter", {
            language: input.language,
            route: String(input.route ?? "broad_portfolio"),
            current_scope: input.currentScope ?? "all",
            conversation_context: input.conversationSummary ?? "none",
            user_message: original,
          });

          // Call provider endpoint with bounded timeout
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
              model: activeAssignment.modelName || activeAssignment.modelId,
              messages: [
                { role: "system", content: rendered.systemPrompt },
                { role: "user", content: rendered.userPrompt ?? original },
              ],
              temperature,
              max_tokens: 256,
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (response.ok) {
            const data = (await response.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
            };

            const content = data.choices?.[0]?.message?.content?.trim() ?? "";
            // Extract JSON array from possible markdown code block
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              const validated = RewriteQueriesSchema.safeParse(parsed);
              if (validated.success) {
                // Ensure original query is preserved
                const combined = Array.from(new Set([original, ...validated.data]));
                const finalQueries = combined.slice(0, maxQueries);

                return {
                  originalQuery: original,
                  rewrittenQueries: finalQueries,
                  wasRewritten: finalQueries.length > 1,
                  strategy: "llm",
                  latencyMs: Math.round(performance.now() - start),
                  modelUsed: activeAssignment.modelId,
                };
              }
            }
          }
        }
      }
    } catch (err) {
      logger.warn("LLM query rewrite attempt failed, falling back to heuristic expansion", {
        module: "rewrite",
        metadata: {
          query: original.slice(0, 50),
          error: err instanceof Error ? err.message : String(err),
        },
      });
    }

    // Fallback to high-speed deterministic heuristic rewriter
    const heuristicResult = rewriteQueryHeuristic(input, options);
    return {
      ...heuristicResult,
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

export const queryRewriter = new QueryRewriter();
