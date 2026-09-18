import { normalizeArabicText } from "@/ai/ingestion/normalizers/content-normalizer";

const ENGLISH_STOPWORDS = new Set([
  "a",
  "about",
  "after",
  "all",
  "also",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "during",
  "each",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

// Normalized Arabic stopwords (post diacritic & Alef/Teh Marbuta normalization)
const ARABIC_STOPWORDS = new Set([
  "في",
  "من",
  "على",
  "الي",
  "عن",
  "حتي",
  "مع",
  "هذا",
  "هذه",
  "ذلك",
  "تلك",
  "هولاء",
  "اولئك",
  "الذي",
  "التي",
  "الذين",
  "اللواتي",
  "ان",
  "كان",
  "كانت",
  "يكون",
  "ما",
  "ماذا",
  "هل",
  "لا",
  "لم",
  "لن",
  "كل",
  "بعض",
  "غير",
  "بين",
  "ثم",
  "او",
  "ام",
  "بل",
  "قد",
  "هو",
  "هي",
  "هم",
  "هن",
  "نحن",
  "انا",
  "انت",
  "انتم",
  "له",
  "لها",
  "لهم",
  "به",
  "بها",
  "بهم",
  "فيه",
  "فيها",
  "منه",
  "منها",
  "عنه",
  "عنها",
  "عليه",
  "عليها",
]);

/**
 * Tokenizes text for BM25 retrieval with multilingual Arabic/English normalization.
 */
export function tokenizeMultilingual(text: string): string[] {
  if (!text) return [];

  // Normalize Unicode
  let normalized = text.normalize("NFKC");

  // Normalize Arabic forms if Arabic text is present
  if (/[\u0600-\u06FF]/.test(normalized)) {
    normalized = normalizeArabicText(normalized);
  }

  // Lowercase Latin characters
  normalized = normalized.toLowerCase();

  // Extract unicode word tokens (letters and numbers)
  const matches = normalized.match(/[\p{L}\p{N}]+/gu);
  if (!matches) return [];

  // Filter stopwords and single character noise
  return matches.filter((token) => {
    if (token.length < 2) return false;
    if (ENGLISH_STOPWORDS.has(token)) return false;
    if (ARABIC_STOPWORDS.has(token)) return false;
    return true;
  });
}

/**
 * Computes term frequencies for a token list.
 */
export function computeTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

/**
 * Calculates Okapi BM25 score for a query against a document.
 */
export function calculateBm25Score(params: {
  queryTokens: string[];
  docTokens: string[];
  docFrequencyMap: Map<string, number>;
  totalDocs: number;
  avgDocLength: number;
  k1?: number;
  b?: number;
}): number {
  const {
    queryTokens,
    docTokens,
    docFrequencyMap,
    totalDocs,
    avgDocLength,
    k1 = 1.2,
    b = 0.75,
  } = params;

  if (queryTokens.length === 0 || docTokens.length === 0 || totalDocs === 0) {
    return 0;
  }

  const docTf = computeTermFrequency(docTokens);
  const docLen = docTokens.length;
  const uniqueQueryTerms = Array.from(new Set(queryTokens));

  let score = 0;

  for (const term of uniqueQueryTerms) {
    const f = docTf.get(term) ?? 0;
    if (f === 0) continue;

    const n = docFrequencyMap.get(term) ?? 1;

    // Okapi IDF with smoothing
    const idf = Math.log((totalDocs - n + 0.5) / (n + 0.5) + 1.0);
    if (idf <= 0) continue;

    // Term saturation & length normalization
    const tfComponent =
      (f * (k1 + 1.0)) / (f + k1 * (1.0 - b + b * (docLen / (avgDocLength || 1))));

    score += idf * tfComponent;
  }

  return score;
}
