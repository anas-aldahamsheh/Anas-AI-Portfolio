import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { queryRouter } from "@/ai/router";
import { RouteId, ROUTE_IDS } from "@/ai/contracts/router";
import { z } from "zod";

const RouterTestInputSchema = z.object({
  query: z.string().min(1).max(1000),
  forceRouteId: z.enum(ROUTE_IDS).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const body = await request.json();
    const parsed = RouterTestInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test input", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { query, forceRouteId } = parsed.data;

    const result = await queryRouter.route(query, {
      forceRouteId: forceRouteId as RouteId | undefined,
    });

    return NextResponse.json({
      success: true,
      query,
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
