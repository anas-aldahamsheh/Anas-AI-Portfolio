import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sourceDocuments, sourceChunks } from "@/lib/db/schema/ai";
import { RawDocument, EmbeddingPort } from "@/ai/contracts/ingestion";
import { normalizeDocument } from "../normalizers/content-normalizer";
import { chunkDocument, ChunkerOptions } from "../chunkers/semantic-chunker";
import { vectorStore, IVectorStore } from "@/lib/qdrant/vector-store";
import { deterministicEmbeddingAdapter } from "@/ai/embeddings/adapters/deterministic-embedding-adapter";

export interface IndexDocumentResult {
  documentId: string;
  chunksIndexed: number;
  skipped: boolean;
}

export interface RagIndexerOptions {
  collectionName?: string;
  vectorStore?: IVectorStore;
  embeddingPort?: EmbeddingPort;
}

export class RagIndexer {
  private collectionName: string;
  private vectorStore: IVectorStore;
  private embeddingPort: EmbeddingPort;

  constructor(options?: RagIndexerOptions) {
    this.collectionName = options?.collectionName ?? "portfolio_rag_bge_m3";
    this.vectorStore = options?.vectorStore ?? vectorStore;
    this.embeddingPort = options?.embeddingPort ?? deterministicEmbeddingAdapter;
  }

  /**
   * Initializes target collection in vector store if not yet created.
   */
  public async initialize(): Promise<void> {
    await this.vectorStore.createCollectionIfNotExists(
      this.collectionName,
      this.embeddingPort.dimension,
    );
  }

  /**
   * Indexes a single RawDocument with idempotency, deduplication, and atomic chunk updates.
   */
  public async indexDocument(
    doc: RawDocument,
    options?: {
      forceReindex?: boolean | undefined;
      chunkOptions?: ChunkerOptions | undefined;
    },
  ): Promise<IndexDocumentResult> {
    await this.initialize();

    const normalized = normalizeDocument(doc);

    // Check if source document already exists
    const existingDocs = await db
      .select({
        id: sourceDocuments.id,
        contentHash: sourceDocuments.contentHash,
      })
      .from(sourceDocuments)
      .where(
        and(
          eq(sourceDocuments.sourceType, normalized.sourceType),
          eq(sourceDocuments.sourceId, normalized.sourceId),
          eq(sourceDocuments.localeCode, normalized.locale),
        ),
      )
      .limit(1);

    const existingDoc = existingDocs[0];

    // Idempotency: skip re-indexing if content hash has not changed
    if (
      existingDoc &&
      !options?.forceReindex &&
      existingDoc.contentHash === normalized.contentHash
    ) {
      return {
        documentId: existingDoc.id,
        chunksIndexed: 0,
        skipped: true,
      };
    }

    // Generate semantic chunks
    const chunks = chunkDocument(normalized, options?.chunkOptions);
    if (chunks.length === 0) {
      return {
        documentId: existingDoc?.id ?? "",
        chunksIndexed: 0,
        skipped: false,
      };
    }

    // Embed all chunks concurrently
    const chunkTexts = chunks.map((c) => c.content);
    const vectors = await this.embeddingPort.embed(chunkTexts);

    let docRecordId: string;

    if (existingDoc) {
      docRecordId = existingDoc.id;

      // Update existing document record
      await db
        .update(sourceDocuments)
        .set({
          title: normalized.title,
          contentHash: normalized.contentHash,
          updatedAt: new Date(),
        })
        .where(eq(sourceDocuments.id, docRecordId));

      // Fetch old chunks to remove their vector points
      const oldChunks = await db
        .select({ qdrantPointId: sourceChunks.qdrantPointId })
        .from(sourceChunks)
        .where(eq(sourceChunks.documentId, docRecordId));

      if (oldChunks.length > 0) {
        await this.vectorStore.deletePoints(
          this.collectionName,
          oldChunks.map((c) => c.qdrantPointId),
        );
      }

      // Delete old chunk records from database
      await db.delete(sourceChunks).where(eq(sourceChunks.documentId, docRecordId));
    } else {
      // Insert new document record
      const inserted = await db
        .insert(sourceDocuments)
        .values({
          sourceType: normalized.sourceType,
          sourceId: normalized.sourceId,
          title: normalized.title,
          contentHash: normalized.contentHash,
          localeCode: normalized.locale,
          updatedAt: new Date(),
        })
        .returning({ id: sourceDocuments.id });

      const first = inserted[0];
      if (!first) {
        throw new Error("Failed to insert source document record");
      }
      docRecordId = first.id;
    }

    // Insert new chunk records into relational database
    await db.insert(sourceChunks).values(
      chunks.map((chunk) => ({
        documentId: docRecordId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        qdrantPointId: chunk.qdrantPointId,
      })),
    );

    // Upsert vectors and rich metadata payload to vector store
    const points = chunks.map((chunk, idx) => {
      const vector = vectors[idx] ?? new Array(this.embeddingPort.dimension).fill(0);
      return {
        id: chunk.qdrantPointId,
        vector,
        payload: {
          ...chunk.metadata,
          content: chunk.content,
          documentId: docRecordId,
        },
      };
    });

    await this.vectorStore.upsertPoints(this.collectionName, points);

    return {
      documentId: docRecordId,
      chunksIndexed: chunks.length,
      skipped: false,
    };
  }

  /**
   * Deletes all vector points and database records for a given source entity.
   */
  public async removeSource(sourceType: string, sourceId: string): Promise<void> {
    const docs = await db
      .select({ id: sourceDocuments.id })
      .from(sourceDocuments)
      .where(
        and(eq(sourceDocuments.sourceType, sourceType), eq(sourceDocuments.sourceId, sourceId)),
      );

    for (const doc of docs) {
      const chunks = await db
        .select({ qdrantPointId: sourceChunks.qdrantPointId })
        .from(sourceChunks)
        .where(eq(sourceChunks.documentId, doc.id));

      if (chunks.length > 0) {
        await this.vectorStore.deletePoints(
          this.collectionName,
          chunks.map((c) => c.qdrantPointId),
        );
      }

      await db.delete(sourceChunks).where(eq(sourceChunks.documentId, doc.id));
      await db.delete(sourceDocuments).where(eq(sourceDocuments.id, doc.id));
    }
  }
}

export const ragIndexer = new RagIndexer();
