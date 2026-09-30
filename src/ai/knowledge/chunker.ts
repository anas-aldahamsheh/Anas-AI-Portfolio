/**
 * Structure-aware chunker. A knowledge document is a title plus ordered sections; each chunk keeps
 * the heading path it came from so retrieval results can be cited and embedded with context
 * ("contextual chunk headers"), which markedly improves recall for short, factual chunks.
 */

export interface KnowledgeSection {
  heading?: string;
  text: string;
}

export interface KnowledgeDocumentInput {
  title: string;
  sections: KnowledgeSection[];
}

export interface Chunk {
  ordinal: number;
  heading: string;
  text: string;
}

export interface ChunkOptions {
  /** Soft upper bound for a chunk body, in characters. */
  maxChars?: number;
  /** Characters of trailing context carried into the next chunk of the same section. */
  overlapChars?: number;
  /** Sections shorter than this are merged with the next one under a combined heading. */
  minChars?: number;
}

const SENTENCE_BOUNDARY = /(?<=[.!?؟。])\s+|\n+/u;

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_BOUNDARY)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLong(sentence: string, maxChars: number): string[] {
  if (sentence.length <= maxChars) return [sentence];
  const out: string[] = [];
  let rest = sentence;
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf(" ", maxChars);
    if (cut < maxChars * 0.5) cut = maxChars;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

function tailOverlap(text: string, overlapChars: number): string {
  if (overlapChars <= 0 || text.length <= overlapChars) return "";
  const sentences = splitSentences(text);
  let tail = "";
  for (let i = sentences.length - 1; i >= 0; i--) {
    const candidate = `${sentences[i]} ${tail}`.trim();
    if (candidate.length > overlapChars) break;
    tail = candidate;
  }
  return tail;
}

export function chunkDocument(doc: KnowledgeDocumentInput, options: ChunkOptions = {}): Chunk[] {
  const maxChars = options.maxChars ?? 1100;
  const overlapChars = options.overlapChars ?? 160;
  const minChars = options.minChars ?? 220;

  // 1. Merge tiny adjacent sections so we don't produce a flood of 1-line chunks.
  const merged: KnowledgeSection[] = [];
  for (const section of doc.sections) {
    const text = section.text.trim();
    if (!text) continue;
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.text.length < minChars &&
      previous.text.length + text.length < maxChars
    ) {
      const headings = [previous.heading, section.heading].filter(Boolean).join(" · ");
      merged[merged.length - 1] = {
        ...(headings ? { heading: headings } : {}),
        text: `${previous.text}\n${section.heading ? `${section.heading}: ` : ""}${text}`,
      };
    } else {
      merged.push({ ...(section.heading ? { heading: section.heading } : {}), text });
    }
  }

  // 2. Pack sentences of each section into chunks with a small overlap.
  const chunks: Chunk[] = [];
  for (const section of merged) {
    const heading = section.heading ? `${doc.title} › ${section.heading}` : doc.title;
    const sentences = splitSentences(section.text).flatMap((s) => splitLong(s, maxChars));
    let current = "";
    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length > maxChars && current) {
        chunks.push({ ordinal: chunks.length, heading, text: current });
        const overlap = tailOverlap(current, overlapChars);
        current = overlap ? `${overlap} ${sentence}` : sentence;
      } else {
        current = next;
      }
    }
    if (current) chunks.push({ ordinal: chunks.length, heading, text: current });
  }
  return chunks;
}

/** Text given to the embedding model: heading context + body. */
export function embeddingInput(chunk: Pick<Chunk, "heading" | "text">): string {
  return `${chunk.heading}\n\n${chunk.text}`;
}
