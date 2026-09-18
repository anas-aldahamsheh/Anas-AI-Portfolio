import { z } from "zod";

export type AiCapability =
  "generation" | "embedding" | "reranking" | "router" | "rewrite" | "evaluator";

export type AiProviderType = "openai_compatible" | "anthropic" | "custom_http" | "ollama";

export const AI_CAPABILITIES: readonly AiCapability[] = [
  "generation",
  "embedding",
  "reranking",
  "router",
  "rewrite",
  "evaluator",
] as const;

export const AI_PROVIDER_TYPES: readonly AiProviderType[] = [
  "openai_compatible",
  "anthropic",
  "custom_http",
  "ollama",
] as const;

export interface AiProvider {
  id: string;
  name: string;
  providerType: AiProviderType;
  baseUrl: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiModel {
  id: string;
  providerId: string;
  modelId: string;
  capability: AiCapability;
  isEnabled: boolean;
  contextWindow?: number | null | undefined;
  maxOutputTokens?: number | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface AiModelAssignment {
  id: string;
  capability: AiCapability;
  modelId: string;
  environment: string;
  isActive: boolean;
  updatedAt: string;
}

export interface AiRuntimePolicy {
  id: string;
  timeoutMs: number;
  maxRetries: number;
  rateLimitRpm: number;
  updatedAt: string;
}

// Display-safe views (secrets never exposed to client)
export interface DisplaySafeProvider extends AiProvider {
  modelsCount: number;
  activeModelsCount: number;
}

export interface DisplaySafeModel extends AiModel {
  providerName: string;
  providerType: AiProviderType;
  isCurrentlyAssigned: boolean;
}

export interface DisplaySafeAssignment {
  id: string;
  capability: AiCapability;
  modelId: string;
  modelName: string;
  providerId: string;
  providerName: string;
  providerType: AiProviderType;
  environment: string;
  isActive: boolean;
  updatedAt: string;
}

export interface CapabilityTestResult {
  success: boolean;
  capability: AiCapability;
  modelId: string;
  providerName: string;
  latencyMs: number;
  message: string;
  details?:
    | {
        dimension?: number | undefined;
        testedBilingual?: boolean | undefined;
        scoreSample?: number | undefined;
        tokensGenerated?: number | undefined;
      }
    | undefined;
  testedAt: string;
}

// Validation schemas
export const createProviderSchema = z.object({
  name: z.string().min(2, "Provider name must be at least 2 characters").max(100),
  providerType: z.enum(["openai_compatible", "anthropic", "custom_http", "ollama"] as const),
  baseUrl: z.string().url("Invalid base URL"),
  isEnabled: z.boolean().default(true),
});

export const updateProviderSchema = createProviderSchema.partial();

export const createModelSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  modelId: z.string().min(1, "Model ID is required").max(128),
  capability: z.enum([
    "generation",
    "embedding",
    "reranking",
    "router",
    "rewrite",
    "evaluator",
  ] as const),
  isEnabled: z.boolean().default(true),
  contextWindow: z.number().int().positive().optional().nullable(),
  maxOutputTokens: z.number().int().positive().optional().nullable(),
});

export const updateModelSchema = z.object({
  isEnabled: z.boolean().optional(),
  contextWindow: z.number().int().positive().optional().nullable(),
  maxOutputTokens: z.number().int().positive().optional().nullable(),
});

export const assignModelSchema = z.object({
  capability: z.enum([
    "generation",
    "embedding",
    "reranking",
    "router",
    "rewrite",
    "evaluator",
  ] as const),
  modelId: z.string().min(1, "Model ID is required"),
  environment: z.string().default("production"),
});

export const runtimePolicySchema = z.object({
  timeoutMs: z.number().int().min(1000).max(120000).default(30000),
  maxRetries: z.number().int().min(0).max(5).default(2),
  rateLimitRpm: z.number().int().min(1).max(600).default(30),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
export type AssignModelInput = z.infer<typeof assignModelSchema>;
export type RuntimePolicyInput = z.infer<typeof runtimePolicySchema>;

export interface UpdateRuntimePolicyInput {
  timeoutMs?: number | undefined;
  maxRetries?: number | undefined;
  rateLimitRpm?: number | undefined;
}
