import { NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request?: Request) {
  try {
    const customHeaders = request?.headers;
    const authContext = await requireAdmin(customHeaders);

    return NextResponse.json({
      status: "authorized",
      role: authContext.role,
      user: {
        id: authContext.user.id,
        email: authContext.user.email,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (
      err instanceof UnauthorizedError ||
      (err instanceof Error && err.name === "UnauthorizedError")
    ) {
      return NextResponse.json(
        { error: "Unauthorized", message: (err as Error).message },
        { status: 401 },
      );
    }

    if (err instanceof ForbiddenError || (err instanceof Error && err.name === "ForbiddenError")) {
      return NextResponse.json(
        { error: "Forbidden", message: (err as Error).message },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Internal Error", message: "Authorization failed" },
      { status: 500 },
    );
  }
}
