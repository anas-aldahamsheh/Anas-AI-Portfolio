import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { contextBuilder } from "@/ai/context";
import { ContextBuilderTestInputSchema } from "@/ai/contracts/context-builder";
import { ScoredCandidate } from "@/ai/contracts/retrieval";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const body = await request.json();
    const parsed = ContextBuilderTestInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test input", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { candidates, options } = parsed.data;

    const scoredCandidates: ScoredCandidate[] = candidates.map((c, idx) => ({
      id: c.id,
      documentId: c.documentId,
      citationId: c.citationId,
      content: c.content,
      score: c.score,
      sourceType: c.sourceType,
      sourceId: c.sourceId,
      title: c.title,
      locale: c.locale,
      headingHierarchy: c.headingHierarchy,
      tags: c.tags,
      sectionScope: c.sectionScope,
      retrieverType: "hybrid",
      rank: idx + 1,
    }));

    const result = await contextBuilder.buildContext(scoredCandidates, options);

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
      {
        error: "Context builder execution error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
