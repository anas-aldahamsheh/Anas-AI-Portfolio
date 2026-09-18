import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { featureFlagService } from "@/modules/admin/infrastructure/feature-flag-service";
import { UpdateFeatureFlagSchema } from "@/modules/admin/domain/feature-flags";

interface RouteParams {
  params: Promise<{ key: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = UpdateFeatureFlagSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await featureFlagService.updateFlag(
      decodedKey,
      parseResult.data,
      authContext.user.id,
    );

    return NextResponse.json({ success: true, flag: updated });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
