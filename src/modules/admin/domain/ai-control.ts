import { z } from "zod";
import type { AiCapability } from "@/ai/contracts/provider-registry";
import type { GateVerdict } from "@/ai/contracts/evaluation";

export type SubsystemStatus = "healthy" | "warning" | "degraded";

export interface SubsystemHealthItem {
  id: string;
  name: string;
  nameAr: string;
  status: SubsystemStatus;
  message: string;
  messageAr: string;
  lastChecked: string;
}

export interface ActiveCapabilityBinding {
  capability: AiCapability;
  label: string;
  labelAr: string;
  modelId: string;
  modelIdentifier: string;
  providerId: string;
  providerName: string;
  contextWindow?: number | undefined;
  embeddingDimension?: number | undefined;
  isReady: boolean;
  notes?: string | undefined;
}

export interface AiControlOverview {
  overallHealth: SubsystemStatus;
  subsystems: {
    providersCount: number;
    activeModelsCount: number;
    totalModelsCount: number;
    activeAssignmentsCount: number;
    ragIndexedDocumentsCount: number;
    promptTemplatesCount: number;
    evaluationGateVerdict: GateVerdict | "NOT_RUN";
  };
  subsystemHealth: SubsystemHealthItem[];
  activeBindings: ActiveCapabilityBinding[];
  embeddingCompatibility: {
    activeModelId: string;
    activeDimension: number;
    indexDimension: number;
    isCompatible: boolean;
    requiresReindex: boolean;
  };
  ragConfig: {
    chunkSize: number;
    chunkOverlap: number;
    topK: number;
    rerankTopN: number;
    rerankThreshold: number;
    hybridAlpha: number;
    contextTokenBudget: number;
  };
}

export const ValidateAiChangeRequestSchema = z.object({
  changeType: z.enum(["assignment", "rag_config", "runtime_policy"]),
  capability: z.enum(["generation", "embedding", "reranking", "router", "rewrite", "evaluator"]).optional(),
  modelId: z.string().optional(),
  ragConfig: z
    .object({
      chunkSize: z.number().min(64).max(4096).optional(),
      chunkOverlap: z.number().min(0).max(1024).optional(),
      topK: z.number().min(1).max(50).optional(),
      rerankTopN: z.number().min(1).max(30).optional(),
      rerankThreshold: z.number().min(0).max(1).optional(),
      hybridAlpha: z.number().min(0).max(1).optional(),
      contextTokenBudget: z.number().min(256).max(32000).optional(),
    })
    .optional(),
  runtimePolicy: z
    .object({
      defaultTimeoutMs: z.number().min(500).max(60000).optional(),
      maxRetries: z.number().min(0).max(5).optional(),
      failoverEnabled: z.boolean().optional(),
      rateLimitRpm: z.number().min(1).max(1000).optional(),
    })
    .optional(),
});

export type ValidateAiChangeRequest = z.infer<typeof ValidateAiChangeRequestSchema>;

export interface ValidateAiChangeResponse {
  isValid: boolean;
  requiresReindex: boolean;
  reindexReason?: string | undefined;
  warnings: string[];
  errors: string[];
  recommendedGateSuite: "full" | "retrieval" | "generation";
}
