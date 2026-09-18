import { DenseRetrieverPort, RetrievalQuery, ScoredCandidate } from "@/ai/contracts/retrieval";
import { EmbeddingPort, IngestionSourceType } from "@/ai/contracts/ingestion";
import { IVectorStore, vectorStore } from "@/lib/qdrant/vector-store";
import { getActiveEmbeddingAdapter } from "@/ai/embeddings/factory";
import { buildVectorSearchFilter } from "../filters/filter-builder";
import { logger } from "@/lib/observability/logger";

export interface DenseRetrieverOptions {
  embeddingPort?: EmbeddingPort | undefined;
  vectorStore?: IVectorStore | undefined;
  collectionName?: string | undefined;
}

export class DenseRetriever implements DenseRetrieverPort {
  private embeddingPort?: EmbeddingPort | undefined;
  private vectorStore: IVectorStore;
  private collectionName: string;

  constructor(options?: DenseRetrieverOptions) {
    this.embeddingPort = options?.embeddingPort;
    this.vectorStore = options?.vectorStore ?? vectorStore;
    this.collectionName = options?.collectionName ?? "portfolio_rag_bge_m3";
  }

  private async resolveEmbeddingPort(): Promise<EmbeddingPort> {
    if (this.embeddingPort) {
      return this.embeddingPort;
    }
    return getActiveEmbeddingAdapter();
  }

  public async retrieve(
    query: RetrievalQuery,
    options?: { topK?: number },
  ): Promise<ScoredCandidate[]> {
    const trimmed = query.text.trim();
    if (!trimmed) {
      return [];
    }

    const topK = options?.topK ?? query.topK ?? 15;

    try {
      const port = await this.resolveEmbeddingPort();
      const vectors = await port.embed([trimmed]);
      const queryVector = vectors[0];

      if (!queryVector || queryVector.length === 0) {
        return [];
      }

      const searchFilter = buildVectorSearchFilter(query.filter);
      const points = await this.vectorStore.search(
        this.collectionName,
        queryVector,
        topK,
        searchFilter,
      );

      return points.map((point, index) => {
        const payload = (point.payload ?? {}) as Record<string, unknown>;

        const sourceType = (payload["sourceType"] as IngestionSourceType) || "project";
        const sourceId = String(payload["sourceId"] ?? "");
        const documentId = String(payload["documentId"] ?? "");
        const citationId =
          String(payload["citationId"] ?? "") || `cit:${sourceType}:${sourceId}:${index}`;
        const content = String(payload["content"] ?? "");
        const title = String(payload["title"] ?? "");
        const locale = (payload["locale"] as "ar" | "en") || query.locale || "en";
        const headingHierarchy = Array.isArray(payload["headingHierarchy"])
          ? (payload["headingHierarchy"] as string[])
          : [];
        const tags = Array.isArray(payload["tags"]) ? (payload["tags"] as string[]) : [];
        const sectionScope = payload["sectionScope"] ? String(payload["sectionScope"]) : undefined;

        const candidate: ScoredCandidate = {
          id: point.id,
          documentId,
          citationId,
          content,
          score: point.score,
          sourceType,
          sourceId,
          title,
          locale,
          headingHierarchy,
          tags,
          sectionScope,
          metadata: payload,
          retrieverType: "dense",
          rank: index + 1,
          rawDenseScore: point.score,
          denseRank: index + 1,
        };

        return candidate;
      });
    } catch (err) {
      logger.warn("Dense retrieval execution failed gracefully", {
        module: "retrieval",
        metadata: {
          collection: this.collectionName,
          query: query.text.slice(0, 50),
          error: err instanceof Error ? err.message : String(err),
        },
      });
      return [];
    }
  }
}

export const denseRetriever = new DenseRetriever();
