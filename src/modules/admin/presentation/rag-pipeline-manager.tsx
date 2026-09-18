"use client";

import { useState, useTransition } from "react";
import { RagConfiguration, RagIndexStatus } from "@/ai/contracts/ingestion";
import { ScoredCandidate, RetrievalTelemetry } from "@/ai/contracts/retrieval";
import {
  RerankedCandidate,
  RerankTelemetry as RerankerTelemetryContract,
} from "@/ai/contracts/reranker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RagDebugTelemetry } from "@/ai/contracts/rag-debug";
import { RagDebugModal } from "@/modules/chat/presentation";

interface RagPipelineManagerProps {
  initialStatus: RagIndexStatus;
  initialConfig: RagConfiguration;
  locale: string;
}

export function RagPipelineManager({
  initialStatus,
  initialConfig,
  locale,
}: RagPipelineManagerProps) {
  const isAr = locale === "ar";
  const [status, setStatus] = useState<RagIndexStatus>(initialStatus);
  const [config, setConfig] = useState<RagConfiguration>(initialConfig);
  const [forceReindex, setForceReindex] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state for config updates
  const [chunkSize, setChunkSize] = useState(config.chunkSize);
  const [chunkOverlap, setChunkOverlap] = useState(config.chunkOverlap);
  const [topK, setTopK] = useState(config.topK);
  const [rerankTopN, setRerankTopN] = useState(config.rerankTopN);
  const [rerankThreshold, setRerankThreshold] = useState(config.rerankThreshold);
  const [hybridAlpha, setHybridAlpha] = useState(config.hybridAlpha);
  const [contextTokenBudget, setContextTokenBudget] = useState(config.contextTokenBudget);

  // Hybrid search playground state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"hybrid" | "dense" | "sparse">("hybrid");
  const [searchLocale, setSearchLocale] = useState<"all" | "ar" | "en">("all");
  const [searchResults, setSearchResults] = useState<ScoredCandidate[] | null>(null);
  const [searchTelemetry, setSearchTelemetry] = useState<RetrievalTelemetry | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Reranking playground state
  const [rerankResults, setRerankResults] = useState<RerankedCandidate[] | null>(null);
  const [rerankTelemetry, setRerankTelemetry] = useState<RerankerTelemetryContract | null>(null);
  const [isReranking, setIsReranking] = useState(false);
  const [rerankError, setRerankError] = useState<string | null>(null);
  // Full RAG Debug Trace state (F036)
  const [debugQuery, setDebugQuery] = useState("");
  const [debugMode, setDebugMode] = useState<"general" | "recruiter" | "technical">("general");
  const [debugTelemetry, setDebugTelemetry] = useState<RagDebugTelemetry | null>(null);
  const [debugAnswer, setDebugAnswer] = useState<string | null>(null);
  const [isDebugRunning, setIsDebugRunning] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRunDebugTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debugQuery.trim()) return;

    setIsDebugRunning(true);
    setDebugError(null);
    setDebugAnswer(null);

    try {
      const res = await fetch("/api/admin/rag/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: debugQuery,
          mode: debugMode,
          locale: isAr ? "ar" : "en",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setDebugError(data.error ?? "RAG debug trace failed");
      } else {
        setDebugTelemetry(data.data.telemetry);
        setDebugAnswer(data.data.answer);
      }
    } catch (err) {
      setDebugError(err instanceof Error ? err.message : "RAG debug trace error");
    } finally {
      setIsDebugRunning(false);
    }
  };

  const handleRerank = async () => {
    if (!searchResults || searchResults.length === 0) return;
    setIsReranking(true);
    setRerankError(null);

    try {
      const res = await fetch("/api/admin/ai/rerank/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          candidates: searchResults,
          topN: rerankTopN,
          minThreshold: rerankThreshold,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRerankError(data.error ?? "Reranking failed");
      } else {
        setRerankResults(data.result.candidates ?? []);
        setRerankTelemetry(data.result.telemetry ?? null);
      }
    } catch (err) {
      setRerankError(err instanceof Error ? err.message : "Reranking error");
    } finally {
      setIsReranking(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/admin/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          mode: searchMode,
          locale: searchLocale === "all" ? undefined : searchLocale,
          topK: 10,
          rrfK: 60,
          candidateCap: 10,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error ?? "Search failed");
      } else {
        setSearchResults(data.candidates ?? []);
        setSearchTelemetry(data.telemetry ?? null);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search error");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/rag/status");
      if (res.ok) {
        const data = (await res.json()) as { status: RagIndexStatus };
        setStatus(data.status);
      }
    } catch {
      // Ignore poll error
    }
  };

  const handleTriggerIngestion = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/rag/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ forceReindex }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
          processedDocuments?: number;
          chunksIndexed?: number;
          skippedDocuments?: number;
        };

        if (!res.ok || !data.success) {
          setMessage({
            text: data.error ?? (isAr ? "فشلت عملية المزامنة" : "Ingestion failed"),
            type: "error",
          });
        } else {
          setMessage({
            text: isAr
              ? `اكتملت المزامنة بنجاح: تمت معالجة ${data.processedDocuments} وثيقة، وفهرسة ${data.chunksIndexed} مقطع، وتخطي ${data.skippedDocuments} وثيقة غير متغيرة.`
              : `Ingestion completed successfully: ${data.processedDocuments} documents processed, ${data.chunksIndexed} chunks indexed, ${data.skippedDocuments} unchanged skipped.`,
            type: "success",
          });
          await fetchStatus();
        }
      } catch (err) {
        setMessage({
          text: err instanceof Error ? err.message : "Network error",
          type: "error",
        });
      }
    });
  };

  const handleSaveConfig = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/rag/config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunkSize,
            chunkOverlap,
            topK,
            rerankTopN,
            rerankThreshold,
            hybridAlpha,
            contextTokenBudget,
          }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          config?: RagConfiguration;
          error?: string;
        };

        if (!res.ok || !data.success || !data.config) {
          setMessage({
            text: data.error ?? (isAr ? "فشل حفظ الإعدادات" : "Failed to save configuration"),
            type: "error",
          });
        } else {
          setConfig(data.config);
          setMessage({
            text: isAr ? "تم حفظ إعدادات RAG بنجاح" : "RAG configuration saved successfully",
            type: "success",
          });
        }
      } catch (err) {
        setMessage({
          text: err instanceof Error ? err.message : "Network error",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-8" id="rag-pipeline-manager">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {isAr ? "منظومة الاسترجاع المعزز (RAG Pipeline)" : "RAG Knowledge Pipeline"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAr
            ? "إدارة الفهرسة الدلالية واستخراج المعارف ومزامنة المتجهات لقاعدة بيانات Qdrant."
            : "Manage semantic indexing, knowledge extraction, and vector synchronization for Qdrant."}
        </p>
      </div>

      {/* Global Message Alert */}
      {message && (
        <div
          id="rag-alert-banner"
          className={`rounded-lg p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          } border`}
        >
          {message.text}
        </div>
      )}

      {/* Index Status & Telemetry Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              {isAr ? "إصدار الفهرس النشط" : "Active Index Version"}
            </CardDescription>
            <CardTitle className="text-primary font-mono text-lg">
              {status.activeVersionTag ?? "None"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-xs">
              {isAr ? "أبعاد المتجه:" : "Dimension:"}{" "}
              <span className="text-foreground font-semibold">{status.denseDimension}-d</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              {isAr ? "نموذج التضمين المتجهي" : "Embedding Model"}
            </CardDescription>
            <CardTitle className="text-foreground truncate font-mono text-base">
              {status.embeddingModel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-xs">
              {isAr ? "متعدد اللغات (عربي/إنجليزي)" : "Multilingual (AR/EN)"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              {isAr ? "الوثائق المفهرسة" : "Indexed Documents"}
            </CardDescription>
            <CardTitle className="text-foreground text-2xl font-bold">
              {status.totalDocuments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-xs">
              {isAr ? "مشاريع وسيرة ذاتية وأقسام" : "Projects, CV, Sections"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              {isAr ? "المقاطع الدلالية (Chunks)" : "Indexed Chunks"}
            </CardDescription>
            <CardTitle className="text-foreground text-2xl font-bold">
              {status.totalChunks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-xs">
              {isAr ? "متجهات نشطة في Qdrant" : "Active vectors in store"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Execution Section */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {isAr ? "مزامنة واستخراج المعارف (Ingestion Sync)" : "Knowledge Ingestion & Sync"}
          </CardTitle>
          <CardDescription>
            {isAr
              ? "يقوم بتطبيع المحتوى، وتفكيكه دلالياً إلى مقاطع، واستخراج التضمينات وتحديث المتجهات في Qdrant."
              : "Normalizes authoritative content, generates semantic chunks, computes embeddings, and syncs vector points."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
              <input
                id="force-reindex-checkbox"
                type="checkbox"
                checked={forceReindex}
                onChange={(e) => setForceReindex(e.target.checked)}
                className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
              />
              <span>
                {isAr
                  ? "إعادة فهرسة إجبارية لجميع الوثائق (تجاوز فحص البصمة)"
                  : "Force full reindex (bypass hash cache)"}
              </span>
            </label>

            <Button
              id="trigger-ingestion-button"
              onClick={handleTriggerIngestion}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending
                ? isAr
                  ? "جارٍ المعالجة والفهرسة..."
                  : "Processing & Indexing..."
                : isAr
                  ? "بدء مزامنة الفهرس الآن"
                  : "Trigger Ingestion Now"}
            </Button>
          </div>

          {status.lastIngestionJob && (
            <div className="border-border bg-muted/40 mt-4 space-y-1 rounded-lg border p-4 text-xs">
              <div className="text-foreground font-semibold">
                {isAr ? "آخر عملية مزامنة:" : "Last Ingestion Run:"}
              </div>
              <div className="text-muted-foreground">
                {isAr ? "الحالة:" : "Status:"}{" "}
                <span className="text-foreground font-mono uppercase">
                  {status.lastIngestionJob.status}
                </span>{" "}
                | {isAr ? "الوثائق:" : "Documents:"}{" "}
                <span className="text-foreground font-mono">
                  {status.lastIngestionJob.processedDocuments} /{" "}
                  {status.lastIngestionJob.totalDocuments}
                </span>{" "}
                | {isAr ? "بدأت:" : "Started:"}{" "}
                <span>{new Date(status.lastIngestionJob.startedAt).toLocaleString(locale)}</span>
              </div>
              {status.lastIngestionJob.errorMessage && (
                <div className="text-destructive mt-1 font-mono">
                  Error: {status.lastIngestionJob.errorMessage}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RAG Configuration Settings */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {isAr ? "إعدادات منظومة RAG والتقطيع" : "RAG Chunking & Retrieval Configuration"}
          </CardTitle>
          <CardDescription>
            {isAr
              ? "تخصيص حدود التقطيع الدلالي، والتداخل، وسياسة الاسترجاع الهجين."
              : "Fine-tune semantic chunk sizes, boundary overlap, and hybrid retrieval thresholds."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="rag-chunk-size"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "حجم المقطع المستهدف (رموز / Tokens)" : "Chunk Size (Target Tokens)"}
              </label>
              <input
                id="rag-chunk-size"
                type="number"
                min={64}
                max={2048}
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value) || 512)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rag-chunk-overlap"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "تداخل المقاطع (رموز / Tokens)" : "Chunk Overlap (Tokens)"}
              </label>
              <input
                id="rag-chunk-overlap"
                type="number"
                min={0}
                max={512}
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 64)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rag-top-k"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "عدد المرشحين الأولي (Dense Top K)" : "Dense Candidates (Top K)"}
              </label>
              <input
                id="rag-top-k"
                type="number"
                min={1}
                max={50}
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rag-rerank-top-n"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "عدد النتائج بعد إعادة الترتيب (Rerank Top N)" : "Rerank Top N"}
              </label>
              <input
                id="rag-rerank-top-n"
                type="number"
                min={1}
                max={20}
                value={rerankTopN}
                onChange={(e) => setRerankTopN(parseInt(e.target.value) || 5)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rag-rerank-threshold"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "حد قبول إعادة الترتيب (Threshold)" : "Rerank Minimum Score"}
              </label>
              <input
                id="rag-rerank-threshold"
                type="number"
                step="0.05"
                min={0.0}
                max={1.0}
                value={rerankThreshold}
                onChange={(e) => setRerankThreshold(parseFloat(e.target.value) || 0.3)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rag-hybrid-alpha"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr
                  ? "معامل البحث الهجين (Hybrid Alpha)"
                  : "Hybrid Search Alpha (Dense / Sparse)"}
              </label>
              <input
                id="rag-hybrid-alpha"
                type="number"
                step="0.05"
                min={0.0}
                max={1.0}
                value={hybridAlpha}
                onChange={(e) => setHybridAlpha(parseFloat(e.target.value) || 0.5)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rag-context-budget"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "ميزانية سياق النموذج (Context Tokens)" : "Context Token Budget"}
              </label>
              <input
                id="rag-context-budget"
                type="number"
                min={500}
                max={16000}
                value={contextTokenBudget}
                onChange={(e) => setContextTokenBudget(parseInt(e.target.value) || 3000)}
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button id="save-rag-config-button" onClick={handleSaveConfig} disabled={isPending}>
              {isPending
                ? isAr
                  ? "جارٍ الحفظ..."
                  : "Saving..."
                : isAr
                  ? "حفظ إعدادات RAG"
                  : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hybrid Retrieval Playground */}
      <Card id="rag-playground-card" className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">
            {isAr
              ? "تجربة واختبار البحث الهجين (Hybrid Retrieval Playground)"
              : "Hybrid Retrieval Playground"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {isAr
              ? "اختبر البحث الدلالي (Dense)، والبحث اللفظي (Sparse BM25)، وخوارزمية الدمج بالرتب المتبادلة (RRF) لحظياً."
              : "Test dense semantic search, sparse BM25 lexical search, and reciprocal rank fusion in real-time."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="rag-search-query-input"
                className="text-foreground mb-1 block text-xs font-semibold"
              >
                {isAr ? "نص الاستعلام (Query)" : "Search Query"}
              </label>
              <input
                id="rag-search-query-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? "اكتب سؤالاً أو كلمات مفتاحية مثل: ما هي خبرات أنس في الذكاء الاصطناعي؟"
                    : "Enter a question or keywords e.g. What are Anas's AI projects?"
                }
                className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="rag-search-mode-select"
                  className="text-foreground mb-1 block text-xs font-semibold"
                >
                  {isAr ? "نمط البحث (Retrieval Mode)" : "Retrieval Mode"}
                </label>
                <select
                  id="rag-search-mode-select"
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as "hybrid" | "dense" | "sparse")}
                  className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="hybrid">
                    {isAr ? "بحث هجين (Hybrid Dense + Sparse RRF)" : "Hybrid (Dense + Sparse RRF)"}
                  </option>
                  <option value="dense">
                    {isAr ? "بحث دلالي فقط (Dense Vector Only)" : "Dense Only (Vector / BGE-M3)"}
                  </option>
                  <option value="sparse">
                    {isAr ? "بحث لفظي فقط (Sparse BM25 Only)" : "Sparse Only (Lexical BM25)"}
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rag-search-locale-select"
                  className="text-foreground mb-1 block text-xs font-semibold"
                >
                  {isAr ? "تصفية اللغة (Locale Filter)" : "Locale Filter"}
                </label>
                <select
                  id="rag-search-locale-select"
                  value={searchLocale}
                  onChange={(e) => setSearchLocale(e.target.value as "all" | "ar" | "en")}
                  className="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="all">{isAr ? "جميع اللغات" : "All Locales"}</option>
                  <option value="ar">{isAr ? "العربية فقط (ar)" : "Arabic Only (ar)"}</option>
                  <option value="en">{isAr ? "الإنجليزية فقط (en)" : "English Only (en)"}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                id="rag-search-submit-button"
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching
                  ? isAr
                    ? "جارٍ البحث والدمج..."
                    : "Searching & Fusing..."
                  : isAr
                    ? "تشغيل البحث الهجين"
                    : "Run Retrieval"}
              </Button>
            </div>
          </form>

          {searchError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {searchError}
            </div>
          )}

          {searchTelemetry && (
            <div
              id="rag-search-telemetry"
              className="bg-muted/40 grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-4"
            >
              <div>
                <div className="text-muted-foreground text-xs">
                  {isAr ? "المرشحون الدلاليون" : "Dense Candidates"}
                </div>
                <div className="font-mono text-sm font-semibold">
                  {searchTelemetry.denseCandidateCount} ({searchTelemetry.denseLatencyMs}ms)
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">
                  {isAr ? "المرشحون اللفظيون" : "Sparse Candidates"}
                </div>
                <div className="font-mono text-sm font-semibold">
                  {searchTelemetry.sparseCandidateCount} ({searchTelemetry.sparseLatencyMs}ms)
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">
                  {isAr ? "النتائج المدمجة" : "Fused Results"}
                </div>
                <div className="font-mono text-sm font-semibold">
                  {searchTelemetry.fusedCandidateCount} ({searchTelemetry.fusionLatencyMs}ms)
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">
                  {isAr ? "إجمالي زمن الاستجابة" : "Total Latency"}
                </div>
                <div className="text-primary font-mono text-sm font-semibold">
                  {searchTelemetry.totalLatencyMs}ms
                </div>
              </div>
            </div>
          )}

          {searchResults && (
            <div className="space-y-3">
              <h4 className="text-foreground text-sm font-semibold">
                {isAr
                  ? `النتائج المسترجعة (${searchResults.length})`
                  : `Retrieved Candidates (${searchResults.length})`}
              </h4>

              {searchResults.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center text-xs">
                  {isAr
                    ? "لم يتم العثور على أي مقاطع تطابق معايير البحث."
                    : "No matching chunks found for this query."}
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="border-border bg-background space-y-2 rounded-lg border p-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono font-bold">
                          #{item.rank}
                        </span>
                        <span className="text-foreground font-semibold">{item.title}</span>
                        <span className="bg-muted text-muted-foreground font-mono">
                          {item.citationId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${
                            item.retrieverType === "hybrid"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : item.retrieverType === "dense"
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {item.retrieverType}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          Score: {item.score.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-3 font-mono text-[10px]">
                      <span>Source: {item.sourceType}</span>
                      <span>Locale: {item.locale}</span>
                      {item.denseRank !== undefined && <span>Dense Rank: #{item.denseRank}</span>}
                      {item.sparseRank !== undefined && (
                        <span>Sparse Rank: #{item.sparseRank}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {searchResults.length > 0 && (
                <div className="border-border/60 bg-muted/20 space-y-4 rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-foreground text-sm font-semibold">
                        {isAr ? "إعادة الترتيب بنموذج BGE Reranker" : "BGE Cross-Encoder Reranking"}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {isAr
                          ? `إعادة تسجيل المقاطع بناءً على التطابق العابر (Top ${rerankTopN}, Threshold: ${rerankThreshold})`
                          : `Rerank candidates using cross-encoder scoring (Top ${rerankTopN}, Threshold: ${rerankThreshold})`}
                      </p>
                    </div>
                    <Button
                      id="rag-rerank-submit-button"
                      type="button"
                      variant="outline"
                      disabled={isReranking}
                      onClick={handleRerank}
                    >
                      {isReranking
                        ? isAr
                          ? "جارٍ إعادة الترتيب..."
                          : "Reranking..."
                        : isAr
                          ? "تشغيل BGE Reranker"
                          : "Run BGE Reranker"}
                    </Button>
                  </div>

                  {rerankError && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                      {rerankError}
                    </div>
                  )}

                  {rerankTelemetry && (
                    <div className="bg-background/80 grid grid-cols-2 gap-3 rounded-lg border p-3 text-xs sm:grid-cols-4">
                      <div>
                        <div className="text-muted-foreground">{isAr ? "النموذج" : "Model"}</div>
                        <div className="truncate font-mono font-semibold">
                          {rerankTelemetry.rerankerModel}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          {isAr ? "زمن الاستجابة" : "Latency"}
                        </div>
                        <div className="text-primary font-mono font-semibold">
                          {rerankTelemetry.latencyMs}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          {isAr ? "المرشحون بعد التصفية" : "Selected"}
                        </div>
                        <div className="font-mono font-semibold">
                          {rerankTelemetry.outputCandidateCount} /{" "}
                          {rerankTelemetry.inputCandidateCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          {isAr ? "الاستراتيجية" : "Strategy"}
                        </div>
                        <div className="font-mono font-semibold capitalize">
                          {rerankTelemetry.strategy}
                        </div>
                      </div>
                    </div>
                  )}

                  {rerankResults && (
                    <div className="space-y-2">
                      <h5 className="text-foreground text-xs font-semibold">
                        {isAr
                          ? `النتائج بعد إعادة الترتيب (${rerankResults.length})`
                          : `Reranked Candidates (${rerankResults.length})`}
                      </h5>
                      {rerankResults.length === 0 ? (
                        <div className="text-muted-foreground py-3 text-center text-xs">
                          {isAr
                            ? "لم يتجاوز أي مقطع حد الملاءمة المطلوب."
                            : "No candidates passed the relevance threshold."}
                        </div>
                      ) : (
                        rerankResults.map((item) => (
                          <div
                            key={item.id}
                            className="border-primary/20 bg-background space-y-2 rounded-lg border p-3 text-xs shadow-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  #{item.rerankRank}
                                </span>
                                {item.previousRank && (
                                  <span className="text-muted-foreground text-[10px] line-through">
                                    (was #{item.previousRank})
                                  </span>
                                )}
                                <span className="text-foreground font-semibold">{item.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  Rerank Score: {item.rerankScore.toFixed(4)}
                                </span>
                                {item.rawRerankScore !== undefined && (
                                  <span className="text-muted-foreground font-mono text-[10px]">
                                    (raw: {item.rawRerankScore})
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full RAG Pipeline Trace & Engineering Telemetry (F036) */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg">
              {isAr ? "تتبع خط معالجة RAG المباشر (F036)" : "Live RAG Pipeline Trace (F036)"}
            </CardTitle>
            <span className="bg-primary/15 text-primary rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
              Admin Trace
            </span>
          </div>
          <CardDescription>
            {isAr
              ? "تشغيل استعلام كامل عبر موجه الاستعلام، الاسترجاع الهجين، إعادة الترتيب، حزم السياق والتوليد مع فحص أزمنة المراحل."
              : "Execute an end-to-end query through routing, hybrid retrieval, reranking, context packing, and grounded generation."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRunDebugTrace} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={debugQuery}
                onChange={(e) => setDebugQuery(e.target.value)}
                placeholder={
                  isAr
                    ? "أدخل سؤالاً تجريبياً (مثال: ما هي خبراتك في النماذج اللغوية؟)"
                    : "Enter test query (e.g. What is your experience with LLMs?)"
                }
                className="bg-background border-border placeholder:text-muted-foreground focus:ring-primary/40 flex-1 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                data-testid="admin-rag-debug-input"
              />
              <select
                value={debugMode}
                onChange={(e) =>
                  setDebugMode(e.target.value as "general" | "recruiter" | "technical")
                }
                className="bg-background border-border rounded-md border px-3 py-2 text-sm focus:outline-none"
                data-testid="admin-rag-debug-mode-select"
              >
                <option value="general">General Mode</option>
                <option value="recruiter">Recruiter Mode</option>
                <option value="technical">Technical Mode</option>
              </select>
              <Button
                type="submit"
                disabled={isDebugRunning || !debugQuery.trim()}
                data-testid="admin-rag-debug-submit"
              >
                {isDebugRunning
                  ? isAr
                    ? "جارٍ التتبع..."
                    : "Tracing..."
                  : isAr
                    ? "تشغيل التتبع"
                    : "Run Trace"}
              </Button>
            </div>
          </form>

          {debugError && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-xs">
              {debugError}
            </div>
          )}

          {debugTelemetry && (
            <div className="space-y-4 border-t border-border pt-4" data-testid="admin-rag-debug-results">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                <div className="bg-muted/40 border-border/70 rounded-lg border p-2.5">
                  <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                    {isAr ? "إجمالي الزمن" : "Total Latency"}
                  </div>
                  <div className="text-foreground font-mono text-base font-bold mt-1">
                    {debugTelemetry.latencies.totalMs} ms
                  </div>
                </div>

                <div className="bg-muted/40 border-border/70 rounded-lg border p-2.5">
                  <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                    {isAr ? "المسار المعتمد" : "Route"}
                  </div>
                  <div className="text-foreground font-semibold truncate mt-1" title={debugTelemetry.routeLabel}>
                    {debugTelemetry.routeId}
                  </div>
                </div>

                <div className="bg-muted/40 border-border/70 rounded-lg border p-2.5">
                  <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                    {isAr ? "رموز السياق" : "Tokens"}
                  </div>
                  <div className="text-foreground font-mono text-base font-bold mt-1">
                    {debugTelemetry.tokenCount} tok
                  </div>
                </div>

                <div className="bg-muted/40 border-border/70 rounded-lg border p-2.5">
                  <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                    {isAr ? "المرشحون / المختارون" : "Candidates / Chunks"}
                  </div>
                  <div className="text-foreground font-mono text-base font-bold mt-1">
                    {debugTelemetry.rerankedCount} / {debugTelemetry.selectedChunksCount}
                  </div>
                </div>

                <div className="bg-muted/40 border-border/70 rounded-lg border p-2.5 col-span-2 sm:col-span-1">
                  <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                    {isAr ? "حالة الإسناد" : "Grounding"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 font-semibold">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        debugTelemetry.validationState.isValid ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <span className="text-xs">
                      {debugTelemetry.validationState.isValid ? "Grounded" : "Insufficient"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Latencies Waterfall Preview */}
              <div className="bg-muted/30 border-border/60 rounded-lg border p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span>{isAr ? "مخطط أزمنة المراحل" : "Stage Latencies Breakdown"}</span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary hover:underline flex items-center gap-1 text-[11px] font-medium"
                    data-testid="admin-open-modal-btn"
                  >
                    🔍 {isAr ? "عرض نافذة التتبع التفصيلية" : "Open Full Trace Modal"}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-[11px] text-center pt-1">
                  <div className="bg-background/80 rounded p-1.5 border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Routing</div>
                    <div className="font-bold">{debugTelemetry.latencies.routingMs}ms</div>
                  </div>
                  <div className="bg-background/80 rounded p-1.5 border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Rewrite</div>
                    <div className="font-bold">{debugTelemetry.latencies.rewriteMs}ms</div>
                  </div>
                  <div className="bg-background/80 rounded p-1.5 border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Retrieval</div>
                    <div className="font-bold">{debugTelemetry.latencies.retrievalMs}ms</div>
                  </div>
                  <div className="bg-background/80 rounded p-1.5 border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Rerank</div>
                    <div className="font-bold">{debugTelemetry.latencies.rerankingMs}ms</div>
                  </div>
                  <div className="bg-background/80 rounded p-1.5 border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Context</div>
                    <div className="font-bold">{debugTelemetry.latencies.contextMs}ms</div>
                  </div>
                  <div className="bg-background/80 rounded p-1.5 border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Gen</div>
                    <div className="font-bold">{debugTelemetry.latencies.generationMs}ms</div>
                  </div>
                </div>
              </div>

              {/* Answer Preview */}
              {debugAnswer && (
                <div className="bg-background border-border rounded-lg border p-3 text-xs space-y-1">
                  <div className="text-muted-foreground font-semibold text-[10px] uppercase">
                    {isAr ? "الإجابة المولدة" : "Generated Answer"}
                  </div>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{debugAnswer}</p>
                </div>
              )}

              {/* Trace Modal */}
              <RagDebugModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                telemetry={debugTelemetry}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
