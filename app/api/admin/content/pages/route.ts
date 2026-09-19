import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { CreatePageSchema } from "@/modules/content/domain/content-center";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content/pages - List all pages
 * POST /api/admin/content/pages - Create a new page
 * Guarded by requireAdmin.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const pagesList = await contentCenterService.getPages();

    return NextResponse.json({
      success: true,
      data: pagesList,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to list pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    const body = await request.json().catch(() => ({}));
    const validated = CreatePageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid page creation payload", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const newPage = await contentCenterService.createPage(validated.data, authContext.user.id);

    return NextResponse.json({
      success: true,
      data: newPage,
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

    logger.error("Failed to create page", {
      module: "content_center",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
