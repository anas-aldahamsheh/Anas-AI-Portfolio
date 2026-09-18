"use client";

import { useState } from "react";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EvaluationDashboardData, MetricCategory } from "@/ai/contracts/evaluation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface EvaluationDashboardProps {
  initialData: EvaluationDashboardData;
}

export function EvaluationDashboard({ initialData }: EvaluationDashboardProps) {
  const { t, dir } = useLocalization();
  const [activeTab, setActiveTab] = useState<"metrics" | "methodology" | "benchmarks">("metrics");
  const [categoryFilter, setCategoryFilter] = useState<MetricCategory | "all">("all");

  const filteredMetrics = initialData.aggregateMetrics.filter(
    (m) => categoryFilter === "all" || m.category === categoryFilter,
  );

  return (
    <div className="space-y-8" dir={dir} data-testid="evaluation-dashboard-container">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl text-lg">
              📊
            </span>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {t("eval.title")}
            </h1>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {initialData.activeBaselineRun.datasetName}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
          {t("eval.subtitle")}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-border flex border-b" data-testid="eval-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("metrics")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "metrics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-testid="eval-tab-metrics"
        >
          {t("eval.tab.metrics")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("methodology")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "methodology"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-testid="eval-tab-methodology"
        >
          {t("eval.tab.methodology")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("benchmarks")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "benchmarks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-testid="eval-tab-benchmarks"
        >
          {t("eval.tab.benchmarks")}
        </button>
      </div>

      {/* TAB 1: Aggregate Metrics */}
      {activeTab === "metrics" && (
        <div className="space-y-6" data-testid="eval-metrics-view">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "retrieval", "generation", "latency", "parity"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredMetrics.map((metric) => {
              const percentValue =
                metric.unit === "%"
                  ? Math.round(metric.value * 100)
                  : metric.unit === "ms"
                    ? Math.round(metric.value)
                    : Math.round(metric.value * 100);

              const barPercent =
                metric.unit === "ms"
                  ? Math.min(100, Math.max(10, Math.round((metric.value / metric.targetThreshold) * 100)))
                  : Math.min(100, Math.max(10, percentValue));

              return (
                <Card
                  key={metric.id}
                  className="border-border/70 bg-card/60 flex flex-col justify-between backdrop-blur-xs transition-shadow hover:shadow-md"
                  data-testid={`metric-card-${metric.id}`}
                >
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase">
                        {metric.category}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          metric.status === "passed"
                            ? "bg-emerald-500"
                            : metric.status === "warning"
                              ? "bg-amber-500"
                              : "bg-destructive"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-foreground text-sm font-semibold line-clamp-1">
                      {metric.label}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
                        {metric.formattedValue}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Target:{" "}
                        <span className="font-mono font-medium">
                          {metric.unit === "%"
                            ? `${Math.round(metric.targetThreshold * 100)}%`
                            : metric.unit === "ms"
                              ? `<=${metric.targetThreshold}ms`
                              : `>=${metric.targetThreshold}`}
                        </span>
                      </span>
                    </div>

                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metric.status === "passed"
                            ? "bg-emerald-500"
                            : metric.status === "warning"
                              ? "bg-amber-500"
                              : "bg-destructive"
                        }`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>

                    <CardDescription className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                      {metric.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bilingual Parity Highlight Card */}
          <Card className="border-border bg-muted/20">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">
                  {t("eval.parity.title")}
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                  {t("eval.parity.balanced")}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {t("eval.parity.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-background/80 rounded-xl border border-border/60 p-3 text-center">
                  <div className="text-muted-foreground text-xs font-medium">Arabic Score</div>
                  <div className="text-foreground mt-1 font-mono text-xl font-bold">
                    {(initialData.languageParity.arabicScore * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-background/80 rounded-xl border border-border/60 p-3 text-center">
                  <div className="text-muted-foreground text-xs font-medium">English Score</div>
                  <div className="text-foreground mt-1 font-mono text-xl font-bold">
                    {(initialData.languageParity.englishScore * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-background/80 rounded-xl border border-border/60 p-3 text-center">
                  <div className="text-muted-foreground text-xs font-medium">Parity Ratio</div>
                  <div className="text-emerald-600 dark:text-emerald-400 mt-1 font-mono text-xl font-bold">
                    {(initialData.languageParity.parityRatio * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Methodology & Golden Datasets */}
      {activeTab === "methodology" && (
        <div className="space-y-6" data-testid="eval-methodology-view">
          {/* Principles */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
              Evaluation Engineering Principles
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {initialData.methodology.principles.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-card border-border/70 rounded-xl border p-4 space-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-foreground font-semibold">Principle #{idx + 1}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ps-7">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Datasets Specifications */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
              Benchmark Golden Datasets
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {initialData.methodology.datasetSpecs.map((ds, idx) => (
                <Card key={idx} className="border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-foreground text-sm font-semibold">
                      {ds.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {ds.casesCount} Test Cases
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2 text-xs">
                    <div className="text-muted-foreground text-[11px]">
                      <span className="font-semibold text-foreground">Languages:</span>{" "}
                      {ds.languages.join(", ")}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{ds.focus}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Release Quality Gates */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
              Automated Release Gates
            </h3>
            <div className="bg-muted/30 border-border/70 space-y-2 rounded-xl border p-4 text-xs">
              {initialData.methodology.evaluationGates.map((gate, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-muted-foreground">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="text-foreground font-medium">{gate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Benchmark Runs & Ablation Comparisons */}
      {activeTab === "benchmarks" && (
        <div className="space-y-6" data-testid="eval-benchmarks-view">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
                {t("eval.runs.title")}
              </h3>
              <span className="text-muted-foreground text-xs">
                Comparing Active Production vs Ablation Experiments
              </span>
            </div>

            <div className="space-y-3">
              {initialData.recentRuns.map((run) => (
                <Card
                  key={run.id}
                  className="border-border hover:bg-muted/10 transition-colors"
                  data-testid={`benchmark-run-${run.id}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CardTitle className="text-foreground truncate text-sm font-semibold">
                          {run.datasetName}
                        </CardTitle>
                        {run.id === initialData.activeBaselineRun.id && (
                          <Badge className="bg-primary text-primary-foreground text-[10px]">
                            {t("eval.runs.baseline")}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">
                        Commit: {run.gitCommit || "active"}
                      </span>
                    </div>
                    <CardDescription className="text-xs font-mono">
                      Model: {run.modelId} • Prompt: {run.promptVersion}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px]">
                      <div className="bg-muted/40 rounded p-2">
                        <div className="text-muted-foreground text-[10px]">Pass Rate</div>
                        <div className="text-foreground font-bold">
                          {(run.passRate * 100).toFixed(1)}% ({run.passedCases}/{run.totalCases})
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded p-2">
                        <div className="text-muted-foreground text-[10px]">Faithfulness</div>
                        <div className="text-foreground font-bold">
                          {(run.metrics.faithfulness * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded p-2">
                        <div className="text-muted-foreground text-[10px]">Recall@5</div>
                        <div className="text-foreground font-bold">
                          {(run.metrics.recallAt5 * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded p-2">
                        <div className="text-muted-foreground text-[10px]">Average Latency</div>
                        <div className="text-foreground font-bold">
                          {run.averageLatencyMs} ms
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Measured Values Transparency Pledge */}
      <div className="bg-muted/20 border-border/60 rounded-xl border p-4 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <span>🔒</span>
          <span>{t("eval.pledge.title")}</span>
        </div>
        <p className="leading-relaxed">{t("eval.pledge.desc")}</p>
      </div>
    </div>
  );
}
