import { z } from "zod";
import { ContextChunk, CitationReference } from "./context-builder";
import { IngestionSourceType, INGESTION_SOURCE_TYPES } from "./ingestion";

export type ConversationMode = "general" | "recruiter" | "technical";
export const CONVERSATION_MODES: [ConversationMode, ...ConversationMode[]] = [
  "general",
  "recruiter",
  "technical",
];

export type ResponseLanguage = "ar" | "en";
export const RESPONSE_LANGUAGES: [ResponseLanguage, ...ResponseLanguage[]] = ["ar", "en"];

export interface CitationMapping {
  citationId: string;
  sourceId: string;
  sourceType: IngestionSourceType;
  title: string;
  locale: "ar" | "en";
  headingHierarchy?: string[] | undefined;
  tags?: string[] | undefined;
  sectionScope?: string | undefined;
  occurrences: number;
}

export interface CitationValidationResult {
  isValid: boolean;
  citedIds: string[];
  validCitedIds: string[];
  invalidCitedIds: string[];
  missingRequiredCitations: boolean;
  cleanedText: string;
  citations: CitationMapping[];
  languageConsistent: boolean;
  warnings?: string[] | undefined;
}

export interface GroundedGenerationTelemetry {
  modelUsed: string;
  providerType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  citedSourcesCount: number;
  hasInsufficientEvidence: boolean;
  strategy: "llm" | "fallback" | "insufficient_evidence";
}

export interface GroundedAnswer {
  content: string;
  rawContent: string;
  language: ResponseLanguage;
  conversationMode: ConversationMode;
  citations: CitationMapping[];
  validation: CitationValidationResult;
  telemetry: GroundedGenerationTelemetry;
  hasInsufficientEvidence: boolean;
}

export interface GenerationOptions {
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  modelId?: string | undefined;
  providerId?: string | undefined;
  timeoutMs?: number | undefined;
}

export interface GenerationInput {
  userMessage: string;
  contextChunks: ContextChunk[];
  availableCitations?: CitationReference[] | undefined;
  formattedContext?: string | undefined;
  responseLanguage?: ResponseLanguage | undefined;
  conversationMode?: ConversationMode | undefined;
  conversationSummary?: string | undefined;
  currentScope?: string | undefined;
  promptSlug?: string | undefined;
  options?: GenerationOptions | undefined;
}

export interface GenerationPort {
  generate(input: GenerationInput, options?: GenerationOptions): Promise<GroundedAnswer>;
}

export interface CitationValidatorPort {
  validate(
    text: string,
    availableCitations: CitationReference[],
    expectedLanguage?: ResponseLanguage,
  ): CitationValidationResult;
}

export const GenerationOptionsSchema = z.object({
  temperature: z.number().min(0.0).max(2.0).optional(),
  maxTokens: z.number().int().min(50).max(8192).optional(),
  modelId: z.string().optional(),
  providerId: z.string().optional(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
});

export const GenerationInputSchema = z.object({
  userMessage: z.string().min(1),
  contextChunks: z
    .array(
      z.object({
        id: z.string(),
        citationId: z.string(),
        sourceId: z.string(),
        sourceType: z.enum(INGESTION_SOURCE_TYPES),
        title: z.string(),
        locale: z.enum(["ar", "en"]),
        content: z.string(),
        score: z.number(),
        rerankScore: z.number().optional(),
        estimatedTokens: z.number(),
        rank: z.number(),
        documentId: z.string(),
        headingHierarchy: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        sectionScope: z.string().optional(),
      }),
    )
    .default([]),
  availableCitations: z
    .array(
      z.object({
        citationId: z.string(),
        sourceId: z.string(),
        sourceType: z.enum(INGESTION_SOURCE_TYPES),
        title: z.string(),
        locale: z.enum(["ar", "en"]),
        headingHierarchy: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        sectionScope: z.string().optional(),
      }),
    )
    .optional(),
  formattedContext: z.string().optional(),
  responseLanguage: z.enum(RESPONSE_LANGUAGES).optional().default("en"),
  conversationMode: z.enum(CONVERSATION_MODES).optional().default("general"),
  conversationSummary: z.string().optional(),
  promptSlug: z.string().optional().default("chat_system"),
  options: GenerationOptionsSchema.optional(),
});

export const AdminGenerationTestSchema = z.object({
  userMessage: z.string().min(1),
  contextChunks: z
    .array(
      z.object({
        id: z.string(),
        citationId: z.string(),
        sourceId: z.string(),
        sourceType: z.enum(INGESTION_SOURCE_TYPES),
        title: z.string(),
        locale: z.enum(["ar", "en"]),
        content: z.string(),
        score: z.number(),
        rerankScore: z.number().optional(),
        estimatedTokens: z.number().default(50),
        rank: z.number().default(1),
        documentId: z.string().default("doc-1"),
        headingHierarchy: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        sectionScope: z.string().optional(),
      }),
    )
    .default([]),
  responseLanguage: z.enum(RESPONSE_LANGUAGES).optional().default("en"),
  conversationMode: z.enum(CONVERSATION_MODES).optional().default("general"),
  conversationSummary: z.string().optional(),
  options: GenerationOptionsSchema.optional(),
});

export type GenerationOptionsInput = z.infer<typeof GenerationOptionsSchema>;
export type GenerationInputType = z.infer<typeof GenerationInputSchema>;
export type AdminGenerationTestInput = z.infer<typeof AdminGenerationTestSchema>;
