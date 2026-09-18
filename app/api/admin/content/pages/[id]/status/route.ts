import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { UpdatePageStatusSchema } from "@/modules/content/domain/content-center";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/content/pages/[id]/status
 * Update publishing status (DRAFT / PUBLISHED / ARCHIVED) of a page.
 * Guarded by requireAdmin.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const validated = UpdatePageStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid status update payload", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const result = await contentCenterService.updatePageStatus(
      id,
      validated.data.status,
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

    logger.error("Failed to update page status", {
      module: "content_center",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: "Failed to update page status" }, { status: 500 });
  }
}
