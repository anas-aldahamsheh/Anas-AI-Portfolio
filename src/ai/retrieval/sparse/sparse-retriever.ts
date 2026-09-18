import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sourceChunks, sourceDocuments } from "@/lib/db/schema/ai";
import { SparseRetrieverPort, RetrievalQuery, ScoredCandidate } from "@/ai/contracts/retrieval";
import { IngestionSourceType } from "@/ai/contracts/ingestion";
import { IVectorStore, vectorStore } from "@/lib/qdrant/vector-store";
import { tokenizeMultilingual, calculateBm25Score } from "./arabic-bm25-tokenizer";
import { matchesRetrievalFilter } from "../filters/filter-builder";
import { logger } from "@/lib/observability/logger";

export interface SparseRetrieverOptions {
  vectorStore?: IVectorStore | undefined;
  collectionName?: string | undefined;
}

interface InternalChunkItem {
  id: string; // qdrantPointId or chunk ID
  documentId: string;
  citationId: string;
  content: string;
  sourceType: IngestionSourceType;
  sourceId: string;
  title: string;
  locale: "ar" | "en";
  headingHierarchy: string[];
  tags: string[];
  sectionScope?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export class SparseRetriever implements SparseRetrieverPort {
  private vectorStore: IVectorStore;
  private collectionName: string;

  constructor(options?: SparseRetrieverOptions) {
    this.vectorStore = options?.vectorStore ?? vectorStore;
    this.collectionName = options?.collectionName ?? "portfolio_rag_bge_m3";
  }

  /**
   * Fetches chunks from database or vector store with offline fallback.
   */
  private async loadCandidateChunks(): Promise<InternalChunkItem[]> {
    try {
      const rows = await db
        .select({
          chunkId: sourceChunks.id,
          documentId: sourceChunks.documentId,
          chunkIndex: sourceChunks.chunkIndex,
          content: sourceChunks.content,
          qdrantPointId: sourceChunks.qdrantPointId,
          sourceType: sourceDocuments.sourceType,
          sourceId: sourceDocuments.sourceId,
          title: sourceDocuments.title,
          localeCode: sourceDocuments.localeCode,
        })
        .from(sourceChunks)
        .innerJoin(sourceDocuments, eq(sourceChunks.documentId, sourceDocuments.id));

      if (rows && rows.length > 0) {
        return rows.map((row) => ({
          id: row.qdrantPointId,
          documentId: row.documentId,
          citationId: `cit:${row.sourceType}:${row.sourceId}:${row.chunkIndex}`,
          content: row.content,
          sourceType: row.sourceType as IngestionSourceType,
          sourceId: row.sourceId,
          title: row.title,
          locale: (row.localeCode === "ar" ? "ar" : "en") as "ar" | "en",
          headingHierarchy: [],
          tags: [],
          metadata: {
            sourceType: row.sourceType,
            sourceId: row.sourceId,
            locale: row.localeCode,
            title: row.title,
          },
        }));
      }
    } catch {
      // Database unavailable (e.g. unit test or offline build), fall back to vector store points
    }

    try {
      const points = await this.vectorStore.scrollPoints(this.collectionName, 500);
      return points.map((pt, idx) => {
        const payload = pt.payload ?? {};
        const sourceType = (payload["sourceType"] as IngestionSourceType) || "project";
        const sourceId = String(payload["sourceId"] ?? "");
        const citationId =
          String(payload["citationId"] ?? "") || `cit:${sourceType}:${sourceId}:${idx}`;
        const documentId = String(payload["documentId"] ?? "");
        const content = String(payload["content"] ?? "");
        const title = String(payload["title"] ?? "");
        const locale = (payload["locale"] as "ar" | "en") || "en";
        const headingHierarchy = Array.isArray(payload["headingHierarchy"])
          ? (payload["headingHierarchy"] as string[])
          : [];
        const tags = Array.isArray(payload["tags"]) ? (payload["tags"] as string[]) : [];
        const sectionScope = payload["sectionScope"] ? String(payload["sectionScope"]) : undefined;

        return {
          id: pt.id,
          documentId,
          citationId,
          content,
          sourceType,
          sourceId,
          title,
          locale,
          headingHierarchy,
          tags,
          sectionScope,
          metadata: payload,
        };
      });
    } catch {
      return [];
    }
  }

  public async retrieve(
    query: RetrievalQuery,
    options?: { topK?: number },
  ): Promise<ScoredCandidate[]> {
    const trimmed = query.text.trim();
    if (!trimmed) {
      return [];
    }

    const queryTokens = tokenizeMultilingual(trimmed);
    if (queryTokens.length === 0) {
      return [];
    }

    const topK = options?.topK ?? query.topK ?? 15;

    try {
      const allChunks = await this.loadCandidateChunks();
      if (allChunks.length === 0) {
        return [];
      }

      // Filter chunks according to metadata filter
      const filteredChunks = allChunks.filter((chunk) => {
        const record = {
          ...chunk.metadata,
          sourceType: chunk.sourceType,
          sourceId: chunk.sourceId,
          locale: chunk.locale,
          sectionScope: chunk.sectionScope,
          tags: chunk.tags,
        };
        return matchesRetrievalFilter(record, query.filter);
      });

      if (filteredChunks.length === 0) {
        return [];
      }

      // Tokenize corpus and calculate statistics
      const tokenizedCorpus = filteredChunks.map((chunk) => {
        const textToTokenize = `${chunk.title} ${chunk.content}`;
        const tokens = tokenizeMultilingual(textToTokenize);
        return { chunk, tokens };
      });

      const totalDocs = tokenizedCorpus.length;
      let totalDocLength = 0;
      const docFrequencyMap = new Map<string, number>();

      for (const { tokens } of tokenizedCorpus) {
        totalDocLength += tokens.length;
        const uniqueTokens = new Set(tokens);
        for (const token of uniqueTokens) {
          docFrequencyMap.set(token, (docFrequencyMap.get(token) ?? 0) + 1);
        }
      }

      const avgDocLength = totalDocs > 0 ? totalDocLength / totalDocs : 1;

      // Score each chunk
      const scoredList: Array<{ chunk: InternalChunkItem; score: number }> = [];

      for (const { chunk, tokens } of tokenizedCorpus) {
        const score = calculateBm25Score({
          queryTokens,
          docTokens: tokens,
          docFrequencyMap,
          totalDocs,
          avgDocLength,
          k1: 1.2,
          b: 0.75,
        });

        if (score > 0) {
          scoredList.push({ chunk, score });
        }
      }

      // Sort descending by BM25 score
      scoredList.sort((a, b) => b.score - a.score);

      return scoredList.slice(0, topK).map(({ chunk, score }, index) => {
        const candidate: ScoredCandidate = {
          id: chunk.id,
          documentId: chunk.documentId,
          citationId: chunk.citationId,
          content: chunk.content,
          score,
          sourceType: chunk.sourceType,
          sourceId: chunk.sourceId,
          title: chunk.title,
          locale: chunk.locale,
          headingHierarchy: chunk.headingHierarchy,
          tags: chunk.tags,
          sectionScope: chunk.sectionScope,
          metadata: chunk.metadata,
          retrieverType: "sparse",
          rank: index + 1,
          rawSparseScore: score,
          sparseRank: index + 1,
        };

        return candidate;
      });
    } catch (err) {
      logger.warn("Sparse BM25 retrieval failed gracefully", {
        module: "retrieval",
        metadata: {
          query: query.text.slice(0, 50),
          error: err instanceof Error ? err.message : String(err),
        },
      });
      return [];
    }
  }
}

export const sparseRetriever = new SparseRetriever();
