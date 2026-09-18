import { z } from "zod";

export const INGESTION_SOURCE_TYPES = [
  "project",
  "cv",
  "section",
  "block",
  "knowledge_item",
] as const;

export type IngestionSourceType = (typeof INGESTION_SOURCE_TYPES)[number];

export interface RawDocument {
  sourceType: IngestionSourceType;
  sourceId: string;
  title: string;
  locale: "ar" | "en";
  content: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface NormalizedDocument extends RawDocument {
  contentHash: string;
}

export interface ChunkMetadata {
  sourceType: IngestionSourceType;
  sourceId: string;
  title: string;
  locale: "ar" | "en";
  headingHierarchy: string[];
  tags: string[];
  sectionScope?: string | undefined;
  citationId: string;
  contentHash: string;
  qdrantPointId: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  totalChunks: number;
  content: string;
  tokenCount: number;
  citationId: string;
  qdrantPointId: string;
  contentHash: string;
  metadata: ChunkMetadata;
}

export interface RagConfiguration {
  id: string;
  isCurrent: boolean;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  rerankTopN: number;
  rerankThreshold: number;
  hybridAlpha: number;
  contextTokenBudget: number;
  updatedAt: Date;
}

export interface RagIndexStatus {
  activeVersionTag: string | null;
  embeddingModel: string;
  denseDimension: number;
  totalDocuments: number;
  totalChunks: number;
  lastIngestionJob: {
    id: string;
    status: string;
    processedDocuments: number;
    totalDocuments: number;
    errorMessage?: string | null | undefined;
    startedAt: Date;
    completedAt?: Date | null | undefined;
  } | null;
}

export interface EmbeddingPort {
  embed(texts: string[]): Promise<number[][]>;
  readonly dimension: number;
  readonly modelName: string;
}

export const UpdateRagConfigSchema = z.object({
  chunkSize: z.number().int().min(64).max(2048).optional(),
  chunkOverlap: z.number().int().min(0).max(512).optional(),
  topK: z.number().int().min(1).max(50).optional(),
  rerankTopN: z.number().int().min(1).max(20).optional(),
  rerankThreshold: z.number().min(0.0).max(1.0).optional(),
  hybridAlpha: z.number().min(0.0).max(1.0).optional(),
  contextTokenBudget: z.number().int().min(500).max(16000).optional(),
});

export type UpdateRagConfigInput = z.infer<typeof UpdateRagConfigSchema>;

export const TriggerIngestSchema = z.object({
  sourceType: z.enum(INGESTION_SOURCE_TYPES).optional(),
  sourceId: z.string().optional(),
  forceReindex: z.boolean().default(false),
});

export type TriggerIngestInput = z.infer<typeof TriggerIngestSchema>;
