import { tokenizeMultilingual } from "@/ai/retrieval/sparse/arabic-bm25-tokenizer";

/**
 * Computes a Set of token n-grams (unigrams + bigrams) for lexical similarity calculation.
 */
export function extractTokenShingles(text: string): Set<string> {
  const tokens = tokenizeMultilingual(text);
  const shingles = new Set<string>();

  for (let i = 0; i < tokens.length; i++) {
    const unigram = tokens[i];
    if (unigram) shingles.add(unigram);

    if (i < tokens.length - 1) {
      const bigram = `${unigram}__${tokens[i + 1]}`;
      shingles.add(bigram);
    }
  }

  return shingles;
}

/**
 * Calculates Jaccard similarity between two shingle sets.
 * Returns a value in [0.0, 1.0].
 */
export function computeJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionSize = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionSize++;
    }
  }

  const unionSize = setA.size + setB.size - intersectionSize;
  if (unionSize === 0) return 0.0;

  return intersectionSize / unionSize;
}

/**
 * Checks if candidate text is a duplicate or near-duplicate of any already-accepted text.
 */
export function isNearDuplicate(
  candidateText: string,
  acceptedShingleSets: Set<string>[],
  similarityThreshold: number = 0.8,
): boolean {
  if (acceptedShingleSets.length === 0) return false;

  const candidateShingles = extractTokenShingles(candidateText);
  if (candidateShingles.size === 0) return false;

  for (const acceptedSet of acceptedShingleSets) {
    const sim = computeJaccardSimilarity(candidateShingles, acceptedSet);
    if (sim >= similarityThreshold) {
      return true;
    }
  }

  return false;
}
