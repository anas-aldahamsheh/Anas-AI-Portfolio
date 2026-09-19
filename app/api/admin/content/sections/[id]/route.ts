import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { UpdateSectionSchema } from "@/modules/content/domain/content-center";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/content/sections/[id] - Update section
 * DELETE /api/admin/content/sections/[id] - Delete section
 * Guarded by requireAdmin.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const validated = UpdateSectionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid section update payload", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const result = await contentCenterService.updateSection(
      id,
      validated.data,
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

    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await params;

    const result = await contentCenterService.deleteSection(id, authContext.user.id);

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

    logger.error("Failed to delete section", {
      module: "content_center",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
