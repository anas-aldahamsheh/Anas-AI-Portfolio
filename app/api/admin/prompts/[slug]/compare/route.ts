import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { promptService } from "@/ai/prompts";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request.headers);
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const v1Param = searchParams.get("v1");
    const v2Param = searchParams.get("v2");

    if (!v1Param || !v2Param) {
      return NextResponse.json(
        { error: "Query parameters 'v1' and 'v2' are required (e.g. ?v1=1&v2=2)" },
        { status: 400 },
      );
    }

    const v1 = parseInt(v1Param, 10);
    const v2 = parseInt(v2Param, 10);

    if (isNaN(v1) || isNaN(v2) || v1 <= 0 || v2 <= 0) {
      return NextResponse.json(
        { error: "'v1' and 'v2' must be positive integers" },
        { status: 400 },
      );
    }

    const diff = await promptService.compareVersions(slug, v1, v2);
    return NextResponse.json({ diff });
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
