import { randomUUID } from "node:crypto";
import { RequestContext } from "./request-context";
import { logger } from "./logger";

export interface SpanRecord {
  id: string;
  name: string;
  traceId: string;
  durationMs: number;
  status: "OK" | "ERROR";
  attributes?: Record<string, unknown> | undefined;
  timestamp: string;
}

export interface SpanContext {
  id: string;
  name: string;
  traceId: string;
  setAttribute(key: string, value: unknown): void;
}

export class Tracer {
  private recentSpans: SpanRecord[] = [];
  private readonly MAX_SPANS = 50;

  /**
   * Executes callback within a traced span, measuring duration and recording attributes
   */
  public async traceSpan<T>(
    name: string,
    fn: (span: SpanContext) => Promise<T> | T,
    initialAttributes?: Record<string, unknown>,
  ): Promise<T> {
    const id = `span_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const reqCtx = RequestContext.current();
    const traceId = reqCtx?.traceId || `trace_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

    const attributes: Record<string, unknown> = {
      ...(initialAttributes || {}),
      ...(reqCtx?.route ? { route: reqCtx.route } : {}),
      ...(reqCtx?.method ? { method: reqCtx.method } : {}),
    };

    const spanContext: SpanContext = {
      id,
      name,
      traceId,
      setAttribute: (key: string, value: unknown) => {
        attributes[key] = value;
      },
    };

    const start = Date.now();
    let status: "OK" | "ERROR" = "OK";

    try {
      return await fn(spanContext);
    } catch (err) {
      status = "ERROR";
      attributes["error"] = String(err);
      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const record: SpanRecord = {
        id,
        name,
        traceId,
        durationMs,
        status,
        attributes,
        timestamp: new Date().toISOString(),
      };

      this.recentSpans.unshift(record);
      if (this.recentSpans.length > this.MAX_SPANS) {
        this.recentSpans.pop();
      }

      logger.debug(`[trace] ${name} completed in ${durationMs}ms`, {
        module: "tracer",
        metadata: { spanId: id, traceId, durationMs, status },
      });
    }
  }

  /**
   * Retrieves recent recorded spans (bounded ring buffer)
   */
  public getRecentSpans(): SpanRecord[] {
    return [...this.recentSpans];
  }

  /**
   * Clears trace history (for testing)
   */
  public clear(): void {
    this.recentSpans = [];
  }
}

export const tracer = new Tracer();
