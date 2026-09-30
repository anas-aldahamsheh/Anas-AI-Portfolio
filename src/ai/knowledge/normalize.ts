/**
 * Bilingual (Arabic / English) text normalisation used on BOTH sides of lexical search:
 * the stored `search_text` of every chunk and the user's query. Keeping one function for both
 * guarantees that whatever a document was indexed as, the same spelling in a query matches it.
 */

const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;
const PERSIAN_DIGITS = /[۰-۹]/g;

/** Canonical Arabic letter forms so spelling variants collapse to one token. */
export function normalizeArabic(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[آأإٱ]/g, "ا") // آ أ إ ٱ -> ا
    .replace(/ى/g, "ي") // ى -> ي
    .replace(/ة/g, "ه") // ة -> ه
    .replace(/ؤ/g, "و") // ؤ -> و
    .replace(/ئ/g, "ي") // ئ -> ي
    .replace(ARABIC_INDIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(PERSIAN_DIGITS, (d) => String(d.charCodeAt(0) - 0x06f0));
}

const ARABIC_LETTER = /[؀-ۿ]/;

export function isArabicToken(token: string): boolean {
  return ARABIC_LETTER.test(token);
}

/** Share of letters that are Arabic, ignoring digits, punctuation and whitespace. */
export function arabicRatio(text: string): number {
  let arabic = 0;
  let letters = 0;
  for (const char of text) {
    if (/[؀-ۿ]/.test(char)) {
      arabic++;
      letters++;
    } else if (/[A-Za-zÀ-ɏ]/.test(char)) {
      letters++;
    }
  }
  return letters === 0 ? 0 : arabic / letters;
}

const AR_PREFIXES = ["وال", "بال", "كال", "فال", "لل", "ال"];
const AR_SUFFIXES = [
  "اتها",
  "اته",
  "يات",
  "ات",
  "ون",
  "ين",
  "ان",
  "ها",
  "هم",
  "كم",
  "نا",
  "يه",
  "ه",
  "ي",
];

/** Light Arabic stemmer: strips common clitics and plural/possessive suffixes. */
export function stemArabic(token: string): string {
  let t = token;
  for (const prefix of AR_PREFIXES) {
    if (t.startsWith(prefix) && t.length - prefix.length >= 3) {
      t = t.slice(prefix.length);
      break;
    }
  }
  if (t.startsWith("و") && t.length >= 5) t = t.slice(1);
  for (const suffix of AR_SUFFIXES) {
    if (t.endsWith(suffix) && t.length - suffix.length >= 3) {
      t = t.slice(0, -suffix.length);
      break;
    }
  }
  return t;
}

/** Light English stemmer (a pragmatic subset of Porter step 1). */
export function stemEnglish(token: string): string {
  if (token.length <= 4) return token;
  const rules: [RegExp, string][] = [
    [/ies$/, "y"],
    [/(ss)es$/, "$1"],
    [/([^s])s$/, "$1"],
    [/eed$/, "ee"],
    [/ing$/, ""],
    [/ed$/, ""],
    [/ation$/, "ate"],
    [/ments?$/, ""],
    [/ly$/, ""],
  ];
  for (const [pattern, replacement] of rules) {
    if (pattern.test(token)) {
      const stemmed = token.replace(pattern, replacement);
      if (stemmed.length >= 3) return stemmed;
    }
  }
  return token;
}

const STOPWORDS = new Set([
  // English
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "as",
  "his",
  "he",
  "him",
  "has",
  "have",
  "had",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "does",
  "did",
  "do",
  "can",
  "could",
  "about",
  "tell",
  "me",
  "please",
  "any",
  "some",
  "i",
  "you",
  "your",
  "my",
  "we",
  "our",
  "they",
  "their",
  "there",
  "anas",
  // Arabic (already normalised)
  "في",
  "من",
  "علي",
  "الي",
  "عن",
  "مع",
  "هو",
  "هي",
  "ما",
  "ماذا",
  "هل",
  "كيف",
  "او",
  "ان",
  "انه",
  "التي",
  "الذي",
  "هذا",
  "هذه",
  "ذلك",
  "تلك",
  "كان",
  "كانت",
  "شو",
  "ايش",
  "انس",
  "لي",
  "له",
  "عند",
  "بدي",
  "احكيلي",
  "اخبرني",
]);

/**
 * Tokenises normalised text into search terms: surface forms, stems, and joined variants of
 * dotted/hyphenated technical names ("next.js" -> "next", "js", "nextjs").
 */
export function searchTokens(text: string, options: { keepStopwords?: boolean } = {}): string[] {
  const normalized = normalizeArabic(text.normalize("NFKC").toLowerCase());
  const raw = normalized.match(/[\p{L}\p{N}][\p{L}\p{N}.+#_-]*/gu) ?? [];
  const out = new Set<string>();
  for (const word of raw) {
    const cleaned = word.replace(/[.\-_]+$/, "");
    const pieces = cleaned.split(/[.\-_]+/).filter(Boolean);
    const candidates = new Set<string>(pieces);
    if (pieces.length > 1) candidates.add(pieces.join(""));
    if (cleaned.includes("+") || cleaned.includes("#")) {
      candidates.add(cleaned.replace(/\+/g, "p").replace(/#/g, "sharp"));
    }
    for (const candidate of candidates) {
      const token = candidate.replace(/[+#]/g, "");
      if (!token) continue;
      if (!options.keepStopwords && STOPWORDS.has(token)) continue;
      if (token.length === 1 && !/\d/.test(token)) continue;
      out.add(token);
      const stem = isArabicToken(token) ? stemArabic(token) : stemEnglish(token);
      if (stem !== token && stem.length >= 2) out.add(stem);
    }
  }
  return [...out];
}

/** The string stored in `knowledge_chunks.search_text` (fed to `to_tsvector('simple', ...)`). */
export function toSearchText(text: string): string {
  return searchTokens(text, { keepStopwords: true }).join(" ");
}

/**
 * Builds a `to_tsquery('simple', ...)` expression that ORs every query term, with prefix
 * matching for longer terms. Returns null when the query has no searchable terms.
 */
export function toTsQuery(query: string): string | null {
  const terms = searchTokens(query)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((t) => t.length >= 2)
    .slice(0, 24);
  if (terms.length === 0) return null;
  return terms.map((t) => (t.length >= 4 ? `${t}:*` : t)).join(" | ");
}
