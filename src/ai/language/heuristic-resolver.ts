import {
  LanguageResolutionInput,
  LanguageResolutionResult,
  ResponseLanguage,
  ScriptDirection,
} from "@/ai/contracts";

/**
 * Unicode patterns
 */
const ARABIC_UNICODE_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_UNICODE_REGEX = /[a-zA-Z]/g;

/**
 * Common Arabic sentence indicators (MSA & colloquial)
 */
const ARABIC_INDICATORS = [
  "ما",
  "ماذا",
  "من",
  "هل",
  "كيف",
  "لماذا",
  "أين",
  "وين",
  "شو",
  "مين",
  "إيش",
  "ايش",
  "أنس",
  "انس",
  "مشاريع",
  "مشروع",
  "خبرة",
  "خبرات",
  "مهارات",
  "مهارة",
  "تقنية",
  "تقنيات",
  "نظام",
  "معمارية",
  "في",
  "عن",
  "مع",
  "على",
  "إلى",
  "اشتغل",
  "عمل",
  "بنى",
  "تطوير",
  "سيرة",
  "ذاتية",
  "تواصل",
  "أفضل",
  "احسن",
  "أحسن",
];

/**
 * Common English sentence indicators
 */
const ENGLISH_INDICATORS = [
  "what",
  "who",
  "where",
  "when",
  "why",
  "how",
  "is",
  "are",
  "was",
  "were",
  "does",
  "did",
  "tell",
  "explain",
  "show",
  "about",
  "anas",
  "his",
  "projects",
  "project",
  "skills",
  "skill",
  "experience",
  "architecture",
  "portfolio",
  "resume",
  "cv",
  "the",
  "and",
  "with",
  "from",
  "for",
];

/**
 * Explicit user instruction regexes
 */
const EXPLICIT_ENGLISH_PATTERNS = [
  /(?:answer|reply|respond|speak|write)\s+(?:in\s+)?english/i,
  /(?:in\s+english(?:\s+please)?)$/i,
  /(?:switch\s+to\s+english)/i,
  /(?:باللغة\s+الإنجليز(?:ية)?|تكلم\s+إنجليزي|تحدث\s+بالإنجليز(?:ية)?|جاوب\s+بالإنجليز(?:ية)?|رد\s+بالإنجليز(?:ية)?)/i,
];

const EXPLICIT_ARABIC_PATTERNS = [
  /(?:answer|reply|respond|speak|write)\s+(?:in\s+)?arabic/i,
  /(?:in\s+arabic(?:\s+please)?)$/i,
  /(?:switch\s+to\s+arabic)/i,
  /(?:باللغة\s+العرب(?:ية)?|تكلم\s+عربي|تحدث\s+بالعرب(?:ية)?|جاوب\s+بالعرب(?:ي|ية)?|رد\s+بالعرب(?:ي|ية)?|بالعربي(?:\s+لو\s+سمحت)?)/i,
];

export function getScriptDirection(language: ResponseLanguage): ScriptDirection {
  return language === "ar" ? "rtl" : "ltr";
}

/**
 * Resolves conversational language using deterministic Unicode script frequency,
 * explicit directives, and weak locale fallback signals.
 */
