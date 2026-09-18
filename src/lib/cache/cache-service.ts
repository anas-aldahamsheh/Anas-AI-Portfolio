import type {
  CacheEntry,
  CacheStats,
  CacheKeySummary,
  SystemCacheTag,
} from "./cache-types";
import { logger } from "@/lib/observability/logger";

export class CacheService {
  private entries = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();
  private hitsCount = 0;
  private missesCount = 0;

  private readonly DEFAULT_TTL_MS = 60 * 1000; // 1 minute default

  /**
   * Cleans up expired entries when requested or during iteration
   */
  private cleanIfExpired(key: string, entry: CacheEntry<unknown>): boolean {
    if (Date.now() > entry.expiresAt) {
      this.invalidateKey(key);
      return true;
    }
    return false;
  }

  /**
   * Sets a cached value with TTL and associated tags
   */
  public set<T>(
    key: string,
    value: T,
    options?: { ttlMs?: number; tags?: (SystemCacheTag | string)[] },
  ): void {
    // Remove previous tags if key already existed
    this.invalidateKey(key);

    const ttlMs = options?.ttlMs ?? this.DEFAULT_TTL_MS;
    const tags = options?.tags ? Array.from(new Set(options.tags)) : ["system"];
    const now = Date.now();

    const entry: CacheEntry<T> = {
      key,
      value,
      tags,
      ttlMs,
      createdAt: now,
      expiresAt: now + ttlMs,
      hits: 0,
    };

    this.entries.set(key, entry as CacheEntry<unknown>);

    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  /**
   * Retrieves a cached value by key. Returns null if missing or expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) {
      this.missesCount++;
      return null;
    }

    if (this.cleanIfExpired(key, entry)) {
      this.missesCount++;
      return null;
    }

    entry.hits++;
    this.hitsCount++;
    return entry.value as T;
  }

  /**
   * Retrieves value from cache or computes it via factory and caches it
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options?: { ttlMs?: number; tags?: (SystemCacheTag | string)[] },
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    this.set(key, fresh, options);
    return fresh;
  }

  /**
   * Invalidates a specific key from cache and all tag indices
   */
  public invalidateKey(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    for (const tag of entry.tags) {
      const keySet = this.tagIndex.get(tag);
      if (keySet) {
        keySet.delete(key);
        if (keySet.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }

    this.entries.delete(key);
    return true;
  }

  /**
   * Invalidates all keys associated with a specific tag
   * Returns the count of invalidated keys
   */
  public invalidateTag(tag: string): number {
    const keySet = this.tagIndex.get(tag);
    if (!keySet || keySet.size === 0) {
      return 0;
    }

    const keysToDelete = Array.from(keySet);
    for (const key of keysToDelete) {
      this.invalidateKey(key);
    }

    this.tagIndex.delete(tag);
    return keysToDelete.length;
  }

  /**
   * Invalidates all keys matching any of the provided tags
   */
  public invalidateTags(tags: string[]): number {
    let count = 0;
    for (const tag of tags) {
      count += this.invalidateTag(tag);
    }
    return count;
  }

  /**
   * Completely clears all cache entries and indices
   */
  public clear(): void {
    this.entries.clear();
    this.tagIndex.clear();
  }

  /**
   * Returns current cache telemetry and statistics
   */
  public getStats(): CacheStats {
    // Purge expired entries first
    const now = Date.now();
    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.invalidateKey(key);
      }
    }

    const totalRequests = this.hitsCount + this.missesCount;
    const hitRate = totalRequests > 0 ? Number((this.hitsCount / totalRequests).toFixed(4)) : 0;

    const tagDistribution: Record<string, number> = {};
    for (const [tag, keySet] of this.tagIndex.entries()) {
      tagDistribution[tag] = keySet.size;
    }

    return {
      totalKeys: this.entries.size,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRate,
      tagsCount: this.tagIndex.size,
      tagDistribution,
    };
  }

  /**
   * Lists active cached keys with optional tag filtering or search query
   */
  public listKeys(options?: { tag?: string | undefined; search?: string | undefined }): CacheKeySummary[] {
    const now = Date.now();
    const results: CacheKeySummary[] = [];

    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.invalidateKey(key);
        continue;
      }

      if (options?.tag && !entry.tags.includes(options.tag)) {
        continue;
      }

      if (
        options?.search &&
        !key.toLowerCase().includes(options.search.toLowerCase()) &&
        !entry.tags.some((t) => t.toLowerCase().includes(options.search!.toLowerCase()))
      ) {
        continue;
      }

      results.push({
        key: entry.key,
        tags: entry.tags,
        ttlRemainingMs: Math.max(0, entry.expiresAt - now),
        hits: entry.hits,
        createdAt: new Date(entry.createdAt).toISOString(),
        expiresAt: new Date(entry.expiresAt).toISOString(),
      });
    }

    return results.sort((a, b) => b.hits - a.hits);
  }

  /**
   * Resets telemetry metrics (for testing)
   */
  public resetMetrics(): void {
    this.hitsCount = 0;
    this.missesCount = 0;
  }
}

export const cacheService = new CacheService();

/**
 * Safely invalidates Next.js tag and local cache simultaneously
 */
export async function invalidateCacheTag(tag: string): Promise<number> {
  const localCount = cacheService.invalidateTag(tag);
  try {
    const nextCache = await import("next/cache");
    if (typeof nextCache.revalidateTag === "function") {
      (nextCache.revalidateTag as unknown as (t: string) => void)(tag);
    }
  } catch (err) {
    logger.debug("Next.js revalidateTag not available or failed", {
      metadata: { tag, error: String(err) },
    });
  }
  return localCount;
}
