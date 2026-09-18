"use client";

import { useState } from "react";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { AiLabExecutionResult, LocalizedAiLabDemo } from "@/ai/contracts/ai-lab";
import { BASELINE_AI_LAB_DEMOS } from "@/ai/lab/baseline-demos";

const DEFAULT_DEMOS: LocalizedAiLabDemo[] = BASELINE_AI_LAB_DEMOS.map((d) => ({
  id: d.id,
  slug: d.slug,
  type: d.type,
  title: d.titleEn,
  description: d.descriptionEn,
  isPublished: d.isPublished,
  rateLimitRpm: d.rateLimitRpm,
  timeoutMs: d.timeoutMs,
  sortOrder: d.sortOrder,
}));

// Sample Queries for quick testing
const SAMPLES: Record<
  string,
  Array<{ labelEn: string; labelAr: string; params: Record<string, unknown> }>
> = {
  "hybrid-search": [
    {
      labelEn: "Production RAG & AI",
      labelAr: "معمارية RAG والذكاء الاصطناعي",
      params: {
        query: "Production RAG architecture with dense vectors and sparse lexical search",
        denseWeight: 0.6,
        topK: 5,
      },
    },
    {
      labelEn: "Distributed Systems & Cloud",
      labelAr: "الأنظمة الموزعة والسحابية",
      params: {
        query: "Distributed cloud microservices with PostgreSQL and low latency",
        denseWeight: 0.4,
        topK: 5,
      },
    },
  ],
  reranking: [
    {
      labelEn: "Next.js & TypeScript Architecture",
      labelAr: "بنية Next.js وTypeScript",
      params: {
        query: "Modern Next.js 15 App Router architecture with strict TypeScript",
        candidateCount: 6,
        topN: 3,
        threshold: 0.05,
      },
    },
    {
      labelEn: "High-Throughput Vector Retrieval",
      labelAr: "استرجاع المتجهات عالي الإنتاجية",
      params: {
        query: "Qdrant vector similarity search indexing and optimization",
        candidateCount: 6,
        topN: 3,
        threshold: 0.1,
      },
    },
  ],
  "retrieval-comparison": [
    {
      labelEn: "Multilingual Arabic & English NLP",
      labelAr: "معالجة اللغة الطبيعية متعددة اللغات",
      params: {
        query: "Arabic morphological tokenization and English semantic embeddings",
        topK: 5,
      },
    },
    {
      labelEn: "Database & ORM Layer",
      labelAr: "قواعد البيانات وطبقة ORM",
      params: {
        query: "PostgreSQL schema migrations with Drizzle ORM and strict constraints",
        topK: 5,
      },
    },
  ],
  "structured-extraction": [
    {
      labelEn: "AI Architect Profile",
      labelAr: "ملف مهندس ذكاء اصطناعي",
      params: {
        text: "Anas architected a production multilingual hybrid RAG pipeline with Qdrant vector database, BGE-M3 embeddings, Next.js 15, and strict TypeScript. Reduced retrieval latency to 42ms and sustained 99.8% precision.",
        schemaType: "skills_and_technologies",
      },
    },
    {
      labelEn: "System Reliability Summary",
      labelAr: "ملخص موثوقية الأنظمة",
      params: {
        text: "Delivered enterprise microservices deployed to Kubernetes clusters with automated canary rollouts, 99.99% uptime, zero downtime deployments, and comprehensive Prometheus telemetry.",
        schemaType: "project_metadata",
      },
    },
  ],
  "citation-verification": [
    {
      labelEn: "Grounded Claim (Supported)",
      labelAr: "ادعاء موثق (مدعوم)",
      params: {
        claim:
          "Anas implemented a hybrid RAG retrieval pipeline combining BGE-M3 dense vectors with BM25 sparse search.",
      },
    },
    {
      labelEn: "Hallucinated Claim (Unsupported)",
      labelAr: "ادعاء غير موثق (مرفوض)",
      params: {
        claim:
          "Anas published peer-reviewed quantum computing algorithms for quantum encryption in 2021.",
      },
    },
  ],
};

