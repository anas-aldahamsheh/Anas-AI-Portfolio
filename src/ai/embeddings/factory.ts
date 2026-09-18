import { EmbeddingPort } from "@/ai/contracts/ingestion";
import { BgeM3EmbeddingAdapter, bgeM3EmbeddingAdapter } from "./adapters/bge-m3-embedding-adapter";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { secretsService } from "@/lib/security/secrets-service";
import { logger } from "@/lib/observability/logger";

/**
 * Resolves the active embedding adapter from the database model registry and encrypted secrets.
 * Safely falls back to the baseline BGE-M3 adapter if offline or during build phase.
 */
export async function getActiveEmbeddingAdapter(): Promise<EmbeddingPort> {
  try {
    const [assignments, providers, policy] = await Promise.all([
      modelRegistryService.listAssignments("production"),
      modelRegistryService.listProviders(),
      modelRegistryService.getRuntimePolicy(),
    ]);

    const activeAssignment = assignments.find((a) => a.capability === "embedding" && a.isActive);

    if (!activeAssignment) {
      return bgeM3EmbeddingAdapter;
    }

    const provider = providers.find((p) => p.id === activeAssignment.providerId);
    if (!provider || !provider.isEnabled) {
      return bgeM3EmbeddingAdapter;
    }

    let apiKey: string | null = null;
    if (provider.hasApiKey) {
      try {
        apiKey = await secretsService.getSecret(`ai_provider_${provider.id}_api_key`);
      } catch (err) {
        logger.warn("Failed to retrieve decrypted API key for embedding provider", {
          metadata: { providerId: provider.id, error: String(err) },
        });
      }
    }

    return new BgeM3EmbeddingAdapter({
      endpointUrl: provider.baseUrl,
      apiKey,
      timeoutMs: policy.timeoutMs,
      maxRetries: policy.maxRetries,
      normalize: true,
    });
  } catch (err) {
    logger.warn("Failed to dynamically resolve embedding adapter from registry, using baseline", {
      metadata: { error: String(err) },
    });
    return bgeM3EmbeddingAdapter;
  }
}
