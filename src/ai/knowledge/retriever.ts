import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { embedTexts } from "@/ai/gemini/client";
import { EMBEDDING, type KnowledgeKind } from "./config";
import { normalizeArabic, toTsQuery } from "./normalize";
import { rerankPassages } from "./reranker";

export interface SearchOptions {
  query: string;
  kinds?: KnowledgeKind[];
  /** Language of the conversation; matching chunks get a small boost and win cross-language duplicates. */
  preferLocale?: "en" | "ar";
  limit?: number;
  rerank?: boolean;
  signal?: AbortSignal;
}

export interface SearchHit {
  chunkId: string;
  sourceKey: string;
  entryId: string | null;
  kind: string;
  locale: string;
  title: string;
  heading: string;
  text: string;
  url: string | null;
  score: number;
  signals: {
    dense: number | null;
    lexical: number | null;
    title: number | null;
    rerank: number | null;
  };
}

interface Row extends Record<string, unknown> {
  chunk_id: string;
  source_id: string;
  source_key: string;
  entry_id: string | null;
  kind: string;
  locale: string;
  title: string;
  heading: string;
  text: string;
  ordinal: number;
  url: string | null;
  score: number;
  dense_rank: number | null;
  lexical_rank: number | null;
  title_rank: number | null;
}

const RRF_K = 60;
const CANDIDATES = 48;

// Query embeddings are cached per instance: recruiters ask the same few questions a lot.
const queryVectorCache = new Map<string, number[]>();
const CACHE_LIMIT = 500;

async function embedQuery(query: string, signal?: AbortSignal): Promise<number[] | null> {
  const key = query.trim().toLowerCase();
  const cached = queryVectorCache.get(key);
  if (cached) return cached;
  try {
    const timeout = AbortSignal.timeout(6000);
    const [vector] = await embedTexts([query], {
      model: EMBEDDING.model,
      task: "RETRIEVAL_QUERY",
      dimensions: EMBEDDING.dimensions,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!vector) return null;
    if (queryVectorCache.size >= CACHE_LIMIT) {
      const oldest = queryVectorCache.keys().next().value;
      if (oldest !== undefined) queryVectorCache.delete(oldest);
    }
    queryVectorCache.set(key, vector);
    return vector;
  } catch (error) {
    // Degrade to keyword + title search rather than failing the turn.
    console.error("query_embedding_failed", error instanceof Error ? error.message : error);
    return null;
  }
}

function kindFilter(kinds?: KnowledgeKind[]) {
  if (!kinds || kinds.length === 0) return sql``;
  return sql`and c.kind in (${sql.join(
    kinds.map((k) => sql`${k}`),
    sql`, `,
  )})`;
}

/**
 * Hybrid retrieval in a single round-trip:
 *   dense (pgvector cosine, HNSW) + lexical (Postgres full-text over bilingual normalised terms)
 *   + fuzzy title match (pg_trgm), fused with weighted Reciprocal Rank Fusion.
 * Then: cross-language de-duplication, per-source diversity, optional LLM reranking.
 */
export async function hybridSearch(options: SearchOptions): Promise<SearchHit[]> {
  const query = options.query.trim().slice(0, 500);
  const limit = Math.min(Math.max(options.limit ?? 8, 1), 20);
  if (!query) return [];

  const [vector, tsQuery] = await Promise.all([
    embedQuery(query, options.signal),
    Promise.resolve(toTsQuery(query)),
  ]);
  const titleQuery = normalizeArabic(query.toLowerCase());
  const filter = kindFilter(options.kinds);
  const prefer = options.preferLocale ?? "en";

  const denseCte = vector
    ? sql`select c.id, row_number() over (order by c.embedding <=> ${`[${vector.join(",")}]`}::vector) as rank
          from knowledge_chunks c
          where c.embedding is not null ${filter}
          order by c.embedding <=> ${`[${vector.join(",")}]`}::vector
          limit ${CANDIDATES}`
    : sql`select null::uuid as id, null::bigint as rank where false`;

  const lexicalCte = tsQuery
    ? sql`select c.id, row_number() over (order by ts_rank_cd(c.tsv, q.query, 32) desc) as rank
          from knowledge_chunks c, to_tsquery('simple', ${tsQuery}) as q(query)
          where c.tsv @@ q.query ${filter}
          order by ts_rank_cd(c.tsv, q.query, 32) desc
          limit ${CANDIDATES}`
    : sql`select null::uuid as id, null::bigint as rank where false`;

  const statement = sql`
    with dense as (${denseCte}),
    lexical as (${lexicalCte}),
    titles as (
      select c.id, row_number() over (order by word_similarity(${titleQuery}, lower(c.heading)) desc) as rank
      from knowledge_chunks c
      where word_similarity(${titleQuery}, lower(c.heading)) >= 0.45 ${filter}
      order by word_similarity(${titleQuery}, lower(c.heading)) desc
      limit 16
    ),
    fused as (
      select id,
        sum(weight / (${RRF_K} + rank)) as score,
        min(rank) filter (where src = 'dense') as dense_rank,
        min(rank) filter (where src = 'lexical') as lexical_rank,
        min(rank) filter (where src = 'title') as title_rank
      from (
        select id, rank, 1.0 as weight, 'dense' as src from dense
        union all select id, rank, 0.85, 'lexical' from lexical
        union all select id, rank, 0.45, 'title' from titles
      ) ranked
      group by id
    )
    select c.id as chunk_id, c.source_id, s.source_key, s.entry_id, c.kind, c.locale, s.title,
      c.heading, c.text, c.ordinal, s.url,
      (f.score * case when c.locale = ${prefer} then 1.12 else 1 end)::float8 as score,
      f.dense_rank::int, f.lexical_rank::int, f.title_rank::int
    from fused f
    join knowledge_chunks c on c.id = f.id
    join knowledge_sources s on s.id = c.source_id
    order by score desc
    limit ${CANDIDATES}
  `;

  const rows = (await db.execute<Row>(statement)) as unknown as Row[];
  const candidates = diversify(rows, prefer);

  let hits: SearchHit[] = candidates.map((row) => ({
    chunkId: row.chunk_id,
    sourceKey: row.source_key,
    entryId: row.entry_id,
    kind: row.kind,
    locale: row.locale,
    title: row.title,
    heading: row.heading,
    text: row.text,
    url: row.url,
    score: Number(row.score),
    signals: {
      dense: row.dense_rank,
      lexical: row.lexical_rank,
      title: row.title_rank,
      rerank: null,
    },
  }));

  if ((options.rerank ?? true) && hits.length > limit) {
    hits = await rerankPassages(query, hits, {
      keep: limit,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }
  return hits.slice(0, limit);
}

/**
 * - An entry is indexed once per language; keep only the language of its best chunk so the
 *   model never sees the same fact twice.
 * - At most three chunks per source, so one long document cannot crowd out everything else.
 */
function diversify(rows: Row[], prefer: string): Row[] {
  const chosenLocale = new Map<string, string>();
  const perSource = new Map<string, number>();
  const out: Row[] = [];
  for (const row of rows) {
    const identity = row.entry_id ?? row.source_key.replace(/:(en|ar)$/, "");
    const locale = chosenLocale.get(identity);
    if (!locale) chosenLocale.set(identity, row.locale);
    else if (locale !== row.locale) continue;
    const used = perSource.get(row.source_id) ?? 0;
    if (used >= 3) continue;
    perSource.set(row.source_id, used + 1);
    out.push(row);
  }
  // Stable: keep fused order, but if two entries tie on language, the preferred one leads.
  return out.sort((a, b) => b.score - a.score || (a.locale === prefer ? -1 : 1));
}
