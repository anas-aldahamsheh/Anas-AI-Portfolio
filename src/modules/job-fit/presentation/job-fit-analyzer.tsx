"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import {
  JobFitAnalysisResult,
  JobFitEvidenceStatus,
  JobFitRequirementMatch,
} from "@/ai/contracts/job-fit";

const SAMPLE_JD_1 = `Senior AI Platform Architect & Systems Engineer:
We are seeking an experienced AI Platform Engineer to design and scale our next-generation enterprise RAG architecture.
Key Requirements:
- Deep expertise in hybrid vector search combining dense embeddings (BGE-M3, OpenAI) with sparse BM25 retrieval.
- Proven experience implementing cross-encoder rerankers and deterministic token context budgeting.
- Production experience with PostgreSQL, Qdrant/vector databases, and structured JSON generation pipelines.
- Demonstrated ability to architect resilient fallback mechanisms and multi-provider failover strategies.
- Strong full-stack engineering skills in TypeScript, React, Next.js, and modern distributed cloud environments.`;

const SAMPLE_JD_2 = `Staff Full-Stack Engineer (Next.js, TypeScript & Distributed Systems):
We are looking for a Staff Full-Stack Software Engineer to lead core application architecture.
Key Requirements:
- Comprehensive proficiency in TypeScript, React 19, Next.js App Router, and server/client state management.
- Experience engineering production-grade internationalization (RTL/LTR dynamic switching for Arabic and English).
- Robust relational database schema design with PostgreSQL, Drizzle ORM, migrations, and audit logging.
- Strong foundation in security, authentication (BetterAuth/OAuth, RBAC), and secrets management.
- Experience delivering fast, accessible (WCAG AAA/keyboard-first) web applications with rich micro-animations.`;

