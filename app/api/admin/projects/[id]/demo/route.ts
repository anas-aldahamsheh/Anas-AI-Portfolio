import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { projectService } from "@/modules/projects/infrastructure/project-service";
import { projectDemoConfigSchema } from "@/modules/projects/domain/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request.headers);
    const { id } = await context.params;

    const config = await projectService.getDemoConfig(id);
    return NextResponse.json({
      success: true,
      isEnabled: config.isEnabled,
      demoUrl: config.demoUrl,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = projectDemoConfigSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid demo configuration", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await projectService.updateDemoConfig(
      id,
      parseResult.data,
      authContext.user.id,
    );

    return NextResponse.json({
      success: true,
      isEnabled: updated.isEnabled,
      demoUrl: updated.demoUrl,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
