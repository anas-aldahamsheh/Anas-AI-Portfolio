import { z } from "zod";

export const PROMPT_ROLES = [
  "chat_system",
  "conversation_mode",
  "query_router",
  "query_rewriter",
  "job_fit",
  "evaluator",
  "summarizer",
] as const;

export type PromptRole = (typeof PROMPT_ROLES)[number];

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  systemPrompt: string;
  userTemplate: string | null;
  isActive: boolean;
  changelog: string | null;
  variables: string[];
  createdAt: Date;
}

export interface PromptSummary {
  id: string;
  slug: string;
  role: PromptRole | string;
  name: string;
  description: string | null;
  activeVersionNumber: number | null;
  activeVersionId: string | null;
  totalVersions: number;
  updatedAt: Date;
}

export interface PromptDetail extends PromptSummary {
  activeVersion: PromptVersion | null;
  versions: PromptVersion[];
}

export interface PromptDiff {
  promptSlug: string;
  v1Number: number;
  v2Number: number;
  systemPromptChanged: boolean;
  userTemplateChanged: boolean;
  addedVariables: string[];
  removedVariables: string[];
  v1: PromptVersion;
  v2: PromptVersion;
}

export const CreatePromptVersionSchema = z.object({
  systemPrompt: z.string().min(1, "System prompt cannot be empty"),
  userTemplate: z.string().optional().nullable(),
  changelog: z.string().max(500, "Changelog must be 500 characters or less").optional().nullable(),
  makeActive: z.boolean().default(false),
});

export type CreatePromptVersionInput = z.infer<typeof CreatePromptVersionSchema>;

export const RollbackPromptSchema = z.object({
  versionNumber: z.number().int().positive("Version number must be a positive integer"),
});

export type RollbackPromptInput = z.infer<typeof RollbackPromptSchema>;

export const TestPromptSchema = z.object({
  systemPrompt: z.string().min(1, "System prompt cannot be empty"),
  userTemplate: z.string().optional().nullable(),
  variables: z.record(z.string(), z.string()).default({}),
});

export type TestPromptInput = z.infer<typeof TestPromptSchema>;

export interface PromptTestResult {
  success: boolean;
  renderedSystemPrompt: string;
  renderedUserPrompt: string | null;
  detectedVariables: string[];
  missingVariables: string[];
  errors?: string[] | undefined;
}
