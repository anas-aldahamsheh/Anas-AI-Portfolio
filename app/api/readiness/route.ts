import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verify core configuration is valid
    validateEnv();

    return NextResponse.json(
      {
        status: "ready",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service not ready";
    return NextResponse.json(
      {
        status: "unready",
        timestamp: new Date().toISOString(),
        error: message,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
