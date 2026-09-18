import { createHash } from "crypto";
import { RawDocument, NormalizedDocument } from "@/ai/contracts/ingestion";

/**
 * Normalizes Arabic text for consistent vector and keyword retrieval.
 * Strips diacritics (tashkeel), removes tatweel (kashida), and normalizes letter variations.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return "";

  return (
    text
      // Normalize Unicode
      .normalize("NFKC")
      // Remove Tatweel (ـ)
      .replace(/\u0640/g, "")
      // Remove Tashkeel / Harakat (Fathan, Damman, Kasran, Fatha, Damma, Kasra, Shadda, Sukun, etc.)
      .replace(/[\u064B-\u065F\u0670]/g, "")
      // Normalize Alef forms (أ, إ, آ, ٱ -> ا)
      .replace(/[إأآٱ]/g, "ا")
      // Normalize Teh Marbuta to Heh (ة -> ه) for retrieval uniformity
      .replace(/ة/g, "ه")
      // Normalize Alef Maksura to Yeh (ى -> ي)
      .replace(/ى/g, "ي")
  );
}

/**
 * Strips HTML tags while preserving markdown headings, list indicators, and formatting.
 */
export function stripHtmlTags(text: string): string {
  if (!text) return "";

  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

/**
 * Cleans extraneous whitespace, collapses multiple empty lines, and trims.
 */
export function cleanWhitespace(text: string): string {
  if (!text) return "";

  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

/**
 * Computes deterministic SHA-256 hash for document content and metadata.
 */
export function computeContentHash(content: string, metadata?: Record<string, unknown>): string {
  const hash = createHash("sha256");
  hash.update(content.trim());
  if (metadata) {
    hash.update(JSON.stringify(metadata));
  }
  return hash.digest("hex");
}

/**
 * Normalizes a raw source document into a cleaned, hash-verified NormalizedDocument.
 */
export function normalizeDocument(doc: RawDocument): NormalizedDocument {
  let cleaned = stripHtmlTags(doc.content);

  if (doc.locale === "ar") {
    cleaned = normalizeArabicText(cleaned);
  } else {
    cleaned = cleaned.normalize("NFKC");
  }

  cleaned = cleanWhitespace(cleaned);
  const contentHash = computeContentHash(cleaned, doc.metadata);

  return {
    ...doc,
    content: cleaned,
    contentHash,
  };
}
