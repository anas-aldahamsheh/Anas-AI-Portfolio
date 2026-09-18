import { NextResponse } from "next/server";
import { healthService } from "@/lib/health/health-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const liveness = healthService.getLiveness();

  return NextResponse.json(liveness, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
