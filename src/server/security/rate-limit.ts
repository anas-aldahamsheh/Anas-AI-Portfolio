import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

export interface Limit {
  /** Window length in seconds. */
  window: number;
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
}

/**
 * Fixed-window rate limiting shared by every serverless instance (one upsert per window).
 * Fails open: if the database is unreachable the request is allowed, because blocking every
 * visitor is worse than briefly losing the limit.
 */
export async function rateLimit(key: string, limits: Limit[]): Promise<RateLimitResult> {
  const now = Date.now();
  try {
    for (const limit of limits) {
      const windowStart = new Date(Math.floor(now / (limit.window * 1000)) * limit.window * 1000);
      const bucket = `${key}:${limit.window}`;
      const rows = (await db.execute<{ count: number }>(sql`
        insert into rate_limit_buckets (key, window_start, count)
        values (${bucket}, ${windowStart.toISOString()}::timestamptz, 1)
        on conflict (key, window_start) do update set count = rate_limit_buckets.count + 1
        returning count
      `)) as unknown as { count: number }[];
      const count = Number(rows[0]?.count ?? 0);
      if (count > limit.max) {
        const retryAfter = Math.ceil((windowStart.getTime() + limit.window * 1000 - now) / 1000);
        return { ok: false, retryAfter: Math.max(retryAfter, 1) };
      }
    }
    if (Math.random() < 0.02) {
      void db
        .execute(sql`delete from rate_limit_buckets where window_start < now() - interval '2 days'`)
        .catch(() => {});
    }
    return { ok: true, retryAfter: 0 };
  } catch (error) {
    console.error("rate_limit_unavailable", error instanceof Error ? error.message : error);
    return { ok: true, retryAfter: 0 };
  }
}

/** The caller's IP as seen by the platform proxy (Vercel overwrites these headers). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/** A salted, one-way visitor id: groups requests without storing the IP. */
export function visitorId(headers: Headers): string {
  const salt = process.env["BETTER_AUTH_SECRET"] || "portfolio";
  return createHash("sha256")
    .update(`${salt}:${clientIp(headers)}`)
    .digest("hex")
    .slice(0, 24);
}
