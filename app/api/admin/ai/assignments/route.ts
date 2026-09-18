import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { assignModelSchema } from "@/ai/contracts/provider-registry";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get("environment") || "production";

    const assignments = await modelRegistryService.listAssignments(environment);
    return NextResponse.json({ assignments });
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

export async function PUT(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = assignModelSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    try {
      const assignment = await modelRegistryService.assignModel(
        parseResult.data.capability,
        parseResult.data.modelId,
        parseResult.data.environment || "production",
        authContext.user.id,
      );

      return NextResponse.json({ assignment });
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
