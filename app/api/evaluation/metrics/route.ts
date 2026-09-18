import { NextResponse } from "next/server";
import { evaluationService } from "@/ai/evaluation";
import { logger } from "@/lib/observability/logger";

export async function GET() {
  try {
    const data = await evaluationService.getDashboardData();

    return NextResponse.json(
      {
        success: true,
        data: {
          aggregateMetrics: data.aggregateMetrics,
          methodology: data.methodology,
          languageParity: data.languageParity,
          activeEnvironment: data.activeEnvironment,
          activeBaselineRun: {
            id: data.activeBaselineRun.id,
            datasetName: data.activeBaselineRun.datasetName,
            modelId: data.activeBaselineRun.modelId,
            status: data.activeBaselineRun.status,
            runAt: data.activeBaselineRun.runAt,
            totalCases: data.activeBaselineRun.totalCases,
            passRate: data.activeBaselineRun.passRate,
            averageLatencyMs: data.activeBaselineRun.averageLatencyMs,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    logger.error("Failed to fetch public evaluation metrics", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return NextResponse.json(
      {
        error: "Failed to fetch evaluation metrics",
      },
      { status: 500 },
    );
  }
}
