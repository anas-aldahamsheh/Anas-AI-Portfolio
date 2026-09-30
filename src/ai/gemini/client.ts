import type {
  EmbeddingTask,
  GeminiGenerationConfig,
  GeminiRequest,
  GeminiResponse,
  ThinkingLevel,
} from "./types";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Errors that should make the caller try again (same model after a backoff, or the next model). */
export class GeminiTransientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GeminiTransientError";
  }
}

/** The key is missing, invalid, or the project has no access. Retrying will not help. */
export class GeminiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigError";
  }
}

/** The request itself was rejected (bad schema, blocked prompt...). */
export class GeminiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GeminiRequestError";
  }
}

export function getGeminiApiKey(): string | null {
  const key = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_AI_API_KEY"] || "";
  return key.trim() ? key.trim() : null;
}

function requireKey(): string {
  const key = getGeminiApiKey();
  if (!key) throw new GeminiConfigError("GEMINI_API_KEY is not configured");
  return key;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason instanceof Error ? signal.reason : new Error("aborted"));
      },
      { once: true },
    );
  });

function combineSignals(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function toError(res: Response, model: string): Promise<Error> {
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    if (body.error?.message) message = body.error.message;
  } catch {
    // body was not JSON
  }
  const text = `[${model}] (${res.status}) ${message}`;
  if (res.status === 401 || res.status === 403) return new GeminiConfigError(text);
  if (res.status === 404 || res.status === 408 || res.status === 429 || res.status >= 500) {
    return new GeminiTransientError(text, res.status);
  }
  return new GeminiRequestError(text, res.status);
}

/**
 * Picks the thinking configuration each model family understands.
 * Gemini 3 models take a `thinkingLevel`; 2.5 models take a token budget.
 */
export function thinkingFor(
  model: string,
  level: ThinkingLevel,
): GeminiGenerationConfig["thinkingConfig"] {
  if (model.startsWith("gemini-2.5")) {
    if (model.includes("pro")) return { thinkingBudget: level === "high" ? 4096 : 512 };
    return { thinkingBudget: level === "high" ? 2048 : 0 };
  }
  if (model.startsWith("gemma")) return undefined;
  // Lite models exist for speed: keep them at "minimal" unless deep thinking is requested.
  if (model.includes("lite")) {
    return { thinkingLevel: level === "medium" || level === "high" ? level : "minimal" };
  }
  // "minimal" is only accepted by the lite models; everything else gets at least "low".
  if (level === "minimal") return { thinkingLevel: "low" };
  return { thinkingLevel: level };
}

function isThinkingRejection(error: unknown): boolean {
  return (
    error instanceof GeminiRequestError &&
    /thinking/i.test(error.message) &&
    !/thought.?signature/i.test(error.message)
  );
}

/** True when a replayed function call carries a signature this model cannot validate. */
export function isSignatureRejection(error: unknown): boolean {
  return error instanceof GeminiRequestError && /thought.?signature/i.test(error.message);
}

/**
 * Documented placeholder that tells Gemini to skip thought-signature validation. Used when a
 * turn produced by one model is replayed to another (e.g. after a fallback).
 */
export const SKIP_SIGNATURE = "skip_thought_signature_validator";

export interface CallOptions {
  /** Ordered list of models; the next one is tried when the previous is unavailable. */
  models: string[];
  request: GeminiRequest;
  thinking?: ThinkingLevel;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Retries per model for transient failures before moving to the next model. */
  retries?: number;
}

function withThinking(
  request: GeminiRequest,
  model: string,
  thinking?: ThinkingLevel,
): GeminiRequest {
  if (!thinking) return request;
  const thinkingConfig = thinkingFor(model, thinking);
  if (!thinkingConfig) return request;
  return {
    ...request,
    generationConfig: { ...request.generationConfig, thinkingConfig },
  };
}

function stripThinking(request: GeminiRequest): GeminiRequest {
  if (!request.generationConfig?.thinkingConfig) return request;
  const { thinkingConfig: _drop, ...rest } = request.generationConfig;
  return { ...request, generationConfig: rest };
}

/**
 * Runs `attempt` against each model with retries, falling back down the chain.
 * Transient failures (overload, quota, missing model) move on; request errors are thrown at once.
 */
