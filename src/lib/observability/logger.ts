export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  module?: string | undefined;
  requestId?: string | undefined;
  userId?: string | undefined;
  errorCode?: string | undefined;
  latencyMs?: number | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface StructuredLogEntry {
  timestamp: string;
  severity: LogLevel;
  event: string;
  module?: string | undefined;
  requestId?: string | undefined;
  userId?: string | undefined;
  errorCode?: string | undefined;
  latencyMs?: number | undefined;
  metadata?: Record<string, unknown> | undefined;
}

const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getMinLogLevel(): LogLevel {
  const envLevel = process.env["LOG_LEVEL"]?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVEL_PRIORITIES) {
    return envLevel;
  }
  return "info";
}

function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLogLevel();
  return LOG_LEVEL_PRIORITIES[level] >= LOG_LEVEL_PRIORITIES[minLevel];
}

function sanitizeMetadata(
  metadata?: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ["password", "secret", "token", "apikey", "key", "authorization", "cookie"];

  for (const [key, value] of Object.entries(metadata)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function emit(severity: LogLevel, event: string, context?: LogContext): void {
  if (!shouldLog(severity)) return;

  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    severity,
    event,
    module: context?.module,
    requestId: context?.requestId,
    userId: context?.userId,
    errorCode: context?.errorCode,
    latencyMs: context?.latencyMs,
    metadata: sanitizeMetadata(context?.metadata),
  };

  const line = JSON.stringify(entry);

  switch (severity) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.info(line);
      break;
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => emit("debug", event, context),
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => emit("error", event, context),
  createChild: (defaultContext: LogContext) => ({
    debug: (event: string, context?: LogContext) =>
      emit("debug", event, {
        ...defaultContext,
        ...context,
        metadata: { ...defaultContext.metadata, ...context?.metadata },
      }),
    info: (event: string, context?: LogContext) =>
      emit("info", event, {
        ...defaultContext,
        ...context,
        metadata: { ...defaultContext.metadata, ...context?.metadata },
      }),
    warn: (event: string, context?: LogContext) =>
      emit("warn", event, {
        ...defaultContext,
        ...context,
        metadata: { ...defaultContext.metadata, ...context?.metadata },
      }),
    error: (event: string, context?: LogContext) =>
      emit("error", event, {
        ...defaultContext,
        ...context,
        metadata: { ...defaultContext.metadata, ...context?.metadata },
      }),
  }),
};
