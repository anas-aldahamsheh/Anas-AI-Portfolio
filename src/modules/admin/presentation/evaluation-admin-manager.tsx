"use client";

import { useState } from "react";
import {
  EvaluationDashboardData,
  EvaluationRunSummary,
  RegressionComparison,
} from "@/ai/contracts/evaluation";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface EvaluationAdminManagerProps {
  initialData: EvaluationDashboardData;
}

export function EvaluationAdminManager({ initialData }: EvaluationAdminManagerProps) {
  const { t, dir } = useLocalization();

  const [runs] = useState<EvaluationRunSummary[]>(initialData.recentRuns);
  const [baselineId, setBaselineId] = useState<string>(
    initialData.activeBaselineRun.id || runs[0]?.id || "",
  );
  const [candidateId, setCandidateId] = useState<string>(
    runs[1]?.id || runs[0]?.id || "",
  );
  const [comparison, setComparison] = useState<RegressionComparison | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!baselineId || !candidateId) return;

    setIsComparing(true);
    setCompareError(null);

    try {
      const res = await fetch(
        `/api/admin/evaluation/compare?baselineId=${encodeURIComponent(
          baselineId,
        )}&candidateId=${encodeURIComponent(candidateId)}`,
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        setCompareError(json.error || "Failed to execute regression comparison");
      } else {
        setComparison(json.data);
      }
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : "Comparison network error");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8" dir={dir} data-testid="evaluation-admin-manager">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {t("eval.admin.title")}
          </h1>
          <Badge variant="outline" className="font-mono text-xs">
            Admin Plane
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Manage dataset regression gates, compare candidate pipelines against active baselines, and inspect failure categories.
        </p>
      </div>

      {/* Active Environment Overview Card */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-foreground text-sm font-semibold">
            Active Runtime AI Environment
          </CardTitle>
          <CardDescription className="text-xs">
            Current models and policies configured across the portfolio pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">Generation</div>
              <div className="text-foreground font-bold mt-0.5 truncate" title={initialData.activeEnvironment.generationModel}>
                {initialData.activeEnvironment.generationModel}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">Embedding</div>
              <div className="text-foreground font-bold mt-0.5 truncate" title={initialData.activeEnvironment.embeddingModel}>
                {initialData.activeEnvironment.embeddingModel}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">Reranker</div>
              <div className="text-foreground font-bold mt-0.5 truncate" title={initialData.activeEnvironment.rerankerModel}>
                {initialData.activeEnvironment.rerankerModel}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">Retrieval Fusion</div>
              <div className="text-foreground font-bold mt-0.5 truncate" title={initialData.activeEnvironment.retrievalPolicy}>
                {initialData.activeEnvironment.retrievalPolicy}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regression Comparison Section */}
      <Card className="border-border" data-testid="regression-comparator-card">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-sm font-semibold">
              {t("eval.admin.compare.title")}
            </CardTitle>
            <span className="text-muted-foreground text-xs">
              Detect regressions before activating pipeline changes
            </span>
          </div>
          <CardDescription className="text-xs">
            Select a baseline run (reference) and candidate run (new model/prompt/reranker) to inspect delta changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-muted-foreground text-xs font-medium">
                Baseline Run (Reference)
              </label>
              <select
                value={baselineId}
                onChange={(e) => setBaselineId(e.target.value)}
                className="bg-background border-border text-foreground w-full rounded-md border px-3 py-2 text-xs focus:outline-none"
                data-testid="select-baseline-run"
              >
                {runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.datasetName} ({r.modelId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-muted-foreground text-xs font-medium">
                Candidate Run (Under Test)
              </label>
              <select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="bg-background border-border text-foreground w-full rounded-md border px-3 py-2 text-xs focus:outline-none"
                data-testid="select-candidate-run"
              >
                {runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.datasetName} ({r.modelId})
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              onClick={handleCompare}
              disabled={isComparing || !baselineId || !candidateId}
              data-testid="compare-runs-btn"
            >
              {isComparing ? "Comparing..." : "Compare Runs"}
            </Button>
          </div>

          {compareError && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-3 text-xs">
              {compareError}
            </div>
          )}

          {comparison && (
            <div className="space-y-4 border-t border-border pt-4" data-testid="comparison-results">
              {/* Regression Decision Banner */}
              <div
                className={`flex items-center justify-between rounded-lg border p-3 text-xs ${
                  comparison.hasRegression
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                }`}
                data-testid="comparison-banner"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <span>{comparison.hasRegression ? "⚠️" : "✅"}</span>
                  <span>
                    {comparison.hasRegression
                      ? t("eval.admin.compare.has_regression")
                      : t("eval.admin.compare.no_regression")}
                  </span>
                </div>
                <div className="font-mono text-[11px]">
                  Regressions: {comparison.regressionCount} • Improvements: {comparison.improvementCount}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground text-[11px]">
                      <th className="p-2 text-start font-medium">Metric</th>
                      <th className="p-2 text-start font-medium">Baseline</th>
                      <th className="p-2 text-start font-medium">Candidate</th>
                      <th className="p-2 text-start font-medium">Delta</th>
                      <th className="p-2 text-start font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparison.deltas).map(([key, delta]) => {
                      const isLatency = key === "averageLatencyMs";
                      const formatVal = (val: number) =>
                        isLatency ? `${val}ms` : `${(val * 100).toFixed(1)}%`;

                      return (
                        <tr
                          key={key}
                          className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                          data-testid={`delta-row-${key}`}
                        >
                          <td className="p-2 font-medium capitalize text-foreground">
                            {key.replace(/([A-Z])/g, " $1")}
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {formatVal(delta.baseline)}
                          </td>
                          <td className="p-2 font-bold text-foreground">
                            {formatVal(delta.candidate)}
                          </td>
                          <td
                            className={`p-2 font-bold ${
                              delta.status === "improved"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : delta.status === "regressed"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {delta.delta > 0 ? `+${delta.delta}` : delta.delta}
                          </td>
                          <td className="p-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                delta.status === "improved"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : delta.status === "regressed"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {delta.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measured Evaluation Runs History */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-foreground text-sm font-semibold">
            Evaluation Run History
          </CardTitle>
          <CardDescription className="text-xs">
            Immutable log of regression runs, benchmark passes, and failure category breakdowns
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground text-[11px] font-mono">
                  <th className="p-2 text-start">Dataset & Model</th>
                  <th className="p-2 text-start">Status</th>
                  <th className="p-2 text-start">Pass Rate</th>
                  <th className="p-2 text-start">Latency</th>
                  <th className="p-2 text-start">Faithfulness</th>
                  <th className="p-2 text-start">Recall@5</th>
                  <th className="p-2 text-start">Run Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {runs.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition-colors"
                    data-testid={`admin-run-row-${r.id}`}
                  >
                    <td className="p-2">
                      <div className="font-semibold text-foreground text-xs">{r.datasetName}</div>
                      <div className="text-muted-foreground font-mono text-[10px]">
                        {r.modelId} • {r.promptVersion}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="p-2 font-mono font-bold text-foreground">
                      {(r.passRate * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 font-mono text-muted-foreground">
                      {r.averageLatencyMs}ms
                    </td>
                    <td className="p-2 font-mono text-foreground">
                      {(r.metrics.faithfulness * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 font-mono text-foreground">
                      {(r.metrics.recallAt5 * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 text-muted-foreground text-[11px]">
                      {new Date(r.runAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
