import type { TranslationParams } from "./types";

/**
 * Interpolates variables in a translated string (e.g. "Hello {name}" -> "Hello Anas").
 * Pure domain utility with zero server/database dependencies.
 */
export function interpolate(text: string, params?: TranslationParams): string {
  if (!params || Object.keys(params).length === 0) {
    return text;
  }

  return text.replace(/\{([^{}]+)\}/g, (match, paramName: string) => {
    const trimmed = paramName.trim();
    if (params[trimmed] !== undefined) {
      return String(params[trimmed]);
    }
    return match;
  });
}
