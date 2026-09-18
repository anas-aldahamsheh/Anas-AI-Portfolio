import { RouteId } from "@/ai/contracts/router";
import { BASELINE_QUERY_ROUTES } from "./baseline-routes";
import { normalizeArabicText } from "@/ai/ingestion/normalizers/content-normalizer";

const KNOWN_ENTITIES = [
  // Tech & Frameworks
  "next.js",
  "nextjs",
  "react",
  "typescript",
  "python",
  "drizzle",
  "postgres",
  "postgresql",
  "qdrant",
  "bge-m3",
  "bge",
  "tailwind",
  "vitest",
  "docker",
  "fastapi",
  "langchain",
  "llamaindex",
  "rag",
  "llm",
  // Common Arabic tech entities
  "رياكت",
  "تايب سكريبت",
  "بايثون",
  "دريزل",
  "بوستجرس",
  "كودرانت",
  // Roles
  "engineer",
  "architect",
  "developer",
  "مهندس",
  "مطور",
  "معماري",
];

export interface ClassificationResult {
  route_id: RouteId;
  confidence: number;
  entity_hints: string[];
  matched_keywords: string[];
}

/**
 * Fast, deterministic rule-based query classifier supporting bilingual Arabic and English queries.
 */
export function classifyQueryRules(query: string): ClassificationResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      route_id: "broad_portfolio",
      confidence: 1.0,
      entity_hints: [],
      matched_keywords: [],
    };
  }

  // Normalize query for matching
  let normalized = trimmed.normalize("NFKC").toLowerCase();
  if (/[\u0600-\u06FF]/.test(normalized)) {
    normalized = normalizeArabicText(normalized);
  }

  // Extract entity hints
  const entityHints: string[] = [];
  for (const entity of KNOWN_ENTITIES) {
    if (normalized.includes(entity)) {
      entityHints.push(entity);
    }
  }

  // Check specific high-priority intent patterns:
  // 1. CV / Resume download requests
  if (
    /\b(cv|resume|curriculum vitae|سيرة ذاتية|سيرتي|رزنامة)\b/i.test(normalized) ||
    normalized.includes("سيرة ذاتية") ||
    normalized.includes("تحميل السيرة")
  ) {
    return {
      route_id: "cv",
      confidence: 0.95,
      entity_hints: entityHints,
      matched_keywords: ["cv", "resume"],
    };
  }

  // 2. Job fit / hiring / suitability
  if (
    /\b(job fit|hire|hiring|fit for|suitable for|qualify|candidate|jd|job description)\b/i.test(
      normalized,
    ) ||
    normalized.includes("ملائمة وظيفية") ||
    normalized.includes("مطابقة الوظيفة") ||
    normalized.includes("هل يناسب") ||
    normalized.includes("توظيف")
  ) {
    return {
      route_id: "job_fit",
      confidence: 0.9,
      entity_hints: entityHints,
      matched_keywords: ["job fit", "hiring"],
    };
  }

  // 3. Certifications / education
  if (
    /\b(certification|certifications|certified|degree|university|education|courses)\b/i.test(
      normalized,
    ) ||
    normalized.includes("شهادة") ||
    normalized.includes("شهادات") ||
    normalized.includes("مؤهلات") ||
    normalized.includes("تعليم") ||
    normalized.includes("جامعة")
  ) {
    return {
      route_id: "certification",
      confidence: 0.9,
      entity_hints: entityHints,
      matched_keywords: ["certification", "education"],
    };
  }

  // Evaluate candidate routes with keyword accumulation
  let bestRoute: RouteId = "broad_portfolio";
  let maxScore = 0;
  let bestMatches: string[] = [];

  for (const [routeId, def] of Object.entries(BASELINE_QUERY_ROUTES)) {
    let score = 0;
    const matches: string[] = [];

    // Check Arabic keywords
    for (const kw of def.keywords.ar) {
      const normKw = normalizeArabicText(kw).toLowerCase();
      if (normalized.includes(normKw)) {
        score += 2.0;
        matches.push(kw);
      }
    }

    // Check English keywords
    for (const kw of def.keywords.en) {
      const normKw = kw.toLowerCase();
      // Word boundary regex for short English words
      if (normKw.length <= 4) {
        const regex = new RegExp(`\\b${normKw}\\b`, "i");
        if (regex.test(normalized)) {
          score += 2.0;
          matches.push(kw);
        }
      } else if (normalized.includes(normKw)) {
        score += 2.0;
        matches.push(kw);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestRoute = routeId as RouteId;
      bestMatches = matches;
    }
  }

  // Confidence estimation based on match strength
  let confidence = 0.5;
  if (maxScore >= 4.0) {
    confidence = 0.95;
  } else if (maxScore >= 2.0) {
    confidence = 0.85;
  } else if (maxScore > 0) {
    confidence = 0.7;
  }

  return {
    route_id: bestRoute,
    confidence,
    entity_hints: entityHints,
    matched_keywords: bestMatches,
  };
}
