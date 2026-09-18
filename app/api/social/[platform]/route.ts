import { NextRequest, NextResponse } from "next/server";
import { socialService } from "@/modules/social/infrastructure/social-service";
import type { SocialPlatform } from "@/modules/social/domain/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { platform } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";

    const profile = await socialService.getProfile(platform as SocialPlatform, locale);

    return NextResponse.json({ success: true, profile });
  } catch {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }
}
