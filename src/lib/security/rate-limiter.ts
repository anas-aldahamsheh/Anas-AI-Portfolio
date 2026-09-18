import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/observability/logger";

export type RateLimitTier = "chat" | "job_fit" | "ai_lab" | "auth" | "admin" | "public";

export interface RateLimitRule {
  limit: number;
  windowMs: number;
  burstLimit?: number | undefined;
  cooldownMs?: number | undefined;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
  tier: RateLimitTier;
  key: string;
}

export interface BlockedClientInfo {
  key: string;
  tier: RateLimitTier;
  blockedUntil: number;
  reason: string;
}

export const RATE_LIMIT_RULES: Record<RateLimitTier, RateLimitRule> = {
  chat: {
    limit: 20,
    windowMs: 60 * 1000, // 20 requests per minute
    burstLimit: 5, // max 5 requests per 2 seconds
    cooldownMs: 30 * 1000,
  },
  job_fit: {
    limit: 10,
    windowMs: 60 * 1000, // 10 requests per minute
    burstLimit: 3,
    cooldownMs: 30 * 1000,
  },
  ai_lab: {
    limit: 30,
    windowMs: 60 * 1000, // 30 requests per minute
    burstLimit: 8,
    cooldownMs: 20 * 1000,
  },
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 5 requests per 15 minutes (brute-force defense)
    burstLimit: 3,
    cooldownMs: 5 * 60 * 1000,
  },
  admin: {
    limit: 120,
    windowMs: 60 * 1000, // 120 requests per minute
    burstLimit: 30,
    cooldownMs: 15 * 1000,
  },
  public: {
    limit: 60,
    windowMs: 60 * 1000, // 60 requests per minute
    burstLimit: 20,
    cooldownMs: 15 * 1000,
  },
};

interface WindowRecord {
  timestamps: number[];
  blockedUntil?: number;
}

export class RateLimiter {
  private records = new Map<string, WindowRecord>();
  private rules: Record<RateLimitTier, RateLimitRule>;

  constructor(customRules?: Partial<Record<RateLimitTier, RateLimitRule>>) {
    this.rules = { ...RATE_LIMIT_RULES, ...customRules };
  }

  /**
   * Resolves client identifier from HTTP request headers
   */
  public resolveClientIdentifier(request: NextRequest): string {
    // 1. Check for authenticated user ID in headers if forwarded
    const userId = request.headers.get("x-user-id");
    if (userId) return `user:${userId}`;

    // 2. Client IP resolution with proxy forwarding support
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      const parts = forwardedFor.split(",");
      const first = parts[0]?.trim();
      if (first) return `ip:${first}`;
    }

    const realIp = request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
    if (realIp) return `ip:${realIp}`;

    return "ip:127.0.0.1";
  }

  /**
   * Evaluates request against sliding window and burst protection rules
   */
  public check(identifier: string, tier: RateLimitTier): RateLimitResult {
    const rule = this.rules[tier] || this.rules.public;
    const now = Date.now();
    const storageKey = `${tier}:${identifier}`;

    let record = this.records.get(storageKey);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(storageKey, record);
    }

    // 1. Check if client is currently in cooldown / banned
    if (record.blockedUntil && record.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        allowed: false,
        limit: rule.limit,
        remaining: 0,
        resetTimeMs: record.blockedUntil,
        retryAfterSeconds,
        tier,
        key: storageKey,
      };
    }

    // 2. Sliding window: prune timestamps older than now - windowMs
    const windowStart = now - rule.windowMs;
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    // 3. Abuse / Burst check: if burstLimit defined, check requests in last 2 seconds
    if (rule.burstLimit && rule.cooldownMs) {
      const recentBurst = record.timestamps.filter((ts) => ts > now - 2000);
      if (recentBurst.length >= rule.burstLimit) {
        record.blockedUntil = now + rule.cooldownMs;
        const retryAfterSeconds = Math.ceil(rule.cooldownMs / 1000);

        logger.warn("Rate limit burst abuse detected, applying cooldown", {
          metadata: { identifier, tier, burstCount: recentBurst.length },
        });

        return {
          allowed: false,
          limit: rule.limit,
          remaining: 0,
          resetTimeMs: record.blockedUntil,
          retryAfterSeconds,
          tier,
          key: storageKey,
        };
      }
    }

    // 4. Check main window threshold
    if (record.timestamps.length >= rule.limit) {
      const oldest = record.timestamps[0] ?? now;
      const resetTimeMs = oldest + rule.windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      return {
        allowed: false,
        limit: rule.limit,
        remaining: 0,
        resetTimeMs,
        retryAfterSeconds,
        tier,
        key: storageKey,
      };
    }

    // 5. Allowed: record timestamp
    record.timestamps.push(now);
    const remaining = Math.max(0, rule.limit - record.timestamps.length);
    const resetTimeMs = now + rule.windowMs;
    const retryAfterSeconds = Math.ceil(rule.windowMs / 1000);

    return {
      allowed: true,
      limit: rule.limit,
      remaining,
      resetTimeMs,
      retryAfterSeconds,
      tier,
      key: storageKey,
    };
  }

  /**
   * Resets rate limits for a specific identifier or tier
   */
  public reset(identifier?: string, tier?: RateLimitTier): void {
    if (!identifier && !tier) {
      this.records.clear();
      return;
    }

    for (const [k] of this.records.entries()) {
      const [recTier, recId] = k.split(":");
      if (tier && recTier !== tier) continue;
      if (identifier && recId !== identifier) continue;
      this.records.delete(k);
    }
  }

  /**
   * Lists currently throttled or blocked clients
   */
  public listThrottledClients(): BlockedClientInfo[] {
    const now = Date.now();
    const result: BlockedClientInfo[] = [];

    for (const [key, record] of this.records.entries()) {
      const parts = key.split(":");
      const tier = (parts[0] || "public") as RateLimitTier;

      if (record.blockedUntil && record.blockedUntil > now) {
        result.push({
          key,
          tier,
          blockedUntil: record.blockedUntil,
          reason: "Burst cooldown active",
        });
      } else {
        const rule = this.rules[tier] || this.rules.public;
        const activeInWindow = record.timestamps.filter((ts) => ts > now - rule.windowMs);
        if (activeInWindow.length >= rule.limit) {
          result.push({
            key,
            tier,
            blockedUntil: (record.timestamps[0] ?? now) + rule.windowMs,
            reason: "Window limit exceeded",
          });
        }
      }
    }

    return result;
  }

  /**
   * Attach rate limit response headers to an outgoing NextResponse
   */
  public attachHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTimeMs / 1000)));

    if (!result.allowed) {
      response.headers.set("Retry-After", String(result.retryAfterSeconds));
    }

    return response;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Utility helper to apply rate limiting in route handlers
 * Returns a 429 NextResponse if throttled, or null if allowed
 */
export function applyRateLimit(
  request: NextRequest,
  tier: RateLimitTier,
): { isAllowed: boolean; response?: NextResponse; result: RateLimitResult } {
  const identifier = rateLimiter.resolveClientIdentifier(request);
  const result = rateLimiter.check(identifier, tier);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please slow down.",
        tier: result.tier,
        retryAfter: result.retryAfterSeconds,
      },
      { status: 429 },
    );
    rateLimiter.attachHeaders(response, result);
    return { isAllowed: false, response, result };
  }

  return { isAllowed: true, result };
}
