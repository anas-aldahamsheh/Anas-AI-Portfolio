/**
 * Minimal, typed subset of the Gemini REST API (v1beta) that the assistant uses.
 * Kept dependency-free so it runs on any Node runtime (Vercel functions, scripts, tests).
 */

export type GeminiRole = "user" | "model";

export interface GeminiFunctionCall {
  name: string;
  args?: Record<string, unknown>;
  id?: string;
}

export interface GeminiFunctionResponse {
  name: string;
  id?: string;
  response: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
  inlineData?: { mimeType: string; data: string };
}

export interface GeminiContent {
  role: GeminiRole;
  parts: GeminiPart[];
}

/** JSON-schema subset accepted by Gemini function declarations and structured output. */
export interface GeminiSchema {
  type: "object" | "string" | "number" | "integer" | "boolean" | "array";
  description?: string;
  enum?: string[];
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  items?: GeminiSchema;
  nullable?: boolean;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters?: GeminiSchema;
}

export interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[];
}

export type ThinkingLevel = "minimal" | "low" | "medium" | "high";

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
  responseSchema?: GeminiSchema;
  thinkingConfig?: { thinkingLevel?: ThinkingLevel; thinkingBudget?: number };
}

export interface GeminiRequest {
  contents: GeminiContent[];
  systemInstruction?: { parts: GeminiPart[] };
  tools?: GeminiTool[];
  toolConfig?: { functionCallingConfig: { mode: "AUTO" | "ANY" | "NONE" } };
  generationConfig?: GeminiGenerationConfig;
}

export interface GeminiUsage {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  cachedContentTokenCount?: number;
  totalTokenCount?: number;
}

export interface GeminiCandidate {
  content?: { role?: GeminiRole; parts?: GeminiPart[] };
  finishReason?: string;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsage;
  modelVersion?: string;
  promptFeedback?: { blockReason?: string };
}

export type EmbeddingTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" | "SEMANTIC_SIMILARITY";
