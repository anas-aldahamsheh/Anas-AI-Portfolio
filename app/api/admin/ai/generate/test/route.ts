import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { groundedGenerator } from "@/ai/generation";
import { AdminGenerationTestSchema } from "@/ai/contracts/generation";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const body = await request.json();
    const parsed = AdminGenerationTestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test input", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const {
      userMessage,
      contextChunks,
      responseLanguage,
      conversationMode,
      conversationSummary,
      options,
    } = parsed.data;

    const answer = await groundedGenerator.generate(
      {
        userMessage,
        contextChunks,
        responseLanguage,
        conversationMode,
        conversationSummary,
        options,
      },
      options,
    );

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Grounded generation execution error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
