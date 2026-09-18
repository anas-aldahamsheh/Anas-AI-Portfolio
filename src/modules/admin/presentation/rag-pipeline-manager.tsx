"use client";

import { useState, useTransition } from "react";
import { RagConfiguration, RagIndexStatus } from "@/ai/contracts/ingestion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    </div>
  );
}
