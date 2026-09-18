import { z } from "zod";

export const AuditActionSchema = z.enum([
  "role_change",
  "prompt_publish",
  "prompt_rollback",
  "model_assignment",
  "secret_update",
  "secret_delete",
  "cv_publish",
  "content_create",
  "content_update",
  "content_delete",
  "reindex",
  "feature_flag_change",
  "inline_edit",
  "ai_config_change",
  "auth_login",
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditEntityTypeSchema = z.enum([
  "user",
  "prompt",
  "model",
  "ai_provider",
  "secret",
  "cv",
  "page",
  "section",
  "block",
  "project",
  "rag",
  "feature_flag",
  "system",
  "ai_control",
]);

export type AuditEntityType = z.infer<typeof AuditEntityTypeSchema>;

export interface AuditEventRecord {
  id: string;
  userId: string | null;
  userEmail?: string | null | undefined;
  action: string;
  entityType: string;
  entityId: string | null;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const AuditLogQuerySchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;

export interface AuditLogSummary {
  totalEvents: number;
  securityEventsCount: number;
  actionsBreakdown: Record<string, number>;
  entityTypesBreakdown: Record<string, number>;
  recentEvents: AuditEventRecord[];
}

export interface CreateAuditEventInput {
  userId?: string | null | undefined;
  action: string;
  entityType: string;
  entityId?: string | null | undefined;
  previousState?: Record<string, unknown> | null | undefined;
  newState?: Record<string, unknown> | null | undefined;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /key/i,
  /credential/i,
  /authorization/i,
  /auth/i,
  /private/i,
];

/**
 * Recursively redacts sensitive keys from audit state payloads
 * ensuring secrets and credentials are never persisted to the audit trail.
 */
export function sanitizeAuditPayload(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeAuditPayload);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditPayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
