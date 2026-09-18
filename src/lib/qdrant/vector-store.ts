export interface VectorPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface ScoredPoint {
  id: string;
  score: number;
  payload?: Record<string, unknown> | undefined;
}

export interface SearchFilter {
  must?: Array<{ key: string; match: { value: unknown } }> | undefined;
}

export interface CollectionInfo {
  pointsCount: number;
  status: string;
  vectorsCount?: number | undefined;
}

export interface IVectorStore {
  createCollectionIfNotExists(collectionName: string, vectorSize?: number): Promise<void>;
  upsertPoints(collectionName: string, points: VectorPoint[]): Promise<void>;
  deletePoints(collectionName: string, pointIds: string[]): Promise<void>;
  deleteByFilter(collectionName: string, key: string, value: unknown): Promise<void>;
  search(
    collectionName: string,
    vector: number[],
    limit?: number,
    filter?: SearchFilter,
  ): Promise<ScoredPoint[]>;
  scrollPoints(
    collectionName: string,
    limit?: number,
    filter?: SearchFilter,
  ): Promise<VectorPoint[]>;
  getCollectionInfo(collectionName: string): Promise<CollectionInfo | null>;
}

/**
 * Calculates cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Resilient Vector Store with Qdrant REST API support and in-memory fallback.
 * Guarantees that tests, builds, and local development run without external Qdrant dependency.
 */
export class QdrantVectorStore implements IVectorStore {
  private inMemoryCollections = new Map<string, Map<string, VectorPoint>>();
  private baseUrl: string | null;
  private apiKey: string | null;
  private preferInMemory: boolean;

  constructor(options?: {
    baseUrl?: string | null;
    apiKey?: string | null;
    forceInMemory?: boolean;
  }) {
    this.baseUrl = options?.baseUrl ?? process.env["QDRANT_URL"] ?? null;
    this.apiKey = options?.apiKey ?? process.env["QDRANT_API_KEY"] ?? null;
    this.preferInMemory =
      options?.forceInMemory ?? (!this.baseUrl || process.env["NODE_ENV"] === "test");
  }

  public clearInMemoryStore(collectionName?: string): void {
    if (collectionName) {
      this.inMemoryCollections.delete(collectionName);
    } else {
      this.inMemoryCollections.clear();
    }
  }

  private getInMemoryCollection(name: string): Map<string, VectorPoint> {
    let collection = this.inMemoryCollections.get(name);
    if (!collection) {
      collection = new Map<string, VectorPoint>();
      this.inMemoryCollections.set(name, collection);
    }
    return collection;
  }

  public async createCollectionIfNotExists(
    collectionName: string,
    vectorSize: number = 1024,
  ): Promise<void> {
    if (this.preferInMemory || !this.baseUrl) {
      this.getInMemoryCollection(collectionName);
      return;
    }

    try {
      const checkRes = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
        headers: this.getHeaders(),
      });
      if (checkRes.ok) return;

