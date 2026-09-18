import { z } from "zod";

export type SystemCacheTag =
  | "content"
  | "projects"
  | "cv"
  | "ai"
  | "prompts"
  | "rag"
  | "social"
  | "feature_flags"
  | "eval"
  | "system";

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  tags: string[];
  ttlMs: number;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  totalKeys: number;
  hits: number;
  misses: number;
  hitRate: number; // 0.0 to 1.0
  tagsCount: number;
  tagDistribution: Record<string, number>;
}

export interface CacheKeySummary {
  key: string;
  tags: string[];
  ttlRemainingMs: number;
  hits: number;
  createdAt: string;
  expiresAt: string;
}

export const InvalidateCacheSchema = z.object({
  tags: z.array(z.string().min(1)).optional(),
  keys: z.array(z.string().min(1)).optional(),
  all: z.boolean().optional(),
});

export type InvalidateCacheInput = z.infer<typeof InvalidateCacheSchema>;
