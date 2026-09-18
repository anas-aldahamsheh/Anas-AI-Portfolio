import {
  CitationMapping,
  CitationReference,
  CitationValidationResult,
  CitationValidatorPort,
  ResponseLanguage,
} from "@/ai/contracts";

/**
 * Strips reasoning tokens or chain-of-thought blocks enclosed in <think>...</think>.
 * Preserves compliance with the strict non-disclosure rule (docs/ai/10_GENERATION_AND_CITATIONS.md).
 */
export function stripChainOfThought(text: string): string {
  if (!text) return "";
  // Strip <think>...</think> tags and any leading/trailing whitespace
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * Citation regular expressions:
 * Primary: [cit:IDENTIFIER]
 * Fallback: [IDENTIFIER] where IDENTIFIER is validated against available source/citation IDs.
 */
const EXPLICIT_CITATION_REGEX = /\[cit:([a-zA-Z0-9_\-.:]+)\]/g;
const GENERIC_BRACKET_REGEX = /\[([a-zA-Z0-9_\-.:]+)\]/g;

export class CitationValidator implements CitationValidatorPort {
  /**
   * Validates generated text against available citations from context.
   */
  public validate(
    rawText: string,
    availableCitations: CitationReference[] = [],
    expectedLanguage?: ResponseLanguage,
  ): CitationValidationResult {
    // 1. Strip reasoning tokens
    let cleaned = stripChainOfThought(rawText);

    // 2. Build lookup index of known valid IDs
    const idToRefMap = new Map<string, CitationReference>();
    for (const ref of availableCitations) {
      if (ref.citationId) {
        idToRefMap.set(ref.citationId.toLowerCase(), ref);
      }
      if (ref.sourceId) {
        idToRefMap.set(ref.sourceId.toLowerCase(), ref);
      }
    }

    // 3. Extract explicit [cit:ID] markers
    const foundCitedIds: string[] = [];
    const occurrencesMap = new Map<string, number>();

    let match: RegExpExecArray | null;
    const explicitRegex = new RegExp(EXPLICIT_CITATION_REGEX);
    while ((match = explicitRegex.exec(cleaned)) !== null) {
      const id = match[1];
      if (id) {
        foundCitedIds.push(id);
        occurrencesMap.set(id, (occurrencesMap.get(id) || 0) + 1);
      }
    }

    // 4. Fallback search for brackets without 'cit:' prefix (e.g. [source-id])
    if (foundCitedIds.length === 0 && availableCitations.length > 0) {
      const bracketRegex = new RegExp(GENERIC_BRACKET_REGEX);
      while ((match = bracketRegex.exec(cleaned)) !== null) {
        const id = match[1];
        if (id && idToRefMap.has(id.toLowerCase())) {
          foundCitedIds.push(id);
          occurrencesMap.set(id, (occurrencesMap.get(id) || 0) + 1);
          // Standardize in cleaned text to [cit:ID]
          cleaned = cleaned.replace(`[${id}]`, `[cit:${id}]`);
        }
      }
    }

    // Deduplicate cited IDs
    const uniqueCitedIds = Array.from(new Set(foundCitedIds));
    const validCitedIds: string[] = [];
    const invalidCitedIds: string[] = [];
    const resolvedMappings: CitationMapping[] = [];

    for (const id of uniqueCitedIds) {
      const matchedRef = idToRefMap.get(id.toLowerCase());
      if (matchedRef) {
        validCitedIds.push(id);
        resolvedMappings.push({
          citationId: matchedRef.citationId,
          sourceId: matchedRef.sourceId,
          sourceType: matchedRef.sourceType,
          title: matchedRef.title,
          locale: matchedRef.locale,
          headingHierarchy: matchedRef.headingHierarchy,
          tags: matchedRef.tags,
          sectionScope: matchedRef.sectionScope,
          occurrences: occurrencesMap.get(id) || 1,
        });
      } else {
        invalidCitedIds.push(id);
      }
    }

    // 5. Sanitize text: prune hallucinated citation tags so end-users never see dead pills
    for (const invalidId of invalidCitedIds) {
      const pattern = new RegExp(`\\s*\\[cit:${escapeRegex(invalidId)}\\]`, "g");
      cleaned = cleaned.replace(pattern, "");
    }
    // Clean potential double spaces created by deletion
    cleaned = cleaned.replace(/ {2,}/g, " ").trim();

    // 6. Check required citations presence
    const warnings: string[] = [];
    let missingRequiredCitations = false;

    const isInsufficientEvidence =
      cleaned.toLowerCase().includes("does not contain verified") ||
      cleaned.includes("لا تحتوي قاعدة معارف") ||
      cleaned.toLowerCase().includes("insufficient evidence") ||
      cleaned.toLowerCase().includes("not enough verified");

    if (availableCitations.length > 0 && !isInsufficientEvidence && validCitedIds.length === 0) {
      missingRequiredCitations = true;
      warnings.push("Retrieved evidence was available, but no valid citations were generated.");
    }

    if (invalidCitedIds.length > 0) {
      warnings.push(`Hallucinated citation IDs detected and pruned: ${invalidCitedIds.join(", ")}`);
    }

    // 7. Check language consistency
    let languageConsistent = true;
    if (expectedLanguage) {
      languageConsistent = this.checkLanguageScript(cleaned, expectedLanguage);
      if (!languageConsistent) {
        warnings.push(
          `Generated text does not appear consistent with expected language: ${expectedLanguage}`,
        );
      }
    }

    return {
      isValid: invalidCitedIds.length === 0 && languageConsistent,
      citedIds: uniqueCitedIds,
      validCitedIds,
      invalidCitedIds,
      missingRequiredCitations,
      cleanedText: cleaned,
      citations: resolvedMappings,
      languageConsistent,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Simple script check to ensure the output contains appropriate Unicode characters.
   */
  private checkLanguageScript(text: string, expectedLanguage: ResponseLanguage): boolean {
    if (!text || text.length < 10) return true;

    // Arabic Unicode block
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    const hasArabic = arabicRegex.test(text);

    if (expectedLanguage === "ar") {
      // Arabic response should have at least some Arabic characters
      return hasArabic;
    }

    if (expectedLanguage === "en") {
      // English response should not be predominantly Arabic
      const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
      return arabicChars / text.length < 0.3;
    }

    return true;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const citationValidator = new CitationValidator();
