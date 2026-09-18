import { z } from "zod";
import { ResponseLanguage, RESPONSE_LANGUAGES } from "./generation";

export type ScriptDirection = "rtl" | "ltr";
export const SCRIPT_DIRECTIONS: [ScriptDirection, ...ScriptDirection[]] = ["rtl", "ltr"];

export type LanguageResolutionStrategy =
  "explicit_instruction" | "script_heuristic" | "locale_fallback" | "llm_classification";

export const LANGUAGE_RESOLUTION_STRATEGIES: [
  LanguageResolutionStrategy,
  ...LanguageResolutionStrategy[],
] = ["explicit_instruction", "script_heuristic", "locale_fallback", "llm_classification"];

export interface LanguageResolutionInput {
  message: string;
  conversationLocale?: ResponseLanguage | undefined;
  previousLanguage?: ResponseLanguage | undefined;
  forceLanguage?: ResponseLanguage | undefined;
}

export interface LanguageResolutionResult {
  language: ResponseLanguage;
  direction: ScriptDirection;
  confidence: number;
  strategy: LanguageResolutionStrategy;
  hasExplicitOverride: boolean;
  reason: string;
}

export interface LanguageResolverPort {
  resolveLanguage(input: LanguageResolutionInput): Promise<LanguageResolutionResult>;
}

export const LanguageResolutionInputSchema = z.object({
  message: z.string(),
  conversationLocale: z.enum(RESPONSE_LANGUAGES).optional(),
  previousLanguage: z.enum(RESPONSE_LANGUAGES).optional(),
  forceLanguage: z.enum(RESPONSE_LANGUAGES).optional(),
});

export const LanguageResolutionResultSchema = z.object({
  language: z.enum(RESPONSE_LANGUAGES),
  direction: z.enum(SCRIPT_DIRECTIONS),
  confidence: z.number().min(0.0).max(1.0),
  strategy: z.enum(LANGUAGE_RESOLUTION_STRATEGIES),
  hasExplicitOverride: z.boolean(),
  reason: z.string(),
});

export const LanguageResolutionTestInputSchema = z.object({
  message: z.string().min(1),
  conversationLocale: z.enum(RESPONSE_LANGUAGES).optional().default("en"),
  previousLanguage: z.enum(RESPONSE_LANGUAGES).optional(),
  forceLanguage: z.enum(RESPONSE_LANGUAGES).optional(),
});

export type LanguageResolutionInputType = z.infer<typeof LanguageResolutionInputSchema>;
export type LanguageResolutionResultType = z.infer<typeof LanguageResolutionResultSchema>;
export type LanguageResolutionTestInput = z.infer<typeof LanguageResolutionTestInputSchema>;
