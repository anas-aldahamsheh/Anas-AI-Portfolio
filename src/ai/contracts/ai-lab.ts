import { z } from "zod";

export type AiLabDemoType =
  | "hybrid_search"
  | "reranking"
  | "structured_extraction"
  | "citation_verification"
  | "retrieval_comparison";

export const AI_LAB_DEMO_TYPES: [AiLabDemoType, ...AiLabDemoType[]] = [
  "hybrid_search",
  "reranking",
  "structured_extraction",
  "citation_verification",
  "retrieval_comparison",
];

export interface AiLabDemoConfig {
  id: string;
  slug: string;
  type: AiLabDemoType;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  isPublished: boolean;
  rateLimitRpm: number;
  timeoutMs: number;
  sortOrder: number;
}

export interface LocalizedAiLabDemo {
  id: string;
  slug: string;
  type: AiLabDemoType;
  title: string;
  description: string;
  isPublished: boolean;
  rateLimitRpm: number;
  timeoutMs: number;
  sortOrder: number;
}

export interface AiLabExecutionTelemetry {
  latencyMs: number;
  tokensUsed?: number | undefined;
  realExecution: boolean;
  details?: Record<string, unknown> | undefined;
}

export interface AiLabExecutionResult<T = unknown> {
  demoSlug: string;
  type: AiLabDemoType;
  data: T;
  telemetry: AiLabExecutionTelemetry;
}

export interface AiLabExecutionInput {
  demoSlug: string;
  params: Record<string, unknown>;
  locale?: string | undefined;
}

export const AiLabRunSchema = z.object({
  demoSlug: z.string().min(1, "Demo slug is required"),
  params: z.record(z.string(), z.unknown()).default({}),
  locale: z.string().optional().default("en"),
});

export type AiLabRunInput = z.infer<typeof AiLabRunSchema>;

export const UpdateAiLabDemoSchema = z.object({
  isPublished: z.boolean().optional(),
  rateLimitRpm: z.number().min(1).max(300).optional(),
  timeoutMs: z.number().min(1000).max(60000).optional(),
  sortOrder: z.number().optional(),
});

export type UpdateAiLabDemoInput = z.infer<typeof UpdateAiLabDemoSchema>;

export interface AiLabPort {
  listDemos(options?: { publishedOnly?: boolean; locale?: string }): Promise<LocalizedAiLabDemo[]>;
  getDemoBySlug(slug: string): Promise<AiLabDemoConfig | null>;
  executeDemo(input: AiLabExecutionInput): Promise<AiLabExecutionResult>;
  updateDemo(
    id: string,
    input: UpdateAiLabDemoInput,
    adminUserId?: string,
  ): Promise<AiLabDemoConfig>;
}
