import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { inlineEditUpdateSchema } from "@/modules/admin/domain/inline-edit";
import { inlineEditService } from "@/modules/admin/infrastructure/inline-edit-service";
import { logger } from "@/lib/observability/logger";

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce admin role strictly on the server
    const authContext = await requireAdmin(request.headers);

    // 2. Validate request payload against domain schema
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const parseResult = inlineEditUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // 3. Extract request metadata for security audit
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    // 4. Authoritatively persist the inline change
    const result = await inlineEditService.updateContent(parseResult.data, authContext.user.id, {
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      if ("conflict" in result && result.conflict) {
        return NextResponse.json(result, { status: 409 });
      }
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }

    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }

    logger.error("unexpected_inline_edit_route_error", {
      module: "admin",
      metadata: { error: String(err) },
    });

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
