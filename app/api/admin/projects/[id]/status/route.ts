import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { projectService } from "@/modules/projects/infrastructure/project-service";
import type { PublishStatus } from "@/modules/projects/domain/types";

const statusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = statusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid status value", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const success = await projectService.updateProjectStatus(
      id,
      parseResult.data.status as PublishStatus,
      authContext.user.id,
    );

    return NextResponse.json({ success, status: parseResult.data.status });
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