export function resolveLanguageHeuristics(
  input: LanguageResolutionInput,
): LanguageResolutionResult {
  const { message = "", conversationLocale, previousLanguage, forceLanguage } = input;
  const trimmed = message.trim();

  // 1. Explicit force override
  if (forceLanguage) {
    return {
      language: forceLanguage,
      direction: getScriptDirection(forceLanguage),
      confidence: 1.0,
      strategy: "explicit_instruction",
      hasExplicitOverride: true,
      reason: `Explicit forceLanguage specified: ${forceLanguage}`,
    };
  }

  // 2. Explicit user instructions in message text
  for (const pattern of EXPLICIT_ENGLISH_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        language: "en",
        direction: "ltr",
        confidence: 1.0,
        strategy: "explicit_instruction",
        hasExplicitOverride: true,
        reason: "User explicitly requested English response",
      };
    }
  }

  for (const pattern of EXPLICIT_ARABIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        language: "ar",
        direction: "rtl",
        confidence: 1.0,
        strategy: "explicit_instruction",
        hasExplicitOverride: true,
        reason: "User explicitly requested Arabic response",
      };
    }
  }

  // 3. Unicode script frequency
  const arabicMatches = trimmed.match(ARABIC_UNICODE_REGEX);
  const latinMatches = trimmed.match(LATIN_UNICODE_REGEX);

  const arabicCharCount = arabicMatches ? arabicMatches.length : 0;
  const latinCharCount = latinMatches ? latinMatches.length : 0;
  const totalChars = arabicCharCount + latinCharCount;

  // 4. Tokenization for indicator matching
  const words = trimmed
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let arabicWordScore = 0;
  let englishWordScore = 0;

  for (const w of words) {
    if (ARABIC_INDICATORS.includes(w)) {
      arabicWordScore += 2;
    }
    if (ENGLISH_INDICATORS.includes(w)) {
      englishWordScore += 2;
    }
  }

  // 5. Handling empty or non-alphabetic inputs (e.g. "123", emojis, punctuation)
  if (totalChars === 0) {
    const fallbackLang = conversationLocale || previousLanguage || "en";
    return {
      language: fallbackLang,
      direction: getScriptDirection(fallbackLang),
      confidence: 0.5,
      strategy: "locale_fallback",
      hasExplicitOverride: false,
      reason: "No script detected in message, defaulted to conversation locale",
    };
  }

  // 6. Arabic with English technical terms (e.g. "هل اشتغل أنس على RAG مع Qdrant؟")
  // Even if technical terms have many Latin characters, presence of Arabic words/particles
  // or substantial Arabic character count (> 25% of text or arabicWordScore > 0) signals Arabic framing.
  if (arabicCharCount > 0) {
    const arabicRatio = arabicCharCount / totalChars;

    if (arabicRatio > 0.4 || arabicWordScore > englishWordScore) {
      const confidence = Math.min(1.0, 0.8 + arabicRatio * 0.2);
      return {
        language: "ar",
        direction: "rtl",
        confidence: Number(confidence.toFixed(2)),
        strategy: "script_heuristic",
        hasExplicitOverride: false,
        reason:
          latinCharCount > 0
            ? "Arabic framing detected with embedded Latin technical terms"
            : "Predominant Arabic script detected",
      };
    }
  }

  // 7. English query (possibly with Arabic proper name, e.g. "Tell me about Anas's project الخبير")
  if (latinCharCount > 0) {
    const latinRatio = latinCharCount / totalChars;

    // If it's a single neutral word without clear grammar (e.g. "Docker", "CV", "React")
    if (words.length <= 1 && englishWordScore === 0) {
      // If user has a current Arabic conversation or locale, weak signal applies
      if (conversationLocale === "ar" || previousLanguage === "ar") {
        return {
          language: "ar",
          direction: "rtl",
          confidence: 0.65,
          strategy: "locale_fallback",
          hasExplicitOverride: false,
          reason: "Single technical term without syntax, honoring Arabic conversation locale",
        };
      }
      return {
        language: "en",
        direction: "ltr",
        confidence: 0.7,
        strategy: "script_heuristic",
        hasExplicitOverride: false,
        reason: "Single Latin keyword defaulted to English",
      };
    }

    if (latinRatio >= 0.5 || englishWordScore >= arabicWordScore) {
      const confidence = Math.min(1.0, 0.8 + latinRatio * 0.2);
      return {
        language: "en",
        direction: "ltr",
        confidence: Number(confidence.toFixed(2)),
        strategy: "script_heuristic",
        hasExplicitOverride: false,
        reason:
          arabicCharCount > 0
            ? "English syntax detected with embedded Arabic terms"
            : "Predominant English Latin script detected",
      };
    }
  }

  // 8. Fallback for mixed ambiguous queries
  const fallbackLang = conversationLocale || previousLanguage || "en";
  return {
    language: fallbackLang,
    direction: getScriptDirection(fallbackLang),
    confidence: 0.6,
    strategy: "locale_fallback",
    hasExplicitOverride: false,
    reason: "Ambiguous script balance, fell back to conversation locale",
  };
}