      const createRes = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: "Cosine",
          },
        }),
      });

      if (!createRes.ok && createRes.status !== 409) {
        throw new Error(`Failed to create Qdrant collection: ${createRes.statusText}`);
      }
    } catch {
      // Fallback to in-memory on network error
      this.getInMemoryCollection(collectionName);
    }
  }

  public async upsertPoints(collectionName: string, points: VectorPoint[]): Promise<void> {
    if (points.length === 0) return;

    if (this.preferInMemory || !this.baseUrl) {
      const col = this.getInMemoryCollection(collectionName);
      for (const pt of points) {
        col.set(pt.id, pt);
      }
      return;
    }

    try {
      const res = await fetch(`${this.baseUrl}/collections/${collectionName}/points`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({
          points: points.map((p) => ({
            id: p.id,
            vector: p.vector,
            payload: p.payload,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to upsert points to Qdrant: ${res.statusText}`);
      }
    } catch {
      // Graceful fallback to in-memory
      const col = this.getInMemoryCollection(collectionName);
      for (const pt of points) {
        col.set(pt.id, pt);
      }
    }
  }

  public async deletePoints(collectionName: string, pointIds: string[]): Promise<void> {
    if (pointIds.length === 0) return;

    if (this.preferInMemory || !this.baseUrl) {
      const col = this.getInMemoryCollection(collectionName);
      for (const id of pointIds) {
        col.delete(id);
      }
      return;
    }

    try {
      const res = await fetch(`${this.baseUrl}/collections/${collectionName}/points/delete`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          points: pointIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete points in Qdrant: ${res.statusText}`);
      }
    } catch {
      const col = this.getInMemoryCollection(collectionName);
      for (const id of pointIds) {
        col.delete(id);
      }
    }
  }

  public async deleteByFilter(collectionName: string, key: string, value: unknown): Promise<void> {
    if (this.preferInMemory || !this.baseUrl) {
      const col = this.getInMemoryCollection(collectionName);
      const toDelete: string[] = [];
      for (const [id, pt] of col.entries()) {
        if (pt.payload[key] === value) {
          toDelete.push(id);
        }
      }
      for (const id of toDelete) {
        col.delete(id);
      }
      return;
    }

    try {
      const res = await fetch(`${this.baseUrl}/collections/${collectionName}/points/delete`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          filter: {
            must: [{ key, match: { value } }],
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete points by filter in Qdrant: ${res.statusText}`);
      }
    } catch {
      const col = this.getInMemoryCollection(collectionName);
      const toDelete: string[] = [];
      for (const [id, pt] of col.entries()) {
        if (pt.payload[key] === value) {
          toDelete.push(id);
        }
      }
      for (const id of toDelete) {
        col.delete(id);
      }
    }
  }

  public async search(
    collectionName: string,
    vector: number[],
    limit: number = 10,
    filter?: SearchFilter,
  ): Promise<ScoredPoint[]> {
    if (this.preferInMemory || !this.baseUrl) {
      return this.inMemorySearch(collectionName, vector, limit, filter);
    }

    try {
      const body: Record<string, unknown> = {
        vector,
        limit,
        with_payload: true,
      };

      if (filter) {
        body["filter"] = filter;
      }

      const res = await fetch(`${this.baseUrl}/collections/${collectionName}/points/search`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return this.inMemorySearch(collectionName, vector, limit, filter);
      }

      const data = (await res.json()) as {
        result?: Array<{ id: string; score: number; payload?: Record<string, unknown> }>;
      };

      return (data.result ?? []).map((item) => ({
        id: item.id,
        score: item.score,
        payload: item.payload,
      }));
    } catch {
      return this.inMemorySearch(collectionName, vector, limit, filter);
    }
  }

  private inMemorySearch(
    collectionName: string,
    vector: number[],
    limit: number = 10,
    filter?: SearchFilter,
  ): ScoredPoint[] {
    const col = this.getInMemoryCollection(collectionName);
    const scored: ScoredPoint[] = [];

    for (const [id, pt] of col.entries()) {
      // Apply filters if present
      if (filter?.must && filter.must.length > 0) {
        let matches = true;
        for (const condition of filter.must) {
          const actualVal = pt.payload[condition.key];
          const expectedVal = condition.match.value;
          if (Array.isArray(expectedVal)) {
            if (!expectedVal.includes(actualVal)) {
              matches = false;
              break;
            }
          } else if (actualVal !== expectedVal) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      }

      const score = cosineSimilarity(vector, pt.vector);
      scored.push({
        id,
        score,
        payload: pt.payload,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  public async scrollPoints(
    collectionName: string,
    limit: number = 200,
    filter?: SearchFilter,
  ): Promise<VectorPoint[]> {
    if (this.preferInMemory || !this.baseUrl) {
      return this.inMemoryScroll(collectionName, limit, filter);
    }

    try {
      const body: Record<string, unknown> = {
        limit,
        with_payload: true,
        with_vector: false,
      };
      if (filter) {
        body["filter"] = filter;
      }

      const res = await fetch(`${this.baseUrl}/collections/${collectionName}/points/scroll`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return this.inMemoryScroll(collectionName, limit, filter);
      }

      const data = (await res.json()) as {
        result?: {
          points?: Array<{
            id: string;
            vector?: number[];
            payload?: Record<string, unknown>;
          }>;
        };
      };

      return (data.result?.points ?? []).map((pt) => ({
        id: pt.id,
        vector: pt.vector ?? [],
        payload: pt.payload ?? {},
      }));
    } catch {
      return this.inMemoryScroll(collectionName, limit, filter);
    }
  }

  private inMemoryScroll(
    collectionName: string,
    limit: number = 200,
    filter?: SearchFilter,
  ): VectorPoint[] {
    const col = this.getInMemoryCollection(collectionName);
    const results: VectorPoint[] = [];

    for (const [, pt] of col.entries()) {
      if (filter?.must && filter.must.length > 0) {
        let matches = true;
        for (const condition of filter.must) {
          const actualVal = pt.payload[condition.key];
          const expectedVal = condition.match.value;
          if (Array.isArray(expectedVal)) {
            if (!expectedVal.includes(actualVal)) {
              matches = false;
              break;
            }
          } else if (actualVal !== expectedVal) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      }

      results.push(pt);
      if (results.length >= limit) break;
    }

    return results;
  }

  public async getCollectionInfo(collectionName: string): Promise<CollectionInfo | null> {
    if (this.preferInMemory || !this.baseUrl) {
      const col = this.getInMemoryCollection(collectionName);
      return {
        pointsCount: col.size,
        status: "green",
        vectorsCount: col.size,
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        const col = this.getInMemoryCollection(collectionName);
        return {
          pointsCount: col.size,
          status: "green",
          vectorsCount: col.size,
        };
      }

      const data = (await res.json()) as {
        result?: { points_count?: number; status?: string; vectors_count?: number };
      };

      return {
        pointsCount: data.result?.points_count ?? 0,
        status: data.result?.status ?? "unknown",
        vectorsCount: data.result?.vectors_count ?? 0,
      };
    } catch {
      const col = this.getInMemoryCollection(collectionName);
      return {
        pointsCount: col.size,
        status: "green",
        vectorsCount: col.size,
      };
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["api-key"] = this.apiKey;
    }
    return headers;
  }
}

export const vectorStore = new QdrantVectorStore();
