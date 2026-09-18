import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { secretsService } from "@/lib/security/secrets-service";

const setSecretSchema = z.object({
  key: z.string().min(2, "Key must be at least 2 characters").max(128),
  value: z.string().min(1, "Secret value cannot be empty").max(4096),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || undefined;

    const secrets = await secretsService.listSecretMetadata(prefix);
    return NextResponse.json({ secrets });
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
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = setSecretSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const meta = await secretsService.setSecret(
      parseResult.data.key,
      parseResult.data.value,
      authContext.user.id,
    );

    // Return display-safe metadata ONLY (never return the plaintext secret)
    return NextResponse.json({ secret: meta }, { status: 200 });
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
