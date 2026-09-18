import { NormalizedDocument, DocumentChunk, ChunkMetadata } from "@/ai/contracts/ingestion";
import { computeContentHash } from "../normalizers/content-normalizer";

export interface ChunkerOptions {
  chunkSize?: number | undefined; // target token count (default: 512)
  chunkOverlap?: number | undefined; // token overlap (default: 64)
  minChunkTokens?: number | undefined; // minimum tokens to retain (default: 15)
  headingCarryover?: boolean | undefined; // prefix sub-chunks with context (default: true)
}

/**
 * Accurately estimates token count for multilingual English and Arabic text.
 */
export function estimateTokens(text: string, locale: "ar" | "en" = "en"): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // Words count
  const words = trimmed.split(/\s+/).filter(Boolean).length;

  if (locale === "ar") {
    // Arabic tokens average ~1.3 tokens per word or ~3 characters per token
    const byWords = Math.ceil(words * 1.3);
    const byChars = Math.ceil(trimmed.length / 3.2);
    return Math.max(1, Math.round((byWords + byChars) / 2));
  }

  // English tokens average ~1.25 tokens per word or ~4 characters per token
  const byWords = Math.ceil(words * 1.25);
  const byChars = Math.ceil(trimmed.length / 4.0);
  return Math.max(1, Math.round((byWords + byChars) / 2));
}

/**
 * Splits text into semantic paragraphs and sentence blocks.
 */
function splitIntoSemanticUnits(text: string): string[] {
  // First split by double newlines (paragraphs / markdown blocks)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const units: string[] = [];

  for (const para of paragraphs) {
    if (para.length > 800) {
      // Split large paragraphs into sentences using English and Arabic punctuation
      const sentences = para
        .split(/(?<=[.!?؛؟\n])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      units.push(...sentences);
    } else {
      units.push(para);
    }
  }

  return units;
}

/**
 * Generates a deterministic Qdrant point UUID from source identifiers.
 */
export function generateDeterministicPointId(
  sourceType: string,
  sourceId: string,
  locale: string,
  chunkIndex: number,
): string {
  const seed = `${sourceType}:${sourceId}:${locale}:${chunkIndex}`;
  const hash = computeContentHash(seed);
  // Format as UUID: 8-4-4-4-12
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    `4${hash.substring(13, 16)}`, // version 4
    `a${hash.substring(17, 20)}`, // variant
    hash.substring(20, 32),
  ].join("-");
}

/**
 * Semantic, block-aware chunker adhering to RAG non-negotiables.
 * Preserves entity and project boundaries, provides heading carry-over, and safe word-boundary overlap.
 */
export function chunkDocument(
  doc: NormalizedDocument,
  options: ChunkerOptions = {},
): DocumentChunk[] {
  const targetChunkSize = options.chunkSize ?? 512;
  const targetOverlap = options.chunkOverlap ?? 64;
  const minTokens = options.minChunkTokens ?? 15;
  const headingCarryover = options.headingCarryover ?? true;

  const units = splitIntoSemanticUnits(doc.content);
  if (units.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let currentUnits: string[] = [];
  let currentTokenCount = 0;

  // Heading context for carryover
  const headingPrefix =
    headingCarryover && doc.title ? `[${doc.sourceType.toUpperCase()}: ${doc.title}]\n` : "";
  const prefixTokens = headingPrefix ? estimateTokens(headingPrefix, doc.locale) : 0;
  const effectiveCapacity = Math.max(64, targetChunkSize - prefixTokens);

  for (const unit of units) {
    const unitTokens = estimateTokens(unit, doc.locale);

    if (currentTokenCount + unitTokens <= effectiveCapacity) {
      currentUnits.push(unit);
      currentTokenCount += unitTokens;
    } else {
      if (currentUnits.length > 0) {
        chunks.push(currentUnits.join("\n\n"));
      }

      // Calculate overlap from end of previous units
      const overlapUnits: string[] = [];
      let overlapTokens = 0;

      for (let i = currentUnits.length - 1; i >= 0; i--) {
        const candidate = currentUnits[i];
        if (!candidate) continue;
        const cTokens = estimateTokens(candidate, doc.locale);
        if (overlapTokens + cTokens <= targetOverlap) {
          overlapUnits.unshift(candidate);
          overlapTokens += cTokens;
        } else {
          break;
        }
      }

      currentUnits = [...overlapUnits, unit];
      currentTokenCount = overlapTokens + unitTokens;
    }
  }

  if (currentUnits.length > 0) {
    chunks.push(currentUnits.join("\n\n"));
  }

  // Filter out tiny noise chunks unless it's the sole chunk
  const validChunkTexts = chunks.filter((c, idx) => {
    if (chunks.length === 1 && idx === 0) return true;
    return estimateTokens(c, doc.locale) >= minTokens;
  });

  const totalChunks = validChunkTexts.length;

  return validChunkTexts.map((chunkText, index) => {
    const fullContent = headingPrefix ? `${headingPrefix}${chunkText}` : chunkText;
    const tokenCount = estimateTokens(fullContent, doc.locale);
    const citationId = `cit:${doc.sourceType}:${doc.sourceId}:${index}`;
    const qdrantPointId = generateDeterministicPointId(
      doc.sourceType,
      doc.sourceId,
      doc.locale,
      index,
    );
    const chunkHash = computeContentHash(fullContent);

    const tags: string[] = Array.isArray(doc.metadata?.["tags"])
      ? (doc.metadata["tags"] as string[])
      : [];

    const headingHierarchy: string[] = [doc.sourceType, doc.title];
    if (typeof doc.metadata?.["section"] === "string") {
      headingHierarchy.push(doc.metadata["section"]);
    }

    const metadata: ChunkMetadata = {
      sourceType: doc.sourceType,
      sourceId: doc.sourceId,
      title: doc.title,
      locale: doc.locale,
      headingHierarchy,
      tags,
      sectionScope:
        typeof doc.metadata?.["section"] === "string" ? doc.metadata["section"] : undefined,
      citationId,
      contentHash: chunkHash,
      qdrantPointId,
    };

    return {
      id: `${doc.sourceId}-chunk-${index}`,
      documentId: doc.sourceId,
      chunkIndex: index,
      totalChunks,
      content: fullContent,
      tokenCount,
      citationId,
      qdrantPointId,
      contentHash: chunkHash,
      metadata,
    };
  });
}