async function withFallback<T>(
  options: CallOptions,
  attempt: (model: string, request: GeminiRequest) => Promise<T>,
): Promise<{ value: T; model: string }> {
  const retries = options.retries ?? 1;
  let lastError: unknown = new GeminiTransientError("No model configured", 0);

  for (const model of options.models) {
    let request = withThinking(options.request, model, options.thinking);
    for (let i = 0; i <= retries; i++) {
      if (options.signal?.aborted) throw options.signal.reason ?? new Error("aborted");
      try {
        return { value: await attempt(model, request), model };
      } catch (error) {
        lastError = error;
        console.warn(
          "gemini_attempt_failed",
          model,
          error instanceof Error ? error.message.slice(0, 200) : error,
        );
        if (isThinkingRejection(error) && request.generationConfig?.thinkingConfig) {
          // The model does not accept this thinking setting: resend without it (not a retry).
          request = stripThinking(request);
          i--;
          continue;
        }
        if (error instanceof GeminiConfigError || error instanceof GeminiRequestError) throw error;
        // Unknown model, or its quota is spent: retrying the same model cannot help.
        if (error instanceof GeminiTransientError && (error.status === 404 || error.status === 429))
          break;
        if (i < retries) await sleep(350 * 2 ** i + Math.random() * 250, options.signal);
      }
    }
  }
  throw lastError;
}

export async function generateContent(
  options: CallOptions,
): Promise<{ response: GeminiResponse; model: string }> {
  const key = requireKey();
  const { value, model } = await withFallback(options, async (model, request) => {
    const res = await fetch(`${API_BASE}/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(request),
      signal: combineSignals(options.timeoutMs ?? 45_000, options.signal),
    });
    if (!res.ok) throw await toError(res, model);
    return (await res.json()) as GeminiResponse;
  });
  return { response: value, model };
}

async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<GeminiResponse> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Gemini separates SSE events with CRLF pairs; normalise so one boundary rule applies.
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = event
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("");
        if (data) yield JSON.parse(data) as GeminiResponse;
        boundary = buffer.indexOf("\n\n");
      }
    }
    const tail = buffer.trim();
    if (tail.startsWith("data:")) yield JSON.parse(tail.slice(5).trimStart()) as GeminiResponse;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Streams a response. Model fallback applies until the first chunk arrives;
 * after that the stream is committed to the model that answered.
 */
export async function streamContent(
  options: CallOptions,
): Promise<{ stream: AsyncGenerator<GeminiResponse>; model: string }> {
  const key = requireKey();
  const { value, model } = await withFallback(options, async (model, request) => {
    const res = await fetch(`${API_BASE}/models/${model}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(request),
      signal: combineSignals(options.timeoutMs ?? 60_000, options.signal),
    });
    if (!res.ok || !res.body) throw await toError(res, model);
    const iterator = readSse(res.body);
    // Pull the first chunk inside the fallback scope so an early failure can still fall back.
    const first = await iterator.next();
    async function* replay(): AsyncGenerator<GeminiResponse> {
      if (!first.done) yield first.value;
      yield* iterator;
    }
    return replay();
  });
  return { stream: value, model };
}

export interface EmbedOptions {
  model: string;
  task: EmbeddingTask;
  dimensions: number;
  signal?: AbortSignal;
}

const EMBED_BATCH = 64;

/** Embeds texts in batches, preserving order. Vectors are L2-normalised. */
export async function embedTexts(texts: string[], options: EmbedOptions): Promise<number[][]> {
  const key = requireKey();
  const out: number[][] = [];
  for (let start = 0; start < texts.length; start += EMBED_BATCH) {
    const batch = texts.slice(start, start + EMBED_BATCH);
    const body = {
      requests: batch.map((text) => ({
        model: `models/${options.model}`,
        content: { parts: [{ text }] },
        taskType: options.task,
        outputDimensionality: options.dimensions,
      })),
    };
    const fallbackOptions: CallOptions = {
      models: [options.model],
      request: { contents: [] },
      retries: 3,
      ...(options.signal ? { signal: options.signal } : {}),
    };
    const { value } = await withFallback(fallbackOptions, async (model) => {
      const res = await fetch(`${API_BASE}/models/${model}:batchEmbedContents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
        signal: combineSignals(30_000, options.signal),
      });
      if (!res.ok) throw await toError(res, model);
      return (await res.json()) as { embeddings: { values: number[] }[] };
    });
    for (const embedding of value.embeddings) out.push(normalize(embedding.values));
  }
  return out;
}

export function normalize(vector: number[]): number[] {
  let sum = 0;
  for (const v of vector) sum += v * v;
  const norm = Math.sqrt(sum) || 1;
  return vector.map((v) => v / norm);
}

/** Concatenates the visible (non-thought) text parts of a response. */
export function responseText(response: GeminiResponse): string {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => typeof part.text === "string" && !part.thought)
    .map((part) => part.text)
    .join("");
}
