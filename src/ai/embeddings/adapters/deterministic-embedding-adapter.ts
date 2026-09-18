import { createHash } from "crypto";
import { EmbeddingPort } from "@/ai/contracts/ingestion";

/**
 * Deterministic embedding adapter producing 1024-dimensional unit-normalized vectors.
 * Used for testing, offline ingestion fallback, and reproducible embeddings.
 */
export class DeterministicEmbeddingAdapter implements EmbeddingPort {
  public readonly dimension: number = 1024;
  public readonly modelName: string = "BAAI/bge-m3";

  public async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => this.generateVector(text));
  }

  private generateVector(text: string): number[] {
    const vector = new Array<number>(this.dimension);
    const normalizedInput = text.trim().toLowerCase();

    // Generate 1024 pseudo-random float values seeded by content hash
    for (let i = 0; i < this.dimension; i++) {
      const hash = createHash("sha256");
      hash.update(`${normalizedInput}:${i}`);
      const digest = hash.digest();
      // Read 32-bit integer and map to [-1.0, 1.0]
      const intVal = digest.readInt32BE(0);
      vector[i] = intVal / 2147483648.0;
    }

    // L2 Normalize the vector so ||v|| = 1.0
    let sumSq = 0;
    for (let i = 0; i < this.dimension; i++) {
      const val = vector[i] ?? 0;
      sumSq += val * val;
    }

    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (let i = 0; i < this.dimension; i++) {
        vector[i] = (vector[i] ?? 0) / norm;
      }
    }

    return vector;
  }
}

export const deterministicEmbeddingAdapter = new DeterministicEmbeddingAdapter();
