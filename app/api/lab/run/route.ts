import { NextRequest, NextResponse } from "next/server";
import { aiLabService } from "@/ai/lab";
import { AiLabRunSchema } from "@/ai/contracts/ai-lab";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = AiLabRunSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const result = await aiLabService.executeDemo({
      demoSlug: parseResult.data.demoSlug,
      params: parseResult.data.params,
      locale: parseResult.data.locale,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to execute AI Lab demo", details: message },
      { status: 500 },
    );
  }
}
