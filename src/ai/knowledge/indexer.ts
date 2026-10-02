import { createHash } from "node:crypto";
import { and, eq, inArray, isNotNull, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { knowledgeChunks, knowledgeSources } from "@/lib/db/schema";
import { embedTexts, GeminiTransientError } from "@/ai/gemini/client";
import { chunkDocument, embeddingInput, type KnowledgeSection } from "./chunker";
import { toSearchText } from "./normalize";
import { EMBEDDING, type KnowledgeKind } from "./config";

/** Bump when chunking/normalisation changes so every source is rebuilt on the next sync. */
const PIPELINE_VERSION = 3;

export interface KnowledgeSourceInput {
  /** Deterministic identity, e.g. `entry:<uuid>:en`. Same key = same source (replaced, never duplicated). */
  key: string;
  entryId?: string | null;
  kind: KnowledgeKind;
  locale: string;
  title: string;
  url?: string | null;
  sections: KnowledgeSection[];
  metadata?: Record<string, unknown>;
}

export interface SyncResult {
  /** Chunks whose text was unchanged, so their vector was kept instead of re-embedded. */
  reused?: number;
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
  chunks: number;
  embeddingFailures: number;
}

function hashSource(input: KnowledgeSourceInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        v: PIPELINE_VERSION,
        model: EMBEDDING.model,
        dims: EMBEDDING.dimensions,
        kind: input.kind,
        locale: input.locale,
        title: input.title,
        url: input.url ?? null,
        sections: input.sections,
        metadata: input.metadata ?? {},
      }),
    )
    .digest("hex");
}

/** Chunks sent per embedding call; the free tier counts every chunk as one request. */
const EMBED_BATCH = 50;

export interface EmbedPacing {
  /**
   * Wait out per-minute rate limits instead of stopping (deploy-time builds can afford to; a
   * request from the admin cannot). A spent daily quota always stops the run.
   */
  patient?: boolean;
}

