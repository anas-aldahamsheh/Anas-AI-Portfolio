import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export interface RequestContextData {
  requestId: string;
  traceId: string;
  startTime: number;
  userId?: string | undefined;
  route?: string | undefined;
  method?: string | undefined;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  /**
   * Resolves or generates request ID and trace ID from incoming NextRequest headers
   */
  public static fromRequest(request: NextRequest): RequestContextData {
    const requestId =
      request.headers.get("x-request-id") ||
      request.headers.get("request-id") ||
      `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

    const traceId =
      request.headers.get("traceparent") ||
      request.headers.get("x-trace-id") ||
      `trace_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

    const userId = request.headers.get("x-user-id") || undefined;

    return {
      requestId,
      traceId,
      startTime: Date.now(),
      userId,
      route: request.nextUrl.pathname,
      method: request.method,
    };
  }

  /**
   * Runs callback inside the given request context
   */
  public static run<T>(context: RequestContextData, fn: () => T): T {
    return asyncLocalStorage.run(context, fn);
  }

  /**
   * Retrieves active request context or returns empty fallback
   */
  public static current(): RequestContextData | undefined {
    return asyncLocalStorage.getStore();
  }

  /**
   * Injects correlation headers into an outgoing NextResponse
   */
  public static attachHeaders(response: NextResponse, context?: RequestContextData): NextResponse {
    const ctx = context || this.current();
    if (ctx) {
      response.headers.set("X-Request-Id", ctx.requestId);
      response.headers.set("X-Trace-Id", ctx.traceId);
      const duration = Date.now() - ctx.startTime;
      response.headers.set("X-Response-Time", `${duration}ms`);
    }
    return response;
  }
}
