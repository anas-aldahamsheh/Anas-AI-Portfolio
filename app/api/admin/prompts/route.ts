import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { promptService } from "@/ai/prompts";
import { CreatePromptVersionSchema } from "@/ai/contracts/prompt-registry";
import { z } from "zod";

const CreatePromptRequestSchema = CreatePromptVersionSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters").max(64),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const prompts = await promptService.listPrompts();
    return NextResponse.json({ prompts });
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

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = CreatePromptRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { slug, ...versionInput } = parseResult.data;
    const version = await promptService.createVersion(slug, versionInput, authContext.user.id);

    return NextResponse.json({ success: true, version }, { status: 201 });
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
