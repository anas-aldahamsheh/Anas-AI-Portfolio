import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content/overview
 * Returns content center overview with pages, counts, and draft statistics.
 * Guarded by requireAdmin.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const summary = await contentCenterService.getSummary();

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    logger.error("Failed to fetch content overview", {
      module: "content_center",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json(
      { error: "Failed to retrieve content center overview" },
      { status: 500 },
    );
  }
}
