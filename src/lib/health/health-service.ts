import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vectorStore } from "@/lib/qdrant/vector-store";
import { cacheService } from "@/lib/cache/cache-service";
import { validateEnv } from "@/lib/config/env";

export interface SubsystemCheckResult {
  status: "up" | "down" | "degraded" | "fallback" | "valid";
  latencyMs: number;
  error?: string | undefined;
}

export interface ReadinessCheckResult {
  status: "ready" | "degraded" | "unready";
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: SubsystemCheckResult;
    vectorStore: SubsystemCheckResult;
    cache: SubsystemCheckResult;
    configuration: SubsystemCheckResult;
  };
}

export interface LivenessCheckResult {
  status: "healthy";
  timestamp: string;
  uptimeSeconds: number;
  memory: {
    rssMb: number;
    heapUsedMb: number;
  };
}

async function withTimeout<T>(promise: Promise<T>, ms = 500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function sanitizeErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  const str = String(err);
  // Redact potential connection string patterns, passwords, keys
  return str
    .replace(/(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@)/gi, "$1[REDACTED]$2")
    .replace(/(bearer\s+)[a-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(key=)[^&\s]+/gi, "$1[REDACTED]");
}

export class HealthService {
  /**
   * Fast process liveness probe
   */
  public getLiveness(): LivenessCheckResult {
    const mem = process.memoryUsage ? process.memoryUsage() : { rss: 0, heapUsed: 0 };
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Number((mem.rss / (1024 * 1024)).toFixed(2)),
        heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
      },
    };
  }

  /**
   * Comprehensive readiness probe checking database, vector store, cache, and config
   */
  public async getReadiness(): Promise<ReadinessCheckResult> {
    // 1. Database Check
    let dbStatus: SubsystemCheckResult = { status: "up", latencyMs: 0 };
    const dbStart = Date.now();
    try {
      await withTimeout(db.execute(sql`SELECT 1`), 500);
      dbStatus = {
        status: "up",
        latencyMs: Date.now() - dbStart,
      };
    } catch (err) {
      dbStatus = {
        status: "degraded",
        latencyMs: Date.now() - dbStart,
        error: sanitizeErrorMessage(err),
      };
    }

    // 2. Vector Store Check
    let vectorStatus: SubsystemCheckResult = { status: "up", latencyMs: 0 };
    const vsStart = Date.now();
    try {
      await withTimeout(vectorStore.getCollectionInfo("portfolio_knowledge"), 500);
      vectorStatus = {
        status: "up",
        latencyMs: Date.now() - vsStart,
      };
    } catch (err) {
      vectorStatus = {
        status: "fallback",
        latencyMs: Date.now() - vsStart,
        error: sanitizeErrorMessage(err),
      };
    }

    // 3. Cache Subsystem Check
    const cacheStart = Date.now();
    cacheService.getStats();
    const cacheStatus: SubsystemCheckResult = {
      status: "up",
      latencyMs: Date.now() - cacheStart,
    };

    // 4. Configuration Check
    const configStart = Date.now();
    let configStatus: SubsystemCheckResult = { status: "valid", latencyMs: 0 };
    try {
      validateEnv();
      configStatus = {
        status: "valid",
        latencyMs: Date.now() - configStart,
      };
    } catch (err) {
      configStatus = {
        status: "down",
        latencyMs: Date.now() - configStart,
        error: sanitizeErrorMessage(err),
      };
    }

    // Determine overall readiness verdict
    const isReady = configStatus.status === "valid";
    const hasDegradation = dbStatus.status !== "up" || vectorStatus.status === "fallback";

    const overallStatus: "ready" | "degraded" | "unready" = !isReady
      ? "unready"
      : hasDegradation
        ? "degraded"
        : "ready";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks: {
        database: dbStatus,
        vectorStore: vectorStatus,
        cache: cacheStatus,
        configuration: configStatus,
      },
    };
  }
}

export const healthService = new HealthService();
