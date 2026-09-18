import { eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  ragConfigurations,
  ragIndexVersions,
  ingestionJobs,
  sourceDocuments,
  sourceChunks,
} from "@/lib/db/schema/ai";
import {
  RagConfiguration,
  RagIndexStatus,
  TriggerIngestInput,
  UpdateRagConfigInput,
} from "@/ai/contracts/ingestion";
import { parseAllSources } from "../parsers";
import { ragIndexer, RagIndexer } from "../indexers/rag-indexer";
import { logger } from "@/lib/observability/logger";

export const BASELINE_RAG_CONFIGURATION: RagConfiguration = {
  id: "cfg-baseline",
  isCurrent: true,
  chunkSize: 512,
  chunkOverlap: 64,
  topK: 10,
  rerankTopN: 5,
  rerankThreshold: 0.3,
  hybridAlpha: 0.5,
  contextTokenBudget: 3000,
  updatedAt: new Date("2026-09-01T00:00:00Z"),
};

export const BASELINE_RAG_STATUS: RagIndexStatus = {
  activeVersionTag: "v1.0.0-bge-m3",
  embeddingModel: "BAAI/bge-m3",
  denseDimension: 1024,
  totalDocuments: 0,
  totalChunks: 0,
  lastIngestionJob: null,
};

export class IngestionService {
  private indexer: RagIndexer;

  constructor(indexer?: RagIndexer) {
    this.indexer = indexer ?? ragIndexer;
  }

