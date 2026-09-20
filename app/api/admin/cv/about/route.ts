import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { cvService } from "@/modules/cv/infrastructure/cv-service";
import { cvAboutConfigSchema } from "@/modules/cv/domain/cv";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const about = await cvService.getAboutConfig();
    return NextResponse.json({ success: true, about });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to retrieve CV about section" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = cvAboutConfigSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await cvService.updateAboutConfig(
      parseResult.data,
      authContext.user.id,
    );

    return NextResponse.json({ success: true, about: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update CV about section" },
      { status: 500 },
    );
  }
}
