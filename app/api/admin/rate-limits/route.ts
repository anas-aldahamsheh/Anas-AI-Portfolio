import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/infrastructure/server-auth";
import { rateLimiter, RATE_LIMIT_RULES, type RateLimitTier } from "@/lib/security/rate-limiter";
import { db } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
  } catch (err: unknown) {
    const error = err as { status?: number; statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.status || error.statusCode || 401 },
    );
  }

  const throttled = rateLimiter.listThrottledClients();

  return NextResponse.json({
    success: true,
    rules: RATE_LIMIT_RULES,
    throttledClients: throttled,
  });
}

export async function POST(request: NextRequest) {
  let adminContext;
  try {
    adminContext = await requireAdmin(request.headers);
  } catch (err: unknown) {
    const error = err as { status?: number; statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.status || error.statusCode || 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, tier, all } = body as {
      identifier?: string;
      tier?: RateLimitTier;
      all?: boolean;
    };

    if (all) {
      rateLimiter.reset();
    } else {
      rateLimiter.reset(identifier, tier);
    }

    try {
      await db.insert(auditEvents).values({
        action: "rate_limit_reset",
        entityType: "rate_limit",
        entityId: all ? "all" : (identifier || tier || "custom"),
        userId: adminContext.user.id,
        previousState: null,
        newState: { all: all ?? false, identifier, tier },
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      message: "Rate limits reset successfully",
      throttledClients: rateLimiter.listThrottledClients(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 },
    );
  }
}
