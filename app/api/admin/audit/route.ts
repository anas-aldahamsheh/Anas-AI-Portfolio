import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { auditLogService } from "@/modules/admin/infrastructure/audit-log-service";
import { AuditLogQuerySchema } from "@/modules/admin/domain/audit-log";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      action: searchParams.get("action") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      limit: searchParams.get("limit") || 50,
      offset: searchParams.get("offset") || 0,
    };

    const parseResult = AuditLogQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const [eventsResult, summary] = await Promise.all([
      auditLogService.listEvents(parseResult.data),
      auditLogService.getSummary(),
    ]);

    return NextResponse.json({
      success: true,
      events: eventsResult.events,
      total: eventsResult.total,
      summary,
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
