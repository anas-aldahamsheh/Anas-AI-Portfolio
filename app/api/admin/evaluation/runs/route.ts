import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { evaluationService } from "@/ai/evaluation";
import { logger } from "@/lib/observability/logger";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const data = await evaluationService.getDashboardData();

    return NextResponse.json({
      success: true,
      data: {
        runs: data.recentRuns,
        activeEnvironment: data.activeEnvironment,
        languageParity: data.languageParity,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    logger.error("Failed to fetch admin evaluation runs", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
