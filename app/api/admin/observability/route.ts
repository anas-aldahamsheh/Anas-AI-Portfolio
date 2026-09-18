import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/infrastructure/server-auth";
import { metrics } from "@/lib/observability/metrics";
import { tracer } from "@/lib/observability/tracer";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
  } catch (err: unknown) {
    const error = err as { status?: number; statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.status || error.statusCode || 401 },
    );
  }

  return NextResponse.json({
    success: true,
    metrics: metrics.getMetricsSnapshot(),
    recentSpans: tracer.getRecentSpans(),
  });
}
