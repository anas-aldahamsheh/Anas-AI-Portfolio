import { NextRequest, NextResponse } from "next/server";
import { jobFitService } from "@/ai/job-fit/job-fit-service";
import { JobFitRequestSchema } from "@/ai/contracts/job-fit";
import { logger } from "@/lib/observability/logger";
import { applyRateLimit, rateLimiter } from "@/lib/security/rate-limiter";

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "job_fit");
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

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

    const response = NextResponse.json({
      success: true,
      data: result,
    });
    return rateLimiter.attachHeaders(response, rateLimit.result);
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
