export interface LatencyPercentiles {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p99: number;
}

export interface MetricsSnapshot {
  totalRequests: number;
  requestsByStatus: Record<string, number>;
  requestsByRoute: Record<string, number>;
  httpLatency: LatencyPercentiles;
  aiStageLatencies: Record<string, LatencyPercentiles>;
  errorCounts: Record<string, number>;
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
  };
  uptimeSeconds: number;
}

function calculatePercentiles(values: number[]): LatencyPercentiles {
  if (values.length === 0) {
    return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p90: 0, p99: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = Number((sum / sorted.length).toFixed(2));

  const getPercentile = (p: number) => {
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx] ?? 0;
  };

  return {
    count: sorted.length,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    avg,
    p50: getPercentile(50),
    p90: getPercentile(90),
    p99: getPercentile(99),
  };
}

export class MetricsCollector {
  private httpRequests = new Map<string, number>();
  private httpDurations: number[] = [];
  private aiStageDurations = new Map<string, number[]>();
  private errors = new Map<string, number>();
  private readonly startTime = Date.now();
  private readonly MAX_DURATION_SAMPLES = 1000;

  /**
   * Records an incoming HTTP request execution
   */
  public recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ): void {
    const statusKey = `${Math.floor(statusCode / 100)}xx`;
    this.httpRequests.set(statusKey, (this.httpRequests.get(statusKey) || 0) + 1);

    const routeKey = `${method} ${route}`;
    this.httpRequests.set(routeKey, (this.httpRequests.get(routeKey) || 0) + 1);

    this.httpDurations.push(durationMs);
    if (this.httpDurations.length > this.MAX_DURATION_SAMPLES) {
      this.httpDurations.shift();
    }
  }

  /**
   * Records an AI pipeline execution duration
   */
  public recordAiTiming(stage: string, durationMs: number): void {
    let samples = this.aiStageDurations.get(stage);
    if (!samples) {
      samples = [];
      this.aiStageDurations.set(stage, samples);
    }
    samples.push(durationMs);
    if (samples.length > this.MAX_DURATION_SAMPLES) {
      samples.shift();
    }
  }

  /**
   * Records an error event
   */
  public recordError(code: string, module = "general"): void {
    const key = `${module}:${code}`;
    this.errors.set(key, (this.errors.get(key) || 0) + 1);
  }

  /**
   * Generates a telemetry snapshot
   */
  public getMetricsSnapshot(): MetricsSnapshot {
    const requestsByStatus: Record<string, number> = {};
    const requestsByRoute: Record<string, number> = {};

    let total = 0;
    for (const [key, count] of this.httpRequests.entries()) {
      if (key.endsWith("xx")) {
        requestsByStatus[key] = count;
        total += count;
      } else {
        requestsByRoute[key] = count;
      }
    }

    const aiStageLatencies: Record<string, LatencyPercentiles> = {};
    for (const [stage, samples] of this.aiStageDurations.entries()) {
      aiStageLatencies[stage] = calculatePercentiles(samples);
    }

    const errorCounts: Record<string, number> = {};
    for (const [key, count] of this.errors.entries()) {
      errorCounts[key] = count;
    }

    const mem = process.memoryUsage ? process.memoryUsage() : { rss: 0, heapTotal: 0, heapUsed: 0 };

    return {
      totalRequests: total,
      requestsByStatus,
      requestsByRoute,
      httpLatency: calculatePercentiles(this.httpDurations),
      aiStageLatencies,
      errorCounts,
      memory: {
        rssMb: Number((mem.rss / (1024 * 1024)).toFixed(2)),
        heapTotalMb: Number((mem.heapTotal / (1024 * 1024)).toFixed(2)),
        heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
      },
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Serializes metrics into standard Prometheus exposition format (text/plain)
   */
  public toPrometheusFormat(): string {
    const snapshot = this.getMetricsSnapshot();
    const lines: string[] = [
      "# HELP http_requests_total Total number of HTTP requests processed",
      "# TYPE http_requests_total counter",
    ];

    for (const [status, count] of Object.entries(snapshot.requestsByStatus)) {
      lines.push(`http_requests_total{status="${status}"} ${count}`);
    }

    lines.push(
      "",
      "# HELP http_request_duration_ms_avg Average HTTP latency in milliseconds",
      "# TYPE http_request_duration_ms_avg gauge",
      `http_request_duration_ms_avg ${snapshot.httpLatency.avg}`,
      `http_request_duration_ms_p50 ${snapshot.httpLatency.p50}`,
      `http_request_duration_ms_p90 ${snapshot.httpLatency.p90}`,
      `http_request_duration_ms_p99 ${snapshot.httpLatency.p99}`,
    );

    lines.push(
      "",
      "# HELP nodejs_heap_used_bytes Used heap memory in bytes",
      "# TYPE nodejs_heap_used_bytes gauge",
      `nodejs_heap_used_bytes ${Math.round(snapshot.memory.heapUsedMb * 1024 * 1024)}`,
      `nodejs_uptime_seconds ${snapshot.uptimeSeconds}`,
    );

    return lines.join("\n") + "\n";
  }

  /**
   * Resets collected metrics (useful for isolated tests)
   */
  public reset(): void {
    this.httpRequests.clear();
    this.httpDurations = [];
    this.aiStageDurations.clear();
    this.errors.clear();
  }
}

export const metrics = new MetricsCollector();
