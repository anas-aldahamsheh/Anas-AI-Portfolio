import { z } from "zod";
import { ConversationMode, ResponseLanguage } from "./generation";
import { ScriptDirection } from "./language-resolution";

export interface RagDebugStageLatency {
  routingMs: number;
  rewriteMs: number;
  retrievalMs: number;
  rerankingMs: number;
  contextMs: number;
  generationMs: number;
  totalMs: number;
}

export interface RagDebugSourceItem {
  id: string;
  title: string;
  sourceType: string;
  score?: number | undefined;
  snippet?: string | undefined;
}

export interface RagDebugValidationState {
  isValid: boolean;
  citationsCount: number;
  ungroundedCount: number;
}

export interface RagDebugTelemetry {
  routeId: string;
  routeLabel: string;
  language: ResponseLanguage;
  direction: ScriptDirection;
  conversationMode: ConversationMode;
  rewriteCount: number;
  retrievalMethod: "hybrid" | "dense" | "sparse";
  retrievedCount: number;
  rerankedCount: number;
  selectedChunksCount: number;
  tokenCount: number;
  modelId: string;
  providerType: string;
  latencies: RagDebugStageLatency;
  sources: RagDebugSourceItem[];
  validationState: RagDebugValidationState;
  projectScopeId?: string | undefined;
  isScopedRetrieval: boolean;
  isAdminView: boolean;
}

export const RagDebugRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  mode: z.enum(["general", "recruiter", "technical"]).optional().default("general"),
  locale: z.enum(["en", "ar"]).optional().default("en"),
  projectScopeId: z.string().optional(),
});

export type RagDebugRequest = z.infer<typeof RagDebugRequestSchema>;
