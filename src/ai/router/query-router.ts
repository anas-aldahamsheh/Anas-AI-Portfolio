import {
  QueryRouteDefinition,
  QueryRouterPort,
  RetrievalPolicy,
  RouteId,
  RouterOptions,
  RouterOutput,
  RouterOutputSchema,
} from "@/ai/contracts/router";
import { BASELINE_QUERY_ROUTES, BASELINE_RETRIEVAL_POLICIES } from "./baseline-routes";
import { classifyQueryRules, ClassificationResult } from "./rule-based-classifier";
import { logger } from "@/lib/observability/logger";

export interface QueryRouterConfig {
  classifier?: (query: string) => ClassificationResult;
  routesMap?: Record<RouteId, QueryRouteDefinition>;
  policiesMap?: Record<string, RetrievalPolicy>;
}

export class QueryRouter implements QueryRouterPort {
  private classifier: (query: string) => ClassificationResult;
  private routesMap: Record<RouteId, QueryRouteDefinition>;
  private policiesMap: Record<string, RetrievalPolicy>;

  constructor(config?: QueryRouterConfig) {
    this.classifier = config?.classifier ?? classifyQueryRules;
    this.routesMap = config?.routesMap ?? BASELINE_QUERY_ROUTES;
    this.policiesMap = config?.policiesMap ?? BASELINE_RETRIEVAL_POLICIES;
  }

  public async route(query: string, options?: RouterOptions): Promise<RouterOutput> {
    try {
      const trimmed = query.trim();

      // Forced route override if provided
      if (options?.forceRouteId && this.routesMap[options.forceRouteId]) {
        const routeDef = this.routesMap[options.forceRouteId];
        const policy =
          this.policiesMap[routeDef.retrievalPolicyId] ??
          this.policiesMap["policy-broad"] ??
          BASELINE_RETRIEVAL_POLICIES["policy-broad"];

        const output: RouterOutput = {
          route_id: routeDef.id,
          confidence: 1.0,
          entity_hints: [],
          needs_rewrite: routeDef.needsRewrite,
          retrieval_policy_id: policy?.id ?? "policy-broad",
          policy,
        };

        RouterOutputSchema.parse(output);
        return output;
      }

      // Perform fast intent classification
      const classification = this.classifier(trimmed);

      // Check confidence threshold
      const minConfidence = options?.minConfidenceThreshold ?? 0.3;
      let targetRouteId = classification.route_id;

      if (classification.confidence < minConfidence) {
        targetRouteId = "broad_portfolio";
      }

      // Resolve route definition
      const routeDef =
        this.routesMap[targetRouteId] ??
        this.routesMap["broad_portfolio"] ??
        BASELINE_QUERY_ROUTES["broad_portfolio"];

      // Resolve matching retrieval policy
      const policy =
        this.policiesMap[routeDef.retrievalPolicyId] ??
        this.policiesMap["policy-broad"] ??
        BASELINE_RETRIEVAL_POLICIES["policy-broad"];

      const output: RouterOutput = {
        route_id: routeDef.id,
        confidence: classification.confidence,
        entity_hints: classification.entity_hints,
        needs_rewrite: routeDef.needsRewrite,
        retrieval_policy_id: policy?.id ?? "policy-broad",
        policy,
        matched_keywords: classification.matched_keywords,
      };

      // Strict validation
      RouterOutputSchema.parse(output);

      return output;
    } catch (err) {
      logger.warn("Query router encountered an error, falling back to broad portfolio policy", {
        module: "router",
        metadata: {
          query: query.slice(0, 50),
          error: err instanceof Error ? err.message : String(err),
        },
      });

      const fallbackPolicy =
        this.policiesMap["policy-broad"] ?? BASELINE_RETRIEVAL_POLICIES["policy-broad"];

      return {
        route_id: "broad_portfolio",
        confidence: 0.5,
        entity_hints: [],
        needs_rewrite: true,
        retrieval_policy_id: fallbackPolicy?.id ?? "policy-broad",
        policy: fallbackPolicy,
      };
    }
  }
}

export const queryRouter = new QueryRouter();
