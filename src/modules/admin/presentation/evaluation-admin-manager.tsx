"use client";

import { useState } from "react";
import {
  EvaluationDashboardData,
  EvaluationRunSummary,
  RegressionComparison,
  EvaluationRunExecutionResponse,
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

  const [runs, setRuns] = useState<EvaluationRunSummary[]>(initialData.recentRuns);
  const [baselineId, setBaselineId] = useState<string>(
    initialData.activeBaselineRun.id || runs[0]?.id || "",
  );
  const [candidateId, setCandidateId] = useState<string>(runs[1]?.id || runs[0]?.id || "");
  const [comparison, setComparison] = useState<RegressionComparison | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // F038 Evaluation Runner State
  const [runnerMode, setRunnerMode] = useState<"full" | "retrieval" | "generation">("full");
  const [isRunning, setIsRunning] = useState(false);
  const [runnerResult, setRunnerResult] = useState<EvaluationRunExecutionResponse | null>(null);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [showCaseResults, setShowCaseResults] = useState(false);

  const handleRunSuite = async () => {
    setIsRunning(true);
    setRunnerError(null);

    try {
      const res = await fetch("/api/admin/evaluation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: runnerMode }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setRunnerError(json.error || "Failed to execute evaluation suite");
      } else {
        setRunnerResult(json.data);
        if (json.data.run) {
          setRuns((prev) => [json.data.run, ...prev]);
          setCandidateId(json.data.run.id);
        }
      }
    } catch (err) {
      setRunnerError(err instanceof Error ? err.message : "Runner network error");
    } finally {
      setIsRunning(false);
    }
  };

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
          Manage dataset regression gates, compare candidate pipelines against active baselines, and
          inspect failure categories.
        </p>
      </div>

      {/* Active Environment Overview Card */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-foreground text-sm font-semibold">
            {t("eval.admin.env.title") !== "eval.admin.env.title"
              ? t("eval.admin.env.title")
              : "Active Runtime AI Environment"}
          </CardTitle>
          <CardDescription className="text-xs">
            Active production models and policies currently serving portfolio requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">
                {t("eval.admin.env.generation") !== "eval.admin.env.generation"
                  ? t("eval.admin.env.generation")
                  : "Generation"}
              </span>
              <p className="text-foreground text-xs font-medium">
                {initialData.activeEnvironment.generationModel}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">
                {t("eval.admin.env.embedding") !== "eval.admin.env.embedding"
                  ? t("eval.admin.env.embedding")
                  : "Embedding"}
              </span>
              <p className="text-foreground text-xs font-medium">
                {initialData.activeEnvironment.embeddingModel}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">
                {t("eval.admin.env.reranker") !== "eval.admin.env.reranker"
                  ? t("eval.admin.env.reranker")
                  : "Reranker"}
              </span>
              <p className="text-foreground text-xs font-medium">
                {initialData.activeEnvironment.rerankerModel}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">
                {t("eval.admin.env.retrieval_policy") !== "eval.admin.env.retrieval_policy"
                  ? t("eval.admin.env.retrieval_policy")
                  : "Retrieval Policy"}
              </span>
              <p className="text-foreground text-xs font-medium">
                {initialData.activeEnvironment.retrievalPolicy}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* F038: AI Evaluation Runner & Release Gate Card */}
      <Card className="border-border" data-testid="evaluation-runner-card">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-sm font-semibold">
              {t("eval.runner.title") !== "eval.runner.title"
                ? t("eval.runner.title")
                : "AI Evaluation Runner & Regression Gate"}
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              F038 Engine
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {t("eval.runner.desc") !== "eval.runner.desc"
              ? t("eval.runner.desc")
              : "Execute automated benchmark test suites evaluating retrieval, generation, and safety gates."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-muted-foreground text-xs font-medium">
                {t("eval.runner.mode.label") !== "eval.runner.mode.label"
                  ? t("eval.runner.mode.label")
                  : "Evaluation Mode:"}
              </label>
              <select
                value={runnerMode}
                onChange={(e) =>
                  setRunnerMode(e.target.value as "full" | "retrieval" | "generation")
                }
                className="bg-background border-border text-foreground w-full rounded-md border px-3 py-2 text-xs focus:outline-none"
                data-testid="select-runner-mode"
                disabled={isRunning}
              >
                <option value="full">
                  {t("eval.runner.mode.full") !== "eval.runner.mode.full"
                    ? t("eval.runner.mode.full")
                    : "Full Suite (Retrieval + Generation + Safety)"}
                </option>
                <option value="retrieval">
                  {t("eval.runner.mode.retrieval") !== "eval.runner.mode.retrieval"
                    ? t("eval.runner.mode.retrieval")
                    : "Retrieval Only"}
                </option>
                <option value="generation">
                  {t("eval.runner.mode.generation") !== "eval.runner.mode.generation"
                    ? t("eval.runner.mode.generation")
                    : "Generation & Safety"}
                </option>
              </select>
            </div>

            <Button
              onClick={handleRunSuite}
              disabled={isRunning}
              className="px-5 text-xs font-semibold"
              data-testid="btn-trigger-eval-runner"
            >
              {isRunning
                ? t("eval.runner.running") !== "eval.runner.running"
                  ? t("eval.runner.running")
                  : "Running Benchmark Suite..."
                : t("eval.runner.trigger") !== "eval.runner.trigger"
                  ? t("eval.runner.trigger")
                  : "Run Benchmark Suite"}
            </Button>
          </div>

          {runnerError && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-xs">
              {runnerError}
            </div>
          )}

          {runnerResult && (
            <div
              className="bg-muted/30 border-border space-y-4 rounded-lg border p-4"
              data-testid="runner-result-panel"
            >
              {/* Gate Decision Header */}
              <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {t("eval.runner.gate.title") !== "eval.runner.gate.title"
                      ? t("eval.runner.gate.title")
                      : "Release Gate Decision"}
                  </span>
                  <p className="text-foreground text-xs font-medium">{runnerResult.gate.message}</p>
                </div>
                <div>
                  {runnerResult.gate.verdict === "PASSED" ? (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400">
                      {t("eval.runner.gate.passed") !== "eval.runner.gate.passed"
                        ? t("eval.runner.gate.passed")
                        : "GATE PASSED"}
                    </Badge>
                  ) : runnerResult.gate.verdict === "WARNING" ? (
                    <Badge className="border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-600 dark:text-amber-400">
                      {t("eval.runner.gate.warning") !== "eval.runner.gate.warning"
                        ? t("eval.runner.gate.warning")
                        : "GATE WARNING"}
                    </Badge>
                  ) : (
                    <Badge className="border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400">
                      {t("eval.runner.gate.blocked") !== "eval.runner.gate.blocked"
                        ? t("eval.runner.gate.blocked")
                        : "GATE BLOCKED"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metrics Summary Pills */}
              <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
                <div className="bg-background/80 border-border/80 rounded-md border p-2">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Recall@5
                  </span>
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {(runnerResult.gate.metricsSummary.recallAt5 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-background/80 border-border/80 rounded-md border p-2">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Faithfulness
                  </span>
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {(runnerResult.gate.metricsSummary.faithfulness * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-background/80 border-border/80 rounded-md border p-2">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Citation Prec.
                  </span>
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {(runnerResult.gate.metricsSummary.citationCorrectness * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-background/80 border-border/80 rounded-md border p-2">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    AR/EN Parity
                  </span>
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {(runnerResult.gate.metricsSummary.arabicParityRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-background/80 border-border/80 rounded-md border p-2">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Avg Latency
                  </span>
                  <span className="text-foreground font-mono text-sm font-semibold">
                    {runnerResult.gate.metricsSummary.averageLatencyMs} ms
                  </span>
                </div>
              </div>

              {/* Regressions or Warnings */}
              {runnerResult.gate.regressions.length > 0 && (
                <div className="space-y-1 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                  <p className="font-semibold">Regressions detected violating release gate:</p>
                  <ul className="list-disc space-y-0.5 pl-4">
                    {runnerResult.gate.regressions.map((reg, idx) => (
                      <li key={idx}>{reg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Case Results Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground text-xs font-medium">
                  {runnerResult.caseResults.length} cases executed ({runnerResult.run.passedCases}{" "}
                  passed, {runnerResult.caseResults.length - runnerResult.run.passedCases} failed)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCaseResults((prev) => !prev)}
                  className="text-xs"
                  data-testid="toggle-case-results"
                >
                  {showCaseResults ? "Hide Case Details" : "View Case Details"}
                </Button>
              </div>

              {showCaseResults && (
                <div className="border-border max-h-64 overflow-y-auto rounded-md border">
                  <table className="w-full text-left text-xs" dir="ltr">
                    <thead className="bg-muted text-muted-foreground border-border border-b font-medium">
                      <tr>
                        <th className="p-2">Query</th>
                        <th className="p-2">Lang</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {runnerResult.caseResults.map((c) => (
                        <tr key={c.caseId} className="hover:bg-muted/30">
                          <td className="text-foreground max-w-xs truncate p-2">{c.query}</td>
                          <td className="text-muted-foreground p-2 uppercase">{c.localeCode}</td>
                          <td className="text-muted-foreground p-2">{c.category}</td>
                          <td className="p-2">
                            {c.passed ? (
                              <span className="font-semibold text-emerald-600">PASS</span>
                            ) : (
                              <span className="font-semibold text-rose-600">FAIL</span>
                            )}
                          </td>
                          <td className="text-muted-foreground p-2 font-mono">{c.latencyMs}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
            Select a baseline run (reference) and candidate run (new model/prompt/reranker) to
            inspect delta changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
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
            <div className="border-border space-y-4 border-t pt-4" data-testid="comparison-results">
              {/* Regression Decision Banner */}
              <div
                className={`flex items-center justify-between rounded-lg border p-3 text-xs ${
                  comparison.hasRegression
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
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
                  Regressions: {comparison.regressionCount} • Improvements:{" "}
                  {comparison.improvementCount}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-start font-mono text-xs">
                  <thead>
                    <tr className="border-border bg-muted/30 text-muted-foreground border-b text-[11px]">
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
                          className="border-border/60 hover:bg-muted/20 border-b transition-colors"
                          data-testid={`delta-row-${key}`}
                        >
                          <td className="text-foreground p-2 font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </td>
                          <td className="text-muted-foreground p-2">{formatVal(delta.baseline)}</td>
                          <td className="text-foreground p-2 font-bold">
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
            <table className="w-full border-collapse text-start text-xs">
              <thead>
                <tr className="border-border bg-muted/30 text-muted-foreground border-b font-mono text-[11px]">
                  <th className="p-2 text-start">Dataset & Model</th>
                  <th className="p-2 text-start">Status</th>
                  <th className="p-2 text-start">Pass Rate</th>
                  <th className="p-2 text-start">Latency</th>
                  <th className="p-2 text-start">Faithfulness</th>
                  <th className="p-2 text-start">Recall@5</th>
                  <th className="p-2 text-start">Run Date</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {runs.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition-colors"
                    data-testid={`admin-run-row-${r.id}`}
                  >
                    <td className="p-2">
                      <div className="text-foreground text-xs font-semibold">{r.datasetName}</div>
                      <div className="text-muted-foreground font-mono text-[10px]">
                        {r.modelId} • {r.promptVersion}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="text-foreground p-2 font-mono font-bold">
                      {(r.passRate * 100).toFixed(1)}%
                    </td>
                    <td className="text-muted-foreground p-2 font-mono">{r.averageLatencyMs}ms</td>
                    <td className="text-foreground p-2 font-mono">
                      {(r.metrics.faithfulness * 100).toFixed(1)}%
                    </td>
                    <td className="text-foreground p-2 font-mono">
                      {(r.metrics.recallAt5 * 100).toFixed(1)}%
                    </td>
                    <td className="text-muted-foreground p-2 text-[11px]">
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