/** "Please retry in 7h3m4.7s." → milliseconds, or null when the message gives no delay. */
function retryDelayMs(message: string): number | null {
  const match = /retry in (?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/i.exec(message);
  if (!match || !match[0].trim().match(/\d/)) return null;
  const [, h = "0", m = "0", sec = "0"] = match;
  return ((Number(h) * 60 + Number(m)) * 60 + Number(sec)) * 1000;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Embeds texts batch by batch and keeps every vector it got: a failure part-way (usually a rate
 * limit) leaves only the remaining texts without a vector, to be repaired later.
 */
async function embedInBatches(
  texts: string[],
  pacing: EmbedPacing = {},
): Promise<(number[] | null)[]> {
  const out: (number[] | null)[] = texts.map(() => null);
  for (let start = 0; start < texts.length; start += EMBED_BATCH) {
    const batch = texts.slice(start, start + EMBED_BATCH);
    for (let attempt = 0; ; attempt++) {
      try {
        const vectors = await embedTexts(batch, {
          model: EMBEDDING.model,
          task: "RETRIEVAL_DOCUMENT",
          dimensions: EMBEDDING.dimensions,
        });
        vectors.forEach((vector, i) => {
          out[start + i] = vector;
        });
        break;
      } catch (error) {
        const rateLimited = error instanceof GeminiTransientError && error.status === 429;
        // The API says how long to wait: seconds for the per-minute limit, hours once the
        // daily quota is spent, and nothing when the plan refuses the call (waiting is pointless
        // in both cases).
        const delay = rateLimited ? retryDelayMs((error as Error).message) : null;
        if (rateLimited && pacing.patient && attempt < 4 && delay !== null && delay <= 120_000) {
          await wait(delay + 2_000);
          continue;
        }
        console.error("knowledge_embedding_failed", error instanceof Error ? error.message : error);
        return out;
      }
    }
  }
  return out;
}

const textKey = (heading: string, text: string) =>
  createHash("sha256").update(embeddingInput({ heading, text })).digest("hex");

function toVectorLiteral(vector: number[]): string {
  return `[${vector.map((v) => (Number.isFinite(v) ? v.toFixed(7) : "0")).join(",")}]`;
}

interface PreparedSource {
  input: KnowledgeSourceInput;
  hash: string;
  chunks: { ordinal: number; heading: string; text: string; embedding: number[] | null }[];
}

/**
 * Brings the index in line with `inputs`:
 *  - new or changed sources are re-chunked and re-embedded (unchanged ones are skipped by hash);
 *  - when `scope` is given, sources inside that scope that are NOT in `inputs` are deleted,
 *    so removed or unpublished content is forgotten immediately.
 * If embedding fails the chunks are still stored for keyword search and flagged for repair.
 */
export async function syncKnowledge(
  inputs: KnowledgeSourceInput[],
  scope?: { kinds?: KnowledgeKind[]; entryIds?: string[]; all?: boolean },
  pacing: EmbedPacing = {},
): Promise<SyncResult> {
  const result: SyncResult = {
    added: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
    chunks: 0,
    embeddingFailures: 0,
  };

  const keys = inputs.map((i) => i.key);
  const existing = keys.length
    ? await db
        .select({
          id: knowledgeSources.id,
          key: knowledgeSources.sourceKey,
          hash: knowledgeSources.contentHash,
          status: knowledgeSources.status,
          model: knowledgeSources.embeddingModel,
        })
        .from(knowledgeSources)
        .where(inArray(knowledgeSources.sourceKey, keys))
    : [];
  const byKey = new Map(existing.map((row) => [row.key, row]));

  // 1. Work out what changed.
  const changed: PreparedSource[] = [];
  for (const input of inputs) {
    const hash = hashSource(input);
    const current = byKey.get(input.key);
    if (current && current.hash === hash && current.status === "ready") {
      result.unchanged++;
      continue;
    }
    const chunks = chunkDocument({ title: input.title, sections: input.sections }).map((c) => ({
      ...c,
      embedding: null as number[] | null,
    }));
    changed.push({ input, hash, chunks });
  }

  // 2. Reuse the vectors of chunks whose text did not change, then embed only the new text.
  const pending = changed.flatMap((source) => source.chunks);
  const previousIds = changed.flatMap((source) => {
    const current = byKey.get(source.input.key);
    return current && current.model === EMBEDDING.model ? [current.id] : [];
  });
  if (pending.length > 0 && previousIds.length > 0) {
    const previous = await db
      .select({
        heading: knowledgeChunks.heading,
        text: knowledgeChunks.text,
        embedding: sql<string>`${knowledgeChunks.embedding}::text`,
      })
      .from(knowledgeChunks)
      .where(
        and(inArray(knowledgeChunks.sourceId, previousIds), isNotNull(knowledgeChunks.embedding)),
      );
    const reusable = new Map(
      previous.map((row) => [
        textKey(row.heading, row.text),
        JSON.parse(row.embedding) as number[],
      ]),
    );
    for (const chunk of pending)
      chunk.embedding = reusable.get(textKey(chunk.heading, chunk.text)) ?? null;
    result.reused = pending.filter((chunk) => chunk.embedding).length;
  }
  const missing = pending.filter((chunk) => !chunk.embedding);
  if (missing.length > 0) {
    const vectors = await embedInBatches(
      missing.map((chunk) => embeddingInput(chunk)),
      pacing,
    );
    missing.forEach((chunk, i) => {
      chunk.embedding = vectors[i] ?? null;
    });
    result.embeddingFailures = vectors.filter((vector) => !vector).length;
  }

  // 3. Write each changed source atomically: its old chunks disappear with the new ones' arrival.
  for (const source of changed) {
    const { input, hash, chunks } = source;
    const embedded = chunks.every((c) => c.embedding);
    const status = embedded ? "ready" : "partial";
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(knowledgeSources)
        .values({
          sourceKey: input.key,
          entryId: input.entryId ?? null,
          kind: input.kind,
          locale: input.locale,
          title: input.title,
          url: input.url ?? null,
          contentHash: hash,
          status,
          error: embedded ? null : "Embeddings unavailable; keyword search only until repaired",
          chunkCount: chunks.length,
          embeddingModel: EMBEDDING.model,
          indexedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: knowledgeSources.sourceKey,
          set: {
            entryId: input.entryId ?? null,
            kind: input.kind,
            locale: input.locale,
            title: input.title,
            url: input.url ?? null,
            contentHash: hash,
            status,
            error: embedded ? null : "Embeddings unavailable; keyword search only until repaired",
            chunkCount: chunks.length,
            embeddingModel: EMBEDDING.model,
            indexedAt: new Date(),
          },
        })
        .returning({ id: knowledgeSources.id });
      if (!row) throw new Error(`Failed to upsert knowledge source ${input.key}`);
      await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.sourceId, row.id));
      if (chunks.length > 0) {
        await tx.insert(knowledgeChunks).values(
          chunks.map((chunk) => ({
            sourceId: row.id,
            ordinal: chunk.ordinal,
            kind: input.kind,
            locale: input.locale,
            heading: chunk.heading,
            text: chunk.text,
            searchText: toSearchText(`${chunk.heading} ${chunk.text}`),
            embedding: chunk.embedding ? sql`${toVectorLiteral(chunk.embedding)}::vector` : null,
            metadata: { ...(input.metadata ?? {}), url: input.url ?? null },
          })),
        );
      }
    });
    if (byKey.has(input.key)) result.updated++;
    else result.added++;
    result.chunks += chunks.length;
  }

  // 4. Forget whatever is no longer part of the site.
  if (scope) {
    const conditions = [];
    if (keys.length) conditions.push(notInArray(knowledgeSources.sourceKey, keys));
    if (!scope.all) {
      if (scope.kinds?.length) conditions.push(inArray(knowledgeSources.kind, scope.kinds));
      if (scope.entryIds?.length)
        conditions.push(inArray(knowledgeSources.entryId, scope.entryIds));
      if (!scope.kinds?.length && !scope.entryIds?.length) return result;
    }
    const removed = await db
      .delete(knowledgeSources)
      .where(conditions.length ? and(...conditions) : undefined)
      .returning({ id: knowledgeSources.id });
    result.removed = removed.length;
  }

  return result;
}

