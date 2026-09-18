import { NextResponse } from "next/server";
import { healthService } from "@/lib/health/health-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await healthService.getReadiness();
  const statusCode = readiness.status === "unready" ? 503 : 200;

  return NextResponse.json(readiness, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
