import { NextRequest, NextResponse } from "next/server";
import { jobFitService } from "@/ai/job-fit/job-fit-service";
import { JobFitRequestSchema } from "@/ai/contracts/job-fit";
import { logger } from "@/lib/observability/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = JobFitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid job description request payload",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const result = await jobFitService.analyze(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Job fit analysis route error", {
      module: "api_job_fit",
      metadata: { error: String(error) },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while analyzing job alignment",
      },
      { status: 500 },
    );
  }
}
