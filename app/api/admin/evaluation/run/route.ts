import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { RunEvaluationRequestSchema } from "@/ai/contracts/evaluation";
import { evaluationRunner } from "@/ai/evaluation/evaluation-runner";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/evaluation/run
 * Admin-triggered evaluation runner for regression testing and release gate evaluation.
 * Guarded by requireAdmin.
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    const body = await request.json().catch(() => ({}));
    const validated = RunEvaluationRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid evaluation run request",
          issues: validated.error.flatten(),
        },
        { status: 400 },
      );
    }

    logger.info("Admin triggered AI evaluation suite", {
      module: "evaluation_runner",
      metadata: {
        adminUserId: authContext.user.id,
        mode: validated.data.mode,
        datasetId: validated.data.datasetId,
      },
    });

    const executionResult = await evaluationRunner.executeRun(validated.data);

    return NextResponse.json({
      success: true,
      data: executionResult,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }

    logger.error("Failed to execute AI evaluation run", {
      module: "evaluation_runner",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json(
      { error: "Failed to execute evaluation benchmark suite" },
      { status: 500 },
    );
  }
}
