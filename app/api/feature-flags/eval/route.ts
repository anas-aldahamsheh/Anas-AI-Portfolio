import { NextRequest, NextResponse } from "next/server";
import { featureFlagService } from "@/modules/admin/infrastructure/feature-flag-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get("keys");

    if (!keysParam) {
      return NextResponse.json(
        { error: "Query parameter 'keys' is required (comma-separated)" },
        { status: 400 },
      );
    }

    const keys = keysParam.split(",").map((k) => k.trim()).filter(Boolean);
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const evaluations: Record<string, boolean> = {};
    await Promise.all(
      keys.map(async (key) => {
        evaluations[key] = await featureFlagService.isEnabled(key, { clientIp });
      }),
    );

    return NextResponse.json(
      { success: true, flags: evaluations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
