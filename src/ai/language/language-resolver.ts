import {
  LanguageResolutionInput,
  LanguageResolutionResult,
  LanguageResolverPort,
  ResponseLanguage,
  ScriptDirection,
} from "@/ai/contracts";
import { resolveLanguageHeuristics, getScriptDirection } from "./heuristic-resolver";

export class LanguageResolver implements LanguageResolverPort {
  /**
   * Resolves the user's conversational language and direction.
   * Adheres strictly to docs/ai/11_LANGUAGE_RESOLUTION.md.
   */
  public async resolveLanguage(input: LanguageResolutionInput): Promise<LanguageResolutionResult> {
    // Fast deterministic heuristic resolution
    const heuristicResult = resolveLanguageHeuristics(input);

    return heuristicResult;
  }

  /**
   * Maps language to appropriate writing script direction.
   */
  public getDirection(language: ResponseLanguage): ScriptDirection {
    return getScriptDirection(language);
  }
}

export const languageResolver = new LanguageResolver();