  /**
   * Retrieves or creates the default active RAG configuration.
   */
  public async getRagConfiguration(): Promise<RagConfiguration> {
    try {
      const rows = await db
        .select()
        .from(ragConfigurations)
        .where(eq(ragConfigurations.isCurrent, true))
        .limit(1);

      const active = rows[0];
      if (active) {
        return {
          id: active.id,
          isCurrent: active.isCurrent,
          chunkSize: active.chunkSize,
          chunkOverlap: active.chunkOverlap,
          topK: active.topK,
          rerankTopN: active.rerankTopN,
          rerankThreshold: parseFloat(active.rerankThreshold),
          hybridAlpha: parseFloat(active.hybridAlpha),
          contextTokenBudget: active.contextTokenBudget,
          updatedAt: active.updatedAt,
        };
      }

      // Initialize baseline RAG configuration if none exists
      const inserted = await db
        .insert(ragConfigurations)
        .values({
          isCurrent: true,
          chunkSize: 512,
          chunkOverlap: 64,
          topK: 10,
          rerankTopN: 5,
          rerankThreshold: "0.3",
          hybridAlpha: "0.5",
          contextTokenBudget: 3000,
          updatedAt: new Date(),
        })
        .returning();

      const created = inserted[0];
      if (!created) {
        return BASELINE_RAG_CONFIGURATION;
      }

      return {
        id: created.id,
        isCurrent: created.isCurrent,
        chunkSize: created.chunkSize,
        chunkOverlap: created.chunkOverlap,
        topK: created.topK,
        rerankTopN: created.rerankTopN,
        rerankThreshold: parseFloat(created.rerankThreshold),
        hybridAlpha: parseFloat(created.hybridAlpha),
        contextTokenBudget: created.contextTokenBudget,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      logger.warn("Failed to query RAG configuration from database, using baseline", {
        metadata: { error: String(error) },
      });
      return BASELINE_RAG_CONFIGURATION;
    }
  }

  /**
   * Updates RAG runtime configuration.
   */
  public async updateRagConfiguration(input: UpdateRagConfigInput): Promise<RagConfiguration> {
    const current = await this.getRagConfiguration();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.chunkSize !== undefined) updateData["chunkSize"] = input.chunkSize;
    if (input.chunkOverlap !== undefined) updateData["chunkOverlap"] = input.chunkOverlap;
    if (input.topK !== undefined) updateData["topK"] = input.topK;
    if (input.rerankTopN !== undefined) updateData["rerankTopN"] = input.rerankTopN;
    if (input.rerankThreshold !== undefined)
      updateData["rerankThreshold"] = String(input.rerankThreshold);
    if (input.hybridAlpha !== undefined) updateData["hybridAlpha"] = String(input.hybridAlpha);
    if (input.contextTokenBudget !== undefined)
      updateData["contextTokenBudget"] = input.contextTokenBudget;

    const updated = await db
      .update(ragConfigurations)
      .set(updateData)
      .where(eq(ragConfigurations.id, current.id))
      .returning();

    const row = updated[0];
    if (!row) {
      throw new Error("Failed to update RAG configuration");
    }

    return {
      id: row.id,
      isCurrent: row.isCurrent,
      chunkSize: row.chunkSize,
      chunkOverlap: row.chunkOverlap,
      topK: row.topK,
      rerankTopN: row.rerankTopN,
      rerankThreshold: parseFloat(row.rerankThreshold),
      hybridAlpha: parseFloat(row.hybridAlpha),
      contextTokenBudget: row.contextTokenBudget,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Retrieves or creates the current active RAG index version.
   */
  private async getOrCreateActiveIndexVersion(): Promise<{
    id: string;
    versionTag: string;
    embeddingModel: string;
    denseDimension: number;
  }> {
    const versions = await db
      .select()
      .from(ragIndexVersions)
      .where(eq(ragIndexVersions.isCurrent, true))
      .limit(1);

    const active = versions[0];
    if (active) {
      return {
        id: active.id,
        versionTag: active.versionTag,
        embeddingModel: active.embeddingModel,
        denseDimension: active.denseDimension,
      };
    }

    // Create initial v1.0.0-bge-m3 index version
    const inserted = await db
      .insert(ragIndexVersions)
      .values({
        versionTag: "v1.0.0-bge-m3",
        embeddingModel: "BAAI/bge-m3",
        denseDimension: 1024,
        isCurrent: true,
        indexedChunkCount: 0,
        createdAt: new Date(),
      })
      .returning();

    const created = inserted[0];
    if (!created) {
      throw new Error("Failed to create active RAG index version");
    }

    return {
      id: created.id,
      versionTag: created.versionTag,
      embeddingModel: created.embeddingModel,
      denseDimension: created.denseDimension,
    };
  }

  /**
   * Retrieves current RAG index status, document/chunk counts, and latest job telemetry.
   */
  public async getRagIndexStatus(): Promise<RagIndexStatus> {
    try {
      const activeVersion = await this.getOrCreateActiveIndexVersion();

      // Counts
      const docCountResult = await db.select({ value: count() }).from(sourceDocuments);
      const chunkCountResult = await db.select({ value: count() }).from(sourceChunks);

      const totalDocuments = Number(docCountResult[0]?.value ?? 0);
      const totalChunks = Number(chunkCountResult[0]?.value ?? 0);

      // Latest ingestion job
      const jobRows = await db
        .select()
        .from(ingestionJobs)
        .orderBy(desc(ingestionJobs.startedAt))
        .limit(1);

      const latestJob = jobRows[0];

      return {
        activeVersionTag: activeVersion.versionTag,
        embeddingModel: activeVersion.embeddingModel,
        denseDimension: activeVersion.denseDimension,
        totalDocuments,
        totalChunks,
        lastIngestionJob: latestJob
          ? {
              id: latestJob.id,
              status: latestJob.status,
              processedDocuments: latestJob.processedDocuments,
              totalDocuments: latestJob.totalDocuments,
              errorMessage: latestJob.errorMessage,
              startedAt: latestJob.startedAt,
              completedAt: latestJob.completedAt,
            }
          : null,
      };
    } catch (error) {
      logger.warn("Failed to query RAG index status from database, using baseline", {
        metadata: { error: String(error) },
      });
      return BASELINE_RAG_STATUS;
    }
  }

  /**
   * Triggers synchronous or queue ingestion of source documents.
   */
  public async triggerIngestion(input?: TriggerIngestInput): Promise<{
    jobId: string;
    status: string;
    totalDocuments: number;
    processedDocuments: number;
    chunksIndexed: number;
    skippedDocuments: number;
  }> {
    const activeVersion = await this.getOrCreateActiveIndexVersion();
    const config = await this.getRagConfiguration();

    // Create new ingestion job in processing state
    const jobRecords = await db
      .insert(ingestionJobs)
      .values({
        status: "processing",
        indexVersionId: activeVersion.id,
        totalDocuments: 0,
        processedDocuments: 0,
        startedAt: new Date(),
      })
      .returning();

    const job = jobRecords[0];
    if (!job) {
      throw new Error("Failed to initialize ingestion job record");
    }

    try {
      // Parse authoritative sources
      const rawDocuments = await parseAllSources({
        sourceType: input?.sourceType,
        sourceId: input?.sourceId,
      });

      // Update total documents
      await db
        .update(ingestionJobs)
        .set({ totalDocuments: rawDocuments.length })
        .where(eq(ingestionJobs.id, job.id));

      let processedCount = 0;
      let chunksIndexedCount = 0;
      let skippedCount = 0;

      for (const doc of rawDocuments) {
        const result = await this.indexer.indexDocument(doc, {
          forceReindex: input?.forceReindex ?? false,
          chunkOptions: {
            chunkSize: config.chunkSize,
            chunkOverlap: config.chunkOverlap,
          },
        });

        processedCount++;
        chunksIndexedCount += result.chunksIndexed;
        if (result.skipped) {
          skippedCount++;
        }

        // Update progress periodically
        if (processedCount % 5 === 0 || processedCount === rawDocuments.length) {
          await db
            .update(ingestionJobs)
            .set({ processedDocuments: processedCount })
            .where(eq(ingestionJobs.id, job.id));
        }
      }

      // Count total chunks in index
      const chunkCountResult = await db.select({ value: count() }).from(sourceChunks);
      const totalIndexedChunks = Number(chunkCountResult[0]?.value ?? 0);

      // Complete job
      await db
        .update(ingestionJobs)
        .set({
          status: "completed",
          processedDocuments: processedCount,
          completedAt: new Date(),
        })
        .where(eq(ingestionJobs.id, job.id));

      // Update index version chunk count
      await db
        .update(ragIndexVersions)
        .set({ indexedChunkCount: totalIndexedChunks })
        .where(eq(ragIndexVersions.id, activeVersion.id));

      return {
        jobId: job.id,
        status: "completed",
        totalDocuments: rawDocuments.length,
        processedDocuments: processedCount,
        chunksIndexed: chunksIndexedCount,
        skippedDocuments: skippedCount,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Ingestion job failed", { metadata: { jobId: job.id, error: errMsg } });

      await db
        .update(ingestionJobs)
        .set({
          status: "failed",
          errorMessage: errMsg,
          completedAt: new Date(),
        })
        .where(eq(ingestionJobs.id, job.id));

      throw error;
    }
  }
}

export const ingestionService = new IngestionService();