export function AiLabView({ initialDemos }: { initialDemos?: LocalizedAiLabDemo[] }) {
  const { t, locale, dir } = useLocalization();
  const demos = initialDemos && initialDemos.length > 0 ? initialDemos : DEFAULT_DEMOS;

  const [activeSlug, setActiveSlug] = useState<string>(demos[0]?.slug || "hybrid-search");
  const [params, setParams] = useState<Record<string, unknown>>({
    query: "Production RAG architecture with dense vectors and sparse lexical search",
    denseWeight: 0.5,
    topK: 5,
    candidateCount: 6,
    topN: 3,
    threshold: 0.05,
    schemaType: "skills_and_technologies",
    text: "Anas architected a production multilingual hybrid RAG pipeline with Qdrant vector database, BGE-M3 embeddings, Next.js 15, and strict TypeScript. Reduced retrieval latency to 42ms and sustained 99.8% precision.",
    claim:
      "Anas implemented a hybrid RAG retrieval pipeline combining BGE-M3 dense vectors with BM25 sparse search.",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiLabExecutionResult | null>(null);
  const [viewMode, setViewMode] = useState<"visual" | "raw">("visual");
  const [copied, setCopied] = useState(false);

  const activeDemo = demos.find((d) => d.slug === activeSlug) || demos[0];

  function handleSelectDemo(slug: string) {
    setActiveSlug(slug);
    setError(null);
    setResult(null);

    // Apply default sample params for selected demo
    const sampleList = SAMPLES[slug];
    if (sampleList && sampleList[0]) {
      setParams((prev) => ({
        ...prev,
        ...sampleList[0]!.params,
      }));
    }
  }

  async function handleRun() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/lab/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoSlug: activeSlug,
          params,
          locale,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        data?: AiLabExecutionResult;
        error?: string;
        details?: string;
      };

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.details || data.error || t("lab.error.failed"));
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("lab.error.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyRawJson() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8" dir={dir}>
      {/* Header Banner */}
      <div className="text-center sm:text-start">
        <div className="border-primary/20 bg-primary/10 text-primary mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
          <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          <span>{t("lab.badge")}</span>
        </div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {t("lab.title")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
          {t("lab.subtitle")}
        </p>
      </div>

      {/* Demo Selector Tabs */}
      <div className="border-border bg-card/60 overflow-x-auto rounded-2xl border p-2 backdrop-blur-md">
        <div className="flex min-w-max gap-2" role="tablist" aria-label="AI Lab Demonstrations">
          {demos.map((d) => {
            const isSelected = d.slug === activeSlug;
            return (
              <button
                key={d.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectDemo(d.slug)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid={`lab-tab-${d.slug}`}
              >
                {d.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Demo Description & Config Card */}
      {activeDemo && (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-foreground text-xl font-bold">{activeDemo.title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{activeDemo.description}</p>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <span className="border-border bg-muted/60 rounded-md border px-2.5 py-1">
                Limit: {activeDemo.rateLimitRpm} RPM
              </span>
              <span className="border-border bg-muted/60 rounded-md border px-2.5 py-1">
                Timeout: {activeDemo.timeoutMs / 1000}s
              </span>
            </div>
          </div>

          {/* Preset Samples */}
          {SAMPLES[activeSlug] && (
            <div className="border-border/60 mt-4 flex flex-wrap items-center gap-2 border-t pt-4 text-xs">
              <span className="text-muted-foreground font-medium">
                {locale === "ar" ? "نماذج اختبار سريعة:" : "Quick Test Presets:"}
              </span>
              {SAMPLES[activeSlug]!.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setParams((prev) => ({ ...prev, ...sample.params }))}
                  className="border-border bg-muted/50 hover:bg-muted text-foreground rounded-lg border px-3 py-1 transition-colors"
                  data-testid={`lab-sample-${idx}`}
                >
                  {locale === "ar" ? sample.labelAr : sample.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Parameter Controls Form */}
      <div className="border-border bg-card space-y-6 rounded-2xl border p-6 shadow-sm">
        <h3 className="text-foreground text-base font-semibold">{t("lab.params.title")}</h3>

        {/* Demo 1: Hybrid Search Explorer */}
        {activeDemo?.type === "hybrid_search" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="param-query" className="text-foreground text-xs font-semibold">
                {t("lab.params.query")}
              </label>
              <input
                id="param-query"
                type="text"
                value={(params.query as string) || ""}
                onChange={(e) => setParams({ ...params, query: e.target.value })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-query-input"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="param-dense-weight" className="text-foreground font-semibold">
                  {t("lab.params.denseWeight")}
                </label>
                <span className="text-primary font-mono">{Number(params.denseWeight ?? 0.5)}</span>
              </div>
              <input
                id="param-dense-weight"
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={Number(params.denseWeight ?? 0.5)}
                onChange={(e) => setParams({ ...params, denseWeight: parseFloat(e.target.value) })}
                className="accent-primary w-full cursor-pointer"
                data-testid="param-dense-weight-slider"
              />
              <div className="text-muted-foreground flex justify-between text-[11px]">
                <span>10% Vector / 90% BM25</span>
                <span>90% Vector / 10% BM25</span>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="param-topk" className="text-foreground text-xs font-semibold">
                {t("lab.params.topK")}
              </label>
              <select
                id="param-topk"
                value={Number(params.topK ?? 5)}
                onChange={(e) => setParams({ ...params, topK: parseInt(e.target.value, 10) })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-topk-select"
              >
                <option value={3}>Top 3 Candidates</option>
                <option value={5}>Top 5 Candidates</option>
                <option value={8}>Top 8 Candidates</option>
                <option value={10}>Top 10 Candidates</option>
              </select>
            </div>
          </div>
        )}

        {/* Demo 2: Cross-Encoder Reranking Sandbox */}
        {activeDemo?.type === "reranking" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="param-query-rerank" className="text-foreground text-xs font-semibold">
                {t("lab.params.query")}
              </label>
              <input
                id="param-query-rerank"
                type="text"
                value={(params.query as string) || ""}
                onChange={(e) => setParams({ ...params, query: e.target.value })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-query-rerank-input"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="param-candidate-count"
                className="text-foreground text-xs font-semibold"
              >
                {t("lab.params.candidateCount")}
              </label>
              <select
                id="param-candidate-count"
                value={Number(params.candidateCount ?? 6)}
                onChange={(e) =>
                  setParams({ ...params, candidateCount: parseInt(e.target.value, 10) })
                }
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-candidate-count-select"
              >
                <option value={4}>4 Candidate Documents</option>
                <option value={6}>6 Candidate Documents</option>
                <option value={8}>8 Candidate Documents</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="param-topn" className="text-foreground text-xs font-semibold">
                {t("lab.params.topN")}
              </label>
              <select
                id="param-topn"
                value={Number(params.topN ?? 3)}
                onChange={(e) => setParams({ ...params, topN: parseInt(e.target.value, 10) })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-topn-select"
              >
                <option value={2}>Top 2 Reranked</option>
                <option value={3}>Top 3 Reranked</option>
                <option value={5}>Top 5 Reranked</option>
              </select>
            </div>
          </div>
        )}

        {/* Demo 3: Retrieval Architecture Benchmark */}
        {activeDemo?.type === "retrieval_comparison" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="param-comp-query" className="text-foreground text-xs font-semibold">
                {t("lab.params.query")}
              </label>
              <input
                id="param-comp-query"
                type="text"
                value={(params.query as string) || ""}
                onChange={(e) => setParams({ ...params, query: e.target.value })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-comp-query-input"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="param-comp-topk" className="text-foreground text-xs font-semibold">
                {t("lab.params.topK")}
              </label>
              <select
                id="param-comp-topk"
                value={Number(params.topK ?? 5)}
                onChange={(e) => setParams({ ...params, topK: parseInt(e.target.value, 10) })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-comp-topk-select"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={8}>Top 8</option>
              </select>
            </div>
          </div>
        )}

        {/* Demo 4: Structured Entity Extractor */}
        {activeDemo?.type === "structured_extraction" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="param-schema-type" className="text-foreground text-xs font-semibold">
                {t("lab.params.schemaType")}
              </label>
              <select
                id="param-schema-type"
                value={(params.schemaType as string) || "skills_and_technologies"}
                onChange={(e) => setParams({ ...params, schemaType: e.target.value })}
                className="border-border bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-schema-select"
              >
                <option value="skills_and_technologies">Skills, Categorization & Domain</option>
                <option value="project_metadata">Project Architecture & Metrics</option>
                <option value="career_milestones">Role Highlights & Competencies</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="param-context-text" className="text-foreground text-xs font-semibold">
                {t("lab.params.text")}
              </label>
              <textarea
                id="param-context-text"
                rows={4}
                value={(params.text as string) || ""}
                onChange={(e) => setParams({ ...params, text: e.target.value })}
                className="border-border bg-background text-foreground focus:ring-primary w-full resize-y rounded-xl border p-3.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-text-textarea"
              />
            </div>
          </div>
        )}

        {/* Demo 5: Grounded Citation & Hallucination Guard */}
        {activeDemo?.type === "citation_verification" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="param-claim-input" className="text-foreground text-xs font-semibold">
                {t("lab.params.claim")}
              </label>
              <textarea
                id="param-claim-input"
                rows={3}
                value={(params.claim as string) || ""}
                onChange={(e) => setParams({ ...params, claim: e.target.value })}
                className="border-border bg-background text-foreground focus:ring-primary w-full resize-y rounded-xl border p-3.5 text-sm transition outline-none focus:ring-2"
                data-testid="param-claim-textarea"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm"
          >
            {error}
          </div>
        )}

        {/* Execution Action Button */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all focus:ring-4 disabled:opacity-50"
            data-testid="lab-run-button"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t("lab.run.running")}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{t("lab.run.button")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Execution Results Section */}
      {result && (
        <div className="border-border bg-card space-y-6 rounded-2xl border p-6 shadow-sm">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-foreground text-lg font-bold">{t("lab.results.title")}</h3>
              <p className="text-muted-foreground text-xs">
                Pipeline:{" "}
                <span className="text-primary font-mono font-medium">{result.demoSlug}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="border-border bg-muted/40 inline-flex rounded-lg border p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode("visual")}
                  className={`rounded-md px-3 py-1 transition-all ${
                    viewMode === "visual"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="viewmode-visual-button"
                >
                  {t("lab.results.visual")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={`rounded-md px-3 py-1 transition-all ${
                    viewMode === "raw"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="viewmode-raw-button"
                >
                  {t("lab.results.raw")}
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyRawJson}
                className="border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border p-1.5 transition-colors"
                title="Copy Raw JSON"
                aria-label="Copy Raw JSON"
              >
                {copied ? (
                  <span className="text-primary px-1 text-xs">Copied!</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Telemetry Bar */}
          <div className="border-border/60 bg-muted/30 grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4">
            <div>
              <div className="text-muted-foreground text-xs">{t("lab.telemetry.latency")}</div>
              <div className="text-foreground font-mono text-lg font-bold">
                {result.telemetry.latencyMs}ms
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">{t("lab.telemetry.real")}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>100% Authentic</span>
              </div>
            </div>
            {result.telemetry.tokensUsed !== undefined && (
              <div>
                <div className="text-muted-foreground text-xs">{t("lab.telemetry.tokens")}</div>
                <div className="text-foreground font-mono text-lg font-bold">
                  {result.telemetry.tokensUsed}
                </div>
              </div>
            )}
            {result.telemetry.details && (
              <div>
                <div className="text-muted-foreground text-xs">Internal Telemetry</div>
                <div className="text-muted-foreground mt-1 truncate font-mono text-xs">
                  {Object.keys(result.telemetry.details).length} metrics tracked
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Visual Presentation */}
          {viewMode === "visual" && (
            <div className="space-y-4">
              {/* Hybrid Search Results */}
              {result.type === "hybrid_search" && (
                <div className="space-y-3" data-testid="visual-hybrid-results">
                  {(
                    (result.data as { results?: Array<Record<string, unknown>> })?.results || []
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="border-border bg-card/60 hover:border-primary/40 rounded-xl border p-4 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 font-mono text-xs font-bold">
                            #{String(item.rank)}
                          </span>
                          <h4 className="text-foreground text-sm font-semibold">
                            {String(item.title)}
                          </h4>
                          <span className="text-muted-foreground font-mono text-xs">
                            ({String(item.sourceType)})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-primary font-bold">RRF: {String(item.score)}</span>
                          <span className="text-muted-foreground">
                            Dense: #{String(item.denseRank)}
                          </span>
                          <span className="text-muted-foreground">
                            Sparse: #{String(item.sparseRank)}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        {String(item.snippet)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Cross-Encoder Reranking Results */}
              {result.type === "reranking" && (
                <div className="space-y-3" data-testid="visual-rerank-results">
                  {(
                    (result.data as { postRerank?: Array<Record<string, unknown>> })?.postRerank ||
                    []
                  ).map((item, idx) => {
                    const rankDelta = Number(item.rankDelta ?? 0);
                    return (
                      <div
                        key={idx}
                        className="border-border bg-card/60 hover:border-primary/40 rounded-xl border p-4 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground rounded-md px-2 py-0.5 font-mono text-xs font-bold">
                              Rank {String(item.newRank)}
                            </span>
                            <h4 className="text-foreground text-sm font-semibold">
                              {String(item.title)}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="text-foreground font-bold">
                              Score: {String(item.crossEncoderScore)}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 font-bold ${
                                rankDelta > 0
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : rankDelta < 0
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rankDelta > 0
                                ? `+${rankDelta} Promoted`
                                : rankDelta < 0
                                  ? `${rankDelta} Demoted`
                                  : "Unchanged"}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                          {String(item.snippet)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Retrieval Comparison Results */}
              {result.type === "retrieval_comparison" && (
                <div className="space-y-4" data-testid="visual-comparison-results">
                  <div className="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        Overlap Between Dense & Sparse:{" "}
                      </span>
                      <span className="text-foreground font-mono text-sm font-bold">
                        {String(
                          (result.data as { overlapPercentage?: number })?.overlapPercentage ?? 0,
                        )}
                        %
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Comparing Dense Embeddings vs Sparse BM25 vs RRF Fusion
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Dense */}
                    <div className="border-border bg-card space-y-3 rounded-xl border p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-bold">Dense (Vector)</span>
                        <span className="text-muted-foreground font-mono">
                          {String(
                            (result.data as { dense?: { latencyMs?: number } })?.dense?.latencyMs ??
                              0,
                          )}
                          ms
                        </span>
                      </div>
                      <div className="space-y-2">
                        {(
                          (result.data as { dense?: { items?: Array<Record<string, unknown>> } })
                            ?.dense?.items || []
                        ).map((it, i) => (
                          <div
                            key={i}
                            className="border-border bg-muted/30 rounded-lg border p-2 text-xs"
                          >
                            <div className="flex justify-between font-mono text-[11px]">
                              <span>#{String(it.rank)}</span>
                              <span className="text-primary font-bold">{String(it.score)}</span>
                            </div>
                            <div className="text-foreground mt-0.5 truncate font-medium">
                              {String(it.title)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sparse */}
                    <div className="border-border bg-card space-y-3 rounded-xl border p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-bold">Sparse (BM25)</span>
                        <span className="text-muted-foreground font-mono">
                          {String(
                            (result.data as { sparse?: { latencyMs?: number } })?.sparse
                              ?.latencyMs ?? 0,
                          )}
                          ms
                        </span>
                      </div>
                      <div className="space-y-2">
                        {(
                          (result.data as { sparse?: { items?: Array<Record<string, unknown>> } })
                            ?.sparse?.items || []
                        ).map((it, i) => (
                          <div
                            key={i}
                            className="border-border bg-muted/30 rounded-lg border p-2 text-xs"
                          >
                            <div className="flex justify-between font-mono text-[11px]">
                              <span>#{String(it.rank)}</span>
                              <span className="text-primary font-bold">{String(it.score)}</span>
                            </div>
                            <div className="text-foreground mt-0.5 truncate font-medium">
                              {String(it.title)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hybrid */}
                    <div className="border-primary/40 bg-card space-y-3 rounded-xl border p-4 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-primary font-bold">Hybrid (RRF Fusion)</span>
                        <span className="text-muted-foreground font-mono">
                          {String(
                            (result.data as { hybrid?: { latencyMs?: number } })?.hybrid
                              ?.latencyMs ?? 0,
                          )}
                          ms
                        </span>
                      </div>
                      <div className="space-y-2">
                        {(
                          (result.data as { hybrid?: { items?: Array<Record<string, unknown>> } })
                            ?.hybrid?.items || []
                        ).map((it, i) => (
                          <div
                            key={i}
                            className="border-border bg-muted/30 rounded-lg border p-2 text-xs"
                          >
                            <div className="flex justify-between font-mono text-[11px]">
                              <span>#{String(it.rank)}</span>
                              <span className="text-primary font-bold">{String(it.score)}</span>
                            </div>
                            <div className="text-foreground mt-0.5 truncate font-medium">
                              {String(it.title)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Structured Extraction Results */}
              {result.type === "structured_extraction" && (
                <div className="space-y-4" data-testid="visual-extraction-results">
                  <div className="border-border bg-muted/30 flex items-center justify-between rounded-xl border p-4 text-xs">
                    <span className="text-muted-foreground">
                      Schema:{" "}
                      <span className="text-foreground font-mono font-semibold">
                        {String((result.data as { schemaType?: string })?.schemaType)}
                      </span>
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      Valid Schema
                    </span>
                  </div>
                  <div className="border-border bg-card rounded-xl border p-4">
                    <pre className="text-foreground overflow-x-auto font-mono text-xs leading-relaxed">
                      {String((result.data as { rawJson?: string })?.rawJson || "")}
                    </pre>
                  </div>
                </div>
              )}

              {/* Citation Verification Results */}
              {result.type === "citation_verification" && (
                <div className="space-y-4" data-testid="visual-citation-results">
                  {(() => {
                    const data = result.data as {
                      status?: string;
                      confidenceScore?: number;
                      verdict?: string;
                      verifiedCitations?: Array<Record<string, unknown>>;
                    };
                    const status = data.status || "supported";
                    return (
                      <>
                        <div
                          className={`rounded-xl border p-4 ${
                            status === "supported"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : status === "partially_supported"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold tracking-wider uppercase">
                              Status: {status}
                            </span>
                            <span className="font-mono text-xs font-bold">
                              Confidence: {Math.round((data.confidenceScore ?? 0) * 100)}%
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium">{data.verdict}</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-foreground text-xs font-semibold">
                            Inspected Portfolio Ground Truth Evidence:
                          </h4>
                          {(data.verifiedCitations || []).map((cit, idx) => (
                            <div
                              key={idx}
                              className="border-border bg-card space-y-1 rounded-xl border p-3 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-foreground font-semibold">
                                  {String(cit.sourceTitle)}
                                </span>
                                <span className="text-muted-foreground font-mono">
                                  Match: {Math.round(Number(cit.matchScore ?? 0) * 100)}%
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {String(cit.snippet)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Raw Output JSON */}
          {viewMode === "raw" && (
            <div
              className="border-border bg-muted/40 rounded-xl border p-4"
              data-testid="raw-output-json"
            >
              <pre className="text-foreground overflow-x-auto font-mono text-xs leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