export function JobFitAnalyzer() {
  const { t, locale, dir } = useLocalization();
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobFitAnalysisResult | null>(null);
  const [filter, setFilter] = useState<JobFitEvidenceStatus | "all">("all");
  const [copied, setCopied] = useState(false);

  async function handleAnalyze() {
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError(
        locale === "ar"
          ? "يرجى إدخال وصف وظيفي لا يقل عن 30 حرفاً للتحليل."
          : "Please enter a job description of at least 30 characters.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/job-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          locale,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        data?: JobFitAnalysisResult;
        error?: string;
      };

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || "Failed to analyze job description alignment.");
      }

      setResult(data.data);
      setFilter("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setJobDescription("");
    setResult(null);
    setError(null);
  }

  function handleCopyReport() {
    if (!result) return;
    const lines: string[] = [];
    lines.push(`=== ${t("jobfit.title")} ===`);
    lines.push(`${t("jobfit.summary.match_score")}: ${result.summary.matchScore}%`);
    lines.push(
      `${t("jobfit.summary.total")}: ${result.summary.totalRequirements} (${t("jobfit.status.supported")}: ${result.summary.supportedCount}, ${t("jobfit.status.partially_supported")}: ${result.summary.partiallySupportedCount}, ${t("jobfit.status.not_found")}: ${result.summary.notFoundCount})`,
    );
    lines.push("");
    lines.push(`Overview: ${result.summary.overview}`);
    lines.push("");
    lines.push("Requirements Breakdown:");
    for (const req of result.requirements) {
      lines.push(`- [${req.status.toUpperCase()}] ${req.requirement}`);
      lines.push(`  ${req.explanation}`);
      if (req.citations.length > 0) {
        lines.push(
          `  Evidence: ${req.citations.map((c) => `${c.title} (${c.sourceType})`).join(", ")}`,
        );
      }
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const filteredRequirements = result
    ? filter === "all"
      ? result.requirements
      : result.requirements.filter((r) => r.status === filter)
    : [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8" dir={dir}>
      {/* Header Banner */}
      <div className="text-center sm:text-start">
        <div className="border-primary/20 bg-primary/10 text-primary mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>{t("jobfit.privacy_badge")}</span>
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {t("jobfit.title")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
          {t("jobfit.subtitle")}
        </p>
      </div>

      {/* Input Card */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <label htmlFor="jd-textarea" className="text-foreground text-sm font-semibold">
            {t("jobfit.input.label")}
          </label>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <span>{t("jobfit.input.sample_label")}</span>
            <button
              type="button"
              onClick={() => setJobDescription(SAMPLE_JD_1)}
              className="border-border bg-muted/50 hover:bg-muted text-foreground rounded border px-2 py-0.5 transition-colors"
              data-testid="sample-jd-1-button"
            >
              {t("jobfit.input.sample_1")}
            </button>
            <button
              type="button"
              onClick={() => setJobDescription(SAMPLE_JD_2)}
              className="border-border bg-muted/50 hover:bg-muted text-foreground rounded border px-2 py-0.5 transition-colors"
              data-testid="sample-jd-2-button"
            >
              {t("jobfit.input.sample_2")}
            </button>
          </div>
        </div>

        <textarea
          id="jd-textarea"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder={t("jobfit.input.placeholder")}
          rows={7}
          className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:ring-primary/40 w-full resize-y rounded-xl border p-3.5 text-sm leading-relaxed focus:ring-2 focus:outline-none"
          data-testid="job-description-input"
          disabled={isLoading}
        />

        <div className="mt-3 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-muted-foreground self-start text-xs sm:self-center">
            {jobDescription.length} {t("jobfit.input.char_count")}
          </span>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            {jobDescription.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                data-testid="clear-jd-button"
              >
                {t("jobfit.action.clear")}
              </button>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading || jobDescription.trim().length < 30}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial sm:text-sm"
              data-testid="analyze-job-button"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{t("jobfit.action.analyzing")}</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{t("jobfit.action.analyze")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400"
            role="alert"
            data-testid="jobfit-error-banner"
          >
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result ? (
        <div className="space-y-6" data-testid="jobfit-results-container">
          {/* Summary Overview Card */}
          <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              {/* Match Gauge */}
              <div className="flex items-center gap-4">
                <div className="border-primary/30 bg-primary/10 relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2">
                  <span
                    className="text-primary text-2xl font-bold"
                    data-testid="match-score-display"
                  >
                    {result.summary.matchScore}%
                  </span>
                </div>
                <div>
                  <h2 className="text-foreground text-base font-bold">
                    {t("jobfit.summary.match_score")}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {result.summary.totalRequirements} {t("jobfit.summary.total")}
                  </p>
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>
                    {result.summary.supportedCount} {t("jobfit.status.supported")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>
                    {result.summary.partiallySupportedCount}{" "}
                    {t("jobfit.status.partially_supported")}
                  </span>
                </div>

                <div className="border-border bg-muted/60 text-muted-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold">
                  <span className="bg-muted-foreground/50 h-2 w-2 rounded-full" />
                  <span>
                    {result.summary.notFoundCount} {t("jobfit.status.not_found")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="border-border bg-card text-foreground hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                  data-testid="copy-report-button"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{copied ? t("jobfit.action.copied") : t("jobfit.action.copy_report")}</span>
                </button>
              </div>
            </div>

            {/* Narrative Overview */}
            <div className="border-border mt-5 border-t pt-4">
              <p
                className="text-foreground text-sm leading-relaxed"
                data-testid="jobfit-overview-text"
              >
                {result.summary.overview}
              </p>
            </div>

            {/* Strengths and Considerations Grid */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {result.summary.strengths.length > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{t("jobfit.summary.strengths")}</span>
                  </h4>
                  <ul className="text-foreground/90 space-y-1.5 text-xs">
                    {result.summary.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary.gapsOrConsiderations.length > 0 && (
                <div className="border-border bg-muted/30 rounded-xl border p-3.5">
                  <h4 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{t("jobfit.summary.considerations")}</span>
                  </h4>
                  <ul className="text-muted-foreground space-y-1.5 text-xs">
                    {result.summary.gapsOrConsiderations.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="border-border flex items-center gap-1.5 overflow-x-auto border-b pb-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="filter-tab-all"
            >
              {t("jobfit.filter.all")} ({result.summary.totalRequirements})
            </button>
            <button
              type="button"
              onClick={() => setFilter("supported")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "supported"
                  ? "bg-emerald-600 font-semibold text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="filter-tab-supported"
            >
              {t("jobfit.filter.supported")} ({result.summary.supportedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("partially_supported")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "partially_supported"
                  ? "bg-amber-600 font-semibold text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="filter-tab-partially-supported"
            >
              {t("jobfit.filter.partially_supported")} ({result.summary.partiallySupportedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("not_found")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "not_found"
                  ? "bg-muted-foreground text-card font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="filter-tab-not-found"
            >
              {t("jobfit.filter.not_found")} ({result.summary.notFoundCount})
            </button>
          </div>

          {/* Requirements Cards List */}
          <div className="space-y-3" data-testid="jobfit-requirements-list">
            {filteredRequirements.map((req: JobFitRequirementMatch) => (
              <div
                key={req.id}
                className="border-border bg-card hover:border-border/80 rounded-xl border p-4 shadow-xs transition-all duration-150"
                data-testid={`requirement-card-${req.id}`}
              >
                <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="text-foreground text-sm font-semibold">{req.requirement}</h3>

                  <span
                    className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-0.5 text-xs font-medium sm:self-auto ${
                      req.status === "supported"
                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : req.status === "partially_supported"
                          ? "border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-border bg-muted/60 text-muted-foreground border"
                    }`}
                    data-testid={`requirement-status-${req.id}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        req.status === "supported"
                          ? "bg-emerald-500"
                          : req.status === "partially_supported"
                            ? "bg-amber-500"
                            : "bg-muted-foreground/60"
                      }`}
                    />
                    <span>
                      {req.status === "supported"
                        ? t("jobfit.status.supported")
                        : req.status === "partially_supported"
                          ? t("jobfit.status.partially_supported")
                          : t("jobfit.status.not_found")}
                    </span>
                  </span>
                </div>

                <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
                  {req.explanation}
                </p>

                {req.uncertaintyNote && (
                  <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">{t("jobfit.uncertainty.label")} </span>
                    <span>{req.uncertaintyNote}</span>
                  </div>
                )}

                {req.citations.length > 0 && (
                  <div className="border-border/50 border-t pt-2.5">
                    <span className="text-foreground/80 mb-1.5 block text-[11px] font-medium">
                      {t("jobfit.citation.sources")}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {req.citations.map((c, cIdx) => (
                        <Link
                          key={cIdx}
                          href={c.url || "#"}
                          className="border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`citation-badge-${req.id}-${cIdx}`}
                        >
                          <span className="bg-primary/20 py-0.2 text-primary rounded px-1 text-[9px] font-bold uppercase">
                            {c.sourceType}
                          </span>
                          <span className="max-w-[200px] truncate">{c.title}</span>
                          <svg
                            className="h-3 w-3 rtl:rotate-180"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center"
          data-testid="jobfit-empty-state"
        >
          <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h3 className="text-foreground text-base font-semibold">{t("jobfit.empty.title")}</h3>
          <p className="text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed sm:text-sm">
            {t("jobfit.empty.desc")}
          </p>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="text-muted-foreground mx-auto max-w-2xl text-center text-xs leading-relaxed">
        {t("jobfit.disclaimer")}
      </p>
    </div>
  );
}
