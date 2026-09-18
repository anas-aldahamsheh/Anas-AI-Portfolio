import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { chatOrchestrator } from "@/ai/orchestration/chat-orchestrator";
import { RagDebugRequestSchema } from "@/ai/contracts/rag-debug";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = RagDebugRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { query, mode, locale, projectScopeId } = parseResult.data;

    const result = await chatOrchestrator.processChat({
      message: query,
      conversationMode: mode,
      conversationLocale: locale,
      projectScopeId,
      isAdmin: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        answer: result.answer,
        language: result.language,
        direction: result.direction,
        conversationMode: result.conversationMode,
        citations: result.citations,
        hasInsufficientEvidence: result.hasInsufficientEvidence,
        telemetry: result.telemetry,
      },
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
