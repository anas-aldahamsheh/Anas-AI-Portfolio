import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { conversationModeService } from "@/ai/modes";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const configs = await conversationModeService.getAllConfigs();
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 },
    );
  }
}
