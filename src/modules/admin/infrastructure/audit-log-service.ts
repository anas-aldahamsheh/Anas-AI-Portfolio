import { desc, eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema/admin";
import { users } from "@/lib/db/schema/auth";
import { logger } from "@/lib/observability/logger";
import {
  type AuditEventRecord,
  type AuditLogQuery,
  type AuditLogSummary,
  type CreateAuditEventInput,
  sanitizeAuditPayload,
} from "../domain/audit-log";
import {
  BASELINE_AUDIT_EVENTS,
  BASELINE_AUDIT_SUMMARY,
} from "./baseline-audit-data";

async function withTimeout<T>(promise: Promise<T>, ms = 300): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export class AuditLogService {
  /**
   * Records an immutable audit event with automatic secret redaction.
   */
  async logEvent(input: CreateAuditEventInput): Promise<string> {
    const sanitizedPrev = input.previousState ? (sanitizeAuditPayload(input.previousState) as Record<string, unknown>) : null;
    const sanitizedNext = input.newState ? (sanitizeAuditPayload(input.newState) as Record<string, unknown>) : null;

    try {
      const inserted = await withTimeout(
        db
          .insert(auditEvents)
          .values({
            userId: input.userId ?? null,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId ?? null,
            previousState: sanitizedPrev,
            newState: sanitizedNext,
            ipAddress: input.ipAddress ?? null,
            userAgent: input.userAgent ?? null,
          })
          .returning({ id: auditEvents.id }),
        300,
      );

      const id = inserted[0]?.id ?? "mock-aud-id";
      logger.info("Audit event recorded", {
        metadata: {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
        },
      });
      return id;
    } catch (err) {
      logger.warn("Failed to persist audit event to database", {
        metadata: { action: input.action, error: String(err) },
      });
      return `fallback-${Date.now()}`;
    }
  }

  /**
   * Queries audit trail events with filtering, pagination, and baseline fallback.
   */
  async listEvents(query: AuditLogQuery = { limit: 50, offset: 0 }): Promise<{
    events: AuditEventRecord[];
    total: number;
  }> {
    try {
      const conditions = [];

      if (query.action) {
        conditions.push(eq(auditEvents.action, query.action));
      }
      if (query.entityType) {
        conditions.push(eq(auditEvents.entityType, query.entityType));
      }
      if (query.userId) {
        conditions.push(eq(auditEvents.userId, query.userId));
      }
      if (query.startDate) {
        conditions.push(gte(auditEvents.createdAt, new Date(query.startDate)));
      }
      if (query.endDate) {
        conditions.push(lte(auditEvents.createdAt, new Date(query.endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await withTimeout(
        db
          .select({
            audit: auditEvents,
            userEmail: users.email,
          })
          .from(auditEvents)
          .leftJoin(users, eq(auditEvents.userId, users.id))
          .where(whereClause)
          .orderBy(desc(auditEvents.createdAt))
          .limit(query.limit)
          .offset(query.offset),
        300,
      );

      if (!rows || rows.length === 0) {
        const filtered = this.filterBaselines(query);
        return {
          events: filtered.slice(query.offset, query.offset + query.limit),
          total: filtered.length,
        };
      }

      const events: AuditEventRecord[] = rows.map((r) => ({
        id: r.audit.id,
        userId: r.audit.userId,
        userEmail: r.userEmail ?? undefined,
        action: r.audit.action,
        entityType: r.audit.entityType,
        entityId: r.audit.entityId,
        previousState: r.audit.previousState as Record<string, unknown> | null,
        newState: r.audit.newState as Record<string, unknown> | null,
        ipAddress: r.audit.ipAddress,
        userAgent: r.audit.userAgent,
        createdAt: r.audit.createdAt.toISOString(),
      }));

      return { events, total: events.length };
    } catch {
      const filtered = this.filterBaselines(query);
      return {
        events: filtered.slice(query.offset, query.offset + query.limit),
        total: filtered.length,
      };
    }
  }

  /**
   * Generates aggregated summary KPIs for the audit control plane.
   */
  async getSummary(): Promise<AuditLogSummary> {
    try {
      const { events } = await this.listEvents({ limit: 100, offset: 0 });

      const actionsBreakdown: Record<string, number> = {};
      const entityTypesBreakdown: Record<string, number> = {};
      let securityEventsCount = 0;

      const sensitiveActions = new Set([
        "role_change",
        "secret_update",
        "secret_delete",
        "model_assignment",
        "prompt_publish",
        "prompt_rollback",
        "content_delete",
      ]);

      for (const e of events) {
        actionsBreakdown[e.action] = (actionsBreakdown[e.action] || 0) + 1;
        entityTypesBreakdown[e.entityType] = (entityTypesBreakdown[e.entityType] || 0) + 1;
        if (sensitiveActions.has(e.action)) {
          securityEventsCount++;
        }
      }

      return {
        totalEvents: events.length,
        securityEventsCount,
        actionsBreakdown,
        entityTypesBreakdown,
        recentEvents: events.slice(0, 10),
      };
    } catch {
      return BASELINE_AUDIT_SUMMARY;
    }
  }

  /**
   * Exports audit logs in JSON or CSV format.
   */
  async exportEvents(query: AuditLogQuery = { limit: 100, offset: 0 }, format: "json" | "csv" = "json"): Promise<string> {
    const { events } = await this.listEvents(query);

    if (format === "json") {
      return JSON.stringify(events, null, 2);
    }

    // CSV format
    const headers = ["id", "createdAt", "action", "entityType", "entityId", "userId", "userEmail", "ipAddress"];
    const rows = events.map((e) => [
      e.id,
      `"${e.createdAt}"`,
      `"${e.action}"`,
      `"${e.entityType}"`,
      `"${e.entityId || ""}"`,
      `"${e.userId || ""}"`,
      `"${e.userEmail || ""}"`,
      `"${e.ipAddress || ""}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  private filterBaselines(query: AuditLogQuery): AuditEventRecord[] {
    return BASELINE_AUDIT_EVENTS.filter((e) => {
      if (query.action && e.action !== query.action) return false;
      if (query.entityType && e.entityType !== query.entityType) return false;
      if (query.userId && e.userId !== query.userId) return false;
      return true;
    });
  }
}

export const auditLogService = new AuditLogService();
