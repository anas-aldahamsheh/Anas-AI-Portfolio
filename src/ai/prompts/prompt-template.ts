/**
 * Variable extraction and safe template interpolation for AI prompt registry.
 * Supports {{variable_name}} and {variable_name} placeholder formats.
 */

const VARIABLE_PATTERN = /\{\{([a-zA-Z0-9_]+)\}\}|\{([a-zA-Z0-9_]+)\}/g;

/**
 * Extracts unique placeholder variable names from a prompt template.
 */
export function extractVariables(template: string | null | undefined): string[] {
  if (!template || typeof template !== "string") {
    return [];
  }

  const variables = new Set<string>();
  const matches = template.matchAll(VARIABLE_PATTERN);

  for (const match of matches) {
    const varName = match[1] || match[2];
    if (varName) {
      variables.add(varName);
    }
  }

  return Array.from(variables).sort();
}

/**
 * Interpolates variables into a template string.
 * Preserves unmatched placeholders if value is not provided, and reports missing variables.
 */
export function interpolateTemplate(
  template: string | null | undefined,
  variables: Record<string, string> = {},
): { rendered: string; missingVariables: string[] } {
  if (!template || typeof template !== "string") {
    return { rendered: "", missingVariables: [] };
  }

  const missing = new Set<string>();

  const rendered = template.replace(VARIABLE_PATTERN, (match, doubleBrace, singleBrace) => {
    const varName = doubleBrace || singleBrace;
    if (varName in variables && variables[varName] !== undefined && variables[varName] !== null) {
      return String(variables[varName]);
    }
    missing.add(varName);
    return match; // keep original placeholder if not provided
  });

  return {
    rendered,
    missingVariables: Array.from(missing).sort(),
  };
}

/**
 * Validates that all variables required by a template are provided.
 */
export function validateTemplateVariables(
  template: string | null | undefined,
  variables: Record<string, string> = {},
): { isValid: boolean; missingVariables: string[] } {
  const required = extractVariables(template);
  const missing = required.filter((v) => !(v in variables) || variables[v] === undefined);

  return {
    isValid: missing.length === 0,
    missingVariables: missing,
  };
}
