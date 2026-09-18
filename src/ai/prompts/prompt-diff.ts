import { PromptDiff, PromptVersion } from "@/ai/contracts/prompt-registry";

/**
 * Computes difference metadata and variable changes between two prompt versions.
 */
export function computePromptDiff(
  promptSlug: string,
  v1: PromptVersion,
  v2: PromptVersion,
): PromptDiff {
  const v1Vars = new Set(v1.variables);
  const v2Vars = new Set(v2.variables);

  const addedVariables = v2.variables.filter((v) => !v1Vars.has(v));
  const removedVariables = v1.variables.filter((v) => !v2Vars.has(v));

  return {
    promptSlug,
    v1Number: v1.versionNumber,
    v2Number: v2.versionNumber,
    systemPromptChanged: v1.systemPrompt !== v2.systemPrompt,
    userTemplateChanged: (v1.userTemplate ?? null) !== (v2.userTemplate ?? null),
    addedVariables,
    removedVariables,
    v1,
    v2,
  };
}
