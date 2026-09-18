import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { CreateSectionSchema } from "@/modules/content/domain/content-center";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content/sections?pageId=...
 * POST /api/admin/content/sections
 * Guarded by requireAdmin.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ error: "pageId query parameter is required" }, { status: 400 });
    }

    const sectionsList = await contentCenterService.getPageSections(pageId);

    return NextResponse.json({
      success: true,
      data: sectionsList,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to list sections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    const body = await request.json().catch(() => ({}));
    const validated = CreateSectionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid section creation payload", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const newSection = await contentCenterService.createSection(
      validated.data,
      authContext.user.id,
    );

    return NextResponse.json({
      success: true,
      data: newSection,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    logger.error("Failed to create section", {
      module: "content_center",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
