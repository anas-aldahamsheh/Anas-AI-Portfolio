import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { queryRewriter } from "@/ai/query-rewrite";
import { RewriteTestInputSchema } from "@/ai/contracts/query-rewriter";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const body = await request.json();
    const parsed = RewriteTestInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test input", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const {
      userMessage,
      language,
      conversationSummary,
      currentScope,
      route,
      entityHints,
      maxQueries,
      enabled,
    } = parsed.data;

    const result = await queryRewriter.rewrite(
      {
        userMessage,
        language,
        conversationSummary,
        currentScope,
        route,
        entityHints,
      },
      {
        enabled,
        maxQueries,
      },
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
