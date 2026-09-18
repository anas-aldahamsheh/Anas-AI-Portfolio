import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import type { AiCapability } from "@/ai/contracts/provider-registry";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const testCapabilitySchema = z.object({
  capability: z.enum([
    "generation",
    "embedding",
    "reranking",
    "router",
    "rewrite",
    "evaluator",
  ] as const),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request.headers);
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = testCapabilitySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const testResult = await modelRegistryService.testModelCapability(
      id,
      parseResult.data.capability as AiCapability,
    );

    return NextResponse.json({ testResult });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
