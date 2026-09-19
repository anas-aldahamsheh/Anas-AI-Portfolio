import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { ReorderSectionsSchema } from "@/modules/content/domain/content-center";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/content/sections/reorder
 * Reorders sections for a page with keyboard or drag/drop ordering.
 * Guarded by requireAdmin.
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    const body = await request.json().catch(() => ({}));
    const validated = ReorderSectionsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid reorder payload", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const result = await contentCenterService.reorderSections(
      validated.data.pageId,
      validated.data.sectionIds,
      authContext.user.id,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    logger.error("Failed to reorder sections", {
      module: "content_center",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: "Failed to reorder sections" }, { status: 500 });
  }
}
