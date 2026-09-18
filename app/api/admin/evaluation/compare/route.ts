import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { evaluationService } from "@/ai/evaluation";
import { CompareRunsRequestSchema } from "@/ai/contracts/evaluation";
import { logger } from "@/lib/observability/logger";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const { searchParams } = new URL(request.url);
    const baselineId = searchParams.get("baselineId");
    const candidateId = searchParams.get("candidateId");

    const parsed = CompareRunsRequestSchema.safeParse({ baselineId, candidateId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters. Both baselineId and candidateId are required." },
        { status: 400 },
      );
    }

    const comparison = await evaluationService.compareRuns(
      parsed.data.baselineId,
      parsed.data.candidateId,
    );

    if (!comparison) {
      return NextResponse.json(
        { error: "One or both specified runs could not be found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    logger.error("Failed to compare evaluation runs", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
