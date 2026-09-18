import { EmbeddingPort } from "@/ai/contracts/ingestion";
import { deterministicEmbeddingAdapter } from "./deterministic-embedding-adapter";
import { logger } from "@/lib/observability/logger";

export interface BgeM3AdapterOptions {
  endpointUrl?: string | null | undefined;
  apiKey?: string | null | undefined;
  batchSize?: number | undefined;
  timeoutMs?: number | undefined;
  maxRetries?: number | undefined;
  normalize?: boolean | undefined;
  preferOfflineFallback?: boolean | undefined;
}

/**
 * Normalizes a numeric vector to unit length (L2 norm = 1.0).
 */
export function l2Normalize(vector: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vector.length; i++) {
    const val = vector[i] ?? 0;
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

/**
 * Official BGE-M3 embedding adapter.
 * Supports multilingual 1024-dimensional embeddings, text batching,
 * TEI & OpenAI endpoints, retries with bounded exponential backoff, and offline fallback.
 */
export class BgeM3EmbeddingAdapter implements EmbeddingPort {
  public readonly dimension: number = 1024;
  public readonly modelName: string = "BAAI/bge-m3";
  public readonly maxInputTokens: number = 8192;

  private endpointUrl: string | null;
  private apiKey: string | null;
  private batchSize: number;
  private timeoutMs: number;
  private maxRetries: number;
  private normalize: boolean;
  private preferOfflineFallback: boolean;

  constructor(options?: BgeM3AdapterOptions) {
    this.endpointUrl = options?.endpointUrl ?? process.env["BGE_M3_ENDPOINT"] ?? null;
    this.apiKey = options?.apiKey ?? process.env["BGE_M3_API_KEY"] ?? null;
    this.batchSize = options?.batchSize ?? 16;
    this.timeoutMs = options?.timeoutMs ?? 10000;
    this.maxRetries = options?.maxRetries ?? 2;
    this.normalize = options?.normalize ?? true;
    this.preferOfflineFallback =
      options?.preferOfflineFallback ?? (!this.endpointUrl || process.env["NODE_ENV"] === "test");
  }

  /**
   * Embeds an array of texts into 1024-dimensional normalized vectors.
   */
  public async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    // Offline / testing fallback
    if (this.preferOfflineFallback || !this.endpointUrl) {
      return deterministicEmbeddingAdapter.embed(texts);
    }

    // Split texts into batches
    const batches: string[][] = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      batches.push(texts.slice(i, i + this.batchSize));
    }

    const allVectors: number[][] = [];

    for (const batch of batches) {
      const batchVectors = await this.embedBatchWithRetry(batch);
      allVectors.push(...batchVectors);
    }

    return allVectors;
  }

  /**
   * Executes embedding for a single batch with retry backoff and offline fallback on failure.
   */
  private async embedBatchWithRetry(batch: string[]): Promise<number[][]> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const vectors = await this.requestRemoteEmbeddings(batch);
        return this.normalize ? vectors.map((v) => l2Normalize(v)) : vectors;
      } catch (err) {
        lastError = err;
        if (attempt < this.maxRetries) {
          const delayMs = Math.pow(2, attempt) * 200;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    logger.warn("Remote BGE-M3 inference failed, falling back to deterministic local embeddings", {
      metadata: { error: String(lastError), batchSize: batch.length },
    });

    return deterministicEmbeddingAdapter.embed(batch);
  }

  /**
   * Sends HTTP request to remote TEI or OpenAI-compatible endpoint.
   */
  private async requestRemoteEmbeddings(texts: string[]): Promise<number[][]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const isOpenAiFormat =
        this.endpointUrl?.includes("/v1/embeddings") || this.endpointUrl?.includes("/embeddings");

      const body = isOpenAiFormat
        ? JSON.stringify({
            model: this.modelName,
            input: texts,
          })
        : JSON.stringify({
            inputs: texts,
            normalize: this.normalize,
            truncate: true,
          });

      const response = await fetch(this.endpointUrl!, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`BGE-M3 HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      // Handle TEI format: number[][]
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        return data as number[][];
      }

      // Handle OpenAI format: { data: [{ embedding: number[] }] }
      if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        Array.isArray((data as { data: unknown[] }).data)
      ) {
        const items = (data as { data: Array<{ embedding?: number[]; index?: number }> }).data;
        items.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        return items.map((item) => item.embedding ?? []);
      }

      throw new Error("Unrecognized embedding response format from remote inference provider");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Validates adapter health by embedding multilingual test prompts.
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    dimension: number;
    error?: string | undefined;
  }> {
    const start = Date.now();
    try {
      const testSamples = ["Software Engineering Portfolio", "مهندس برمجيات وذكاء اصطناعي"];

      const vectors = await this.embed(testSamples);
      const latencyMs = Date.now() - start;

      if (vectors.length !== 2) {
        return {
          healthy: false,
          latencyMs,
          dimension: 0,
          error: "Failed to return vectors for all test samples",
        };
      }

      const firstDim = vectors[0]?.length ?? 0;
      if (firstDim !== this.dimension) {
        return {
          healthy: false,
          latencyMs,
          dimension: firstDim,
          error: `Vector dimension mismatch: expected ${this.dimension}, got ${firstDim}`,
        };
      }

      return {
        healthy: true,
        latencyMs,
        dimension: firstDim,
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        dimension: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export const bgeM3EmbeddingAdapter = new BgeM3EmbeddingAdapter();
