import { NextRequest, NextResponse } from "next/server";
import { conversationModeService } from "@/ai/modes";
import { ResponseLanguage } from "@/ai/contracts";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const localeParam = searchParams.get("locale");
    const locale: ResponseLanguage = localeParam === "ar" ? "ar" : "en";

    const modes = await conversationModeService.listModes(locale);

    return NextResponse.json({
      success: true,
      data: modes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch conversation modes",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
