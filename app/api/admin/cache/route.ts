import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/infrastructure/server-auth";
import { cacheService } from "@/lib/cache/cache-service";
import { InvalidateCacheSchema } from "@/lib/cache/cache-types";
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

  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;

  const stats = cacheService.getStats();
  const keys = cacheService.listKeys({ tag, search });

  return NextResponse.json({
    success: true,
    stats,
    keys,
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
    const body = await request.json();
    const parsed = InvalidateCacheSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { tags, keys, all } = parsed.data;
    let invalidatedCount = 0;

    if (all) {
      const beforeCount = cacheService.getStats().totalKeys;
      cacheService.clear();
      invalidatedCount = beforeCount;
    } else {
      if (tags && tags.length > 0) {
        invalidatedCount += cacheService.invalidateTags(tags);
      }
      if (keys && keys.length > 0) {
        for (const k of keys) {
          if (cacheService.invalidateKey(k)) {
            invalidatedCount++;
          }
        }
      }
    }

    // Log immutable audit event
    try {
      await db.insert(auditEvents).values({
        action: all ? "cache_flush_all" : "cache_invalidate",
        entityType: "cache",
        entityId: all ? "all" : (tags ? tags.join(",") : (keys ? keys.join(",") : "custom")),
        userId: adminContext.user.id,
        previousState: null,
        newState: {
          all: all ?? false,
          tags: tags ?? [],
          keys: keys ?? [],
          invalidatedCount,
        },
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      invalidatedCount,
      stats: cacheService.getStats(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 },
    );
  }
}
