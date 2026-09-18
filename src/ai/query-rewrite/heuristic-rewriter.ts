import {
  QueryRewriteInput,
  QueryRewriteOptions,
  QueryRewriteResult,
} from "@/ai/contracts/query-rewriter";
import { normalizeArabicText } from "@/ai/ingestion/normalizers/content-normalizer";

/**
 * Fast, deterministic heuristic query rewriter used when LLM rewriting is disabled,
 * times out, or runs in offline/testing mode.
 */
export function rewriteQueryHeuristic(
  input: QueryRewriteInput,
  options?: QueryRewriteOptions,
): QueryRewriteResult {
  const start = performance.now();
  const original = input.userMessage.trim();

  if (!original) {
    return {
      originalQuery: "",
      rewrittenQueries: [],
      wasRewritten: false,
      strategy: "noop",
      latencyMs: 0,
    };
  }

  const maxQueries = options?.maxQueries ?? 3;
  const allowCrossLingual = options?.allowCrossLingual ?? true;
  const queries: string[] = [original];

  // 1. Entity and Scope Expansion
  const entities = input.entityHints ?? [];
  const scope = input.currentScope?.trim();

  if (scope && !original.toLowerCase().includes(scope.toLowerCase())) {
    queries.push(`${original} ${scope}`);
  } else if (entities.length > 0) {
    const unmentioned = entities.filter((e) => !original.toLowerCase().includes(e.toLowerCase()));
    if (unmentioned.length > 0) {
      queries.push(`${original} ${unmentioned.slice(0, 2).join(" ")}`);
    }
  }

  // 2. Cross-lingual / Normalized Expansion
  if (input.language === "ar") {
    // If Arabic, provide normalized diacritic-free query or English technical keyword expansion
    const normalizedAr = normalizeArabicText(original);
    if (normalizedAr !== original && !queries.includes(normalizedAr)) {
      queries.push(normalizedAr);
    } else if (allowCrossLingual && entities.length > 0) {
      queries.push(`${normalizedAr} ${entities[0]}`);
    }
  } else if (input.language === "en") {
    // If English, provide focused keyword-extracted query
    const keywords = original
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (keywords.length > 2) {
      const kwQuery = keywords.join(" ");
      if (!queries.includes(kwQuery)) {
        queries.push(kwQuery);
      }
    }
  }

  // Deduplicate and cap
  const deduped = Array.from(new Set(queries.map((q) => q.trim()))).filter((q) => q.length > 0);
  const finalQueries = deduped.slice(0, maxQueries);

  const latencyMs = Math.round(performance.now() - start);

  return {
    originalQuery: original,
    rewrittenQueries: finalQueries,
    wasRewritten: finalQueries.length > 1,
    strategy: "heuristic",
    latencyMs,
  };
}
