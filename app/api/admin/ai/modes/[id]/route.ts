import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { conversationModeService } from "@/ai/modes";
import { updateConversationModeSchema } from "@/ai/contracts";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await requireAdmin(request.headers);
    const params = await props.params;
    const modeId = params.id;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = updateConversationModeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await conversationModeService.updateMode(
      modeId,
      parseResult.data,
      authContext.user.id,
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
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
