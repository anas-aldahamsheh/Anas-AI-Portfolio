import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/infrastructure/server-auth";
import { cacheService } from "@/lib/cache/cache-service";
import { db } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema/admin";

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

  const beforeCount = cacheService.getStats().totalKeys;
  cacheService.clear();

  try {
    await db.insert(auditEvents).values({
      action: "cache_flush_all",
      entityType: "cache",
      entityId: "all",
      userId: adminContext.user.id,
      previousState: { totalKeys: beforeCount },
      newState: { flushed: true, clearedKeys: beforeCount },
    });
  } catch {
    // Offline fallback
  }

  return NextResponse.json({
    success: true,
    message: "Cache flushed completely",
    flushedCount: beforeCount,
    stats: cacheService.getStats(),
  });
}