/** Deletes every indexed source that belongs to the given entries (and their chunks). */
export async function forgetEntries(entryIds: string[]): Promise<number> {
  if (entryIds.length === 0) return 0;
  const removed = await db
    .delete(knowledgeSources)
    .where(inArray(knowledgeSources.entryId, entryIds))
    .returning({ id: knowledgeSources.id });
  return removed.length;
}

/**
 * Re-embeds chunks stored without a vector (e.g. the embedding API was down or rate-limited
 * during a save), in rounds until none are left or the API stops answering.
 */
export async function repairMissingEmbeddings(pacing: EmbedPacing = {}): Promise<number> {
  let repaired = 0;
  for (;;) {
    const rows = await db
      .select({
        id: knowledgeChunks.id,
        heading: knowledgeChunks.heading,
        text: knowledgeChunks.text,
        sourceId: knowledgeChunks.sourceId,
      })
      .from(knowledgeChunks)
      .where(isNull(knowledgeChunks.embedding))
      .limit(256);
    if (rows.length === 0) return repaired;
    const vectors = await embedInBatches(
      rows.map((row) => embeddingInput(row)),
      pacing,
    );
    const done = rows.flatMap((row, i) => (vectors[i] ? [{ row, vector: vectors[i] }] : []));
    if (done.length === 0) return repaired;
    await db.transaction(async (tx) => {
      for (const { row, vector } of done) {
        await tx
          .update(knowledgeChunks)
          .set({ embedding: sql`${toVectorLiteral(vector)}::vector` })
          .where(eq(knowledgeChunks.id, row.id));
      }
      const sourceIds = [...new Set(done.map(({ row }) => row.sourceId))];
      await tx.execute(sql`
        update knowledge_sources s set status = 'ready', error = null
        where s.id in (${sql.join(
          sourceIds.map((id) => sql`${id}::uuid`),
          sql`, `,
        )})
          and not exists (select 1 from knowledge_chunks c where c.source_id = s.id and c.embedding is null)
      `);
    });
    repaired += done.length;
    if (done.length < rows.length) return repaired;
  }
}
