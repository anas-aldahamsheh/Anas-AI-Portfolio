import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { hybridRetriever } from "@/ai/retrieval";
import { HybridSearchSchema } from "@/ai/contracts/retrieval";
import { createProjectScopeFilter } from "@/ai/retrieval/filters/filter-builder";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const body = await request.json();
    const parseResult = HybridSearchSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: parseResult.error.format() },
        { status: 400 },
      );
    }

    const {
      query,
      mode,
      locale,
      sourceType,
      sourceId,
      topK,
      rrfK,
      candidateCap,
      minScoreThreshold,
    } = parseResult.data;

    let filter = undefined;
    if (sourceType === "project" && sourceId) {
      filter = createProjectScopeFilter(sourceId, locale);
    } else if (sourceType || sourceId || locale) {
      filter = {
        ...(sourceType ? { sourceType } : {}),
        ...(sourceId ? { sourceId } : {}),
        ...(locale ? { locale } : {}),
      };
    }

    const result = await hybridRetriever.retrieve(
      {
        text: query,
        locale,
        filter,
        topK,
      },
      {
        denseEnabled: mode === "hybrid" || mode === "dense",
        sparseEnabled: mode === "hybrid" || mode === "sparse",
        denseTopK: topK,
        sparseTopK: topK,
        rrfK,
        candidateCap,
        minScoreThreshold,
      },
    );

    return NextResponse.json({
      success: true,
      query,
      mode,
      candidates: result.candidates,
      telemetry: result.telemetry,
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
