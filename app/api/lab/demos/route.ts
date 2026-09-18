import { NextRequest, NextResponse } from "next/server";
import { aiLabService } from "@/ai/lab";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";

    const demos = await aiLabService.listDemos({
      publishedOnly: true,
      locale,
    });

    return NextResponse.json({
      success: true,
      data: demos,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load AI Lab demos", details: String(error) },
      { status: 500 },
    );
  }
}
