import { RerankerPort } from "@/ai/contracts/reranker";
import { BgeRerankerAdapter, bgeRerankerAdapter } from "./bge-reranker-adapter";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { secretsService } from "@/lib/security/secrets-service";
import { logger } from "@/lib/observability/logger";

/**
 * Dynamically resolves the active reranker adapter from the database model registry,
 * decrypts any credentials from secrets service, and applies runtime policy.
 * Safely falls back to baseline BGE reranker adapter if database or remote services are unavailable.
 */
export async function getActiveRerankerAdapter(): Promise<RerankerPort> {
  try {
    const [assignments, providers, policy] = await Promise.all([
      modelRegistryService.listAssignments("production"),
      modelRegistryService.listProviders(),
      modelRegistryService.getRuntimePolicy(),
    ]);

    const activeAssignment = assignments.find((a) => a.capability === "reranking" && a.isActive);

    if (!activeAssignment) {
      return bgeRerankerAdapter;
    }

    const provider = providers.find((p) => p.id === activeAssignment.providerId);
    if (!provider || !provider.isEnabled) {
      return bgeRerankerAdapter;
    }

    let apiKey: string | null = null;
    if (provider.hasApiKey) {
      try {
        apiKey = await secretsService.getSecret(`ai_provider_${provider.id}_api_key`);
      } catch (err) {
        logger.warn("Failed to retrieve decrypted API key for reranker provider", {
          metadata: { providerId: provider.id, error: String(err) },
        });
      }
    }

    return new BgeRerankerAdapter({
      endpointUrl: provider.baseUrl,
      apiKey,
      modelName: activeAssignment.modelName || "BAAI/bge-reranker-v2-m3",
      timeoutMs: policy.timeoutMs,
      maxRetries: policy.maxRetries,
    });
  } catch (err) {
    logger.warn("Failed to dynamically resolve reranker adapter from registry, using baseline", {
      metadata: { error: String(err) },
    });
    return bgeRerankerAdapter;
  }
}
