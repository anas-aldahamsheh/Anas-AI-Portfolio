import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { updateModelSchema } from "@/ai/contracts/provider-registry";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = updateModelSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await modelRegistryService.updateModel(
      id,
      parseResult.data,
      authContext.user.id,
    );

    if (!updated) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({ model: updated });
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { id } = await context.params;

    try {
      const success = await modelRegistryService.deleteModel(id, authContext.user.id);
      return NextResponse.json({ success });
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
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
