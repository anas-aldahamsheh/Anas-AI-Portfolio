import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { secretsService } from "@/lib/security/secrets-service";

interface RouteContext {
  params: Promise<{ key: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request.headers);
    const { key } = await context.params;

    const meta = await secretsService.getSecretMetadata(decodeURIComponent(key));
    if (!meta.exists) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 });
    }

    return NextResponse.json({ secret: meta });
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAdmin(request.headers);
    const { key } = await context.params;

    const success = await secretsService.deleteSecret(decodeURIComponent(key), authContext.user.id);

    return NextResponse.json({ success });
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
