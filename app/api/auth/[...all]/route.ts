import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/security/auth";
import { rateLimit, visitorId } from "@/server/security/rate-limit";

const handler = toNextJsHandler(auth.handler);

export const GET = handler.GET;

/**
 * Password attempts are also counted in Postgres: Better Auth keeps its own counters in memory,
 * which every serverless instance and cold start resets.
 */
export async function POST(request: Request) {
  if (new URL(request.url).pathname.endsWith("/sign-in/email")) {
    const limit = await rateLimit(`signin:${visitorId(request.headers)}`, [
      { window: 60, max: 5 },
      { window: 3600, max: 30 },
    ]);
    if (!limit.ok) {
      return Response.json(
        { code: "TOO_MANY_REQUESTS", message: "Too many sign-in attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
  }
  return handler.POST(request);
}
