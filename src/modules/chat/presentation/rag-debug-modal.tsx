"use client";

import { useEffect } from "react";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { RagDebugTelemetry } from "@/ai/contracts";

export interface RagDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: RagDebugTelemetry;
}

export function RagDebugModal({ isOpen, onClose, telemetry }: RagDebugModalProps) {
  const { t, dir } = useLocalization();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const latencies = telemetry.latencies;
  const maxStageMs = Math.max(
    latencies.routingMs,
    latencies.rewriteMs,
    latencies.retrievalMs,
    latencies.rerankingMs,
    latencies.contextMs,
    latencies.generationMs,
    1,
  );

  const stages = [
    {
      id: "routing",
      name: t("chat.debug.routing"),
      durationMs: latencies.routingMs,
      details: telemetry.routeLabel,
      color: "bg-blue-500",
    },
    {
      id: "rewrite",
      name: t("chat.debug.rewrite"),
      durationMs: latencies.rewriteMs,
      details: `${telemetry.rewriteCount} rewritten queries`,
      color: "bg-indigo-500",
    },
    {
      id: "retrieval",
      name: t("chat.debug.retrieval"),
      durationMs: latencies.retrievalMs,
      details: `${telemetry.retrievalMethod} (${telemetry.retrievedCount} candidates)`,
      color: "bg-cyan-500",
    },
    {
      id: "reranking",
      name: t("chat.debug.reranking"),
      durationMs: latencies.rerankingMs,
      details: `${telemetry.rerankedCount} candidates ranked`,
      color: "bg-amber-500",
    },
    {
      id: "context",
      name: t("chat.debug.context"),
      durationMs: latencies.contextMs,
      details: `${telemetry.selectedChunksCount} chunks (${telemetry.tokenCount} tokens)`,
      color: "bg-emerald-500",
    },
    {
      id: "generation",
      name: t("chat.debug.generation"),
      durationMs: latencies.generationMs,
      details: `${telemetry.modelId} (${telemetry.providerType})`,
      color: "bg-purple-500",
    },
  ];

  return (
    <div
      className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      data-testid="rag-debug-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir={dir}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("chat.debug.title")}
        className="bg-card border-border animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200"
        data-testid="rag-debug-modal-container"
      >
        {/* Header */}
        <div className="border-border bg-muted/40 flex items-center justify-between border-b p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-base font-semibold">{t("chat.debug.title")}</h3>
                {telemetry.isAdminView && (
                  <span className="bg-primary/15 text-primary rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                    Admin Trace
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">{t("chat.debug.subtitle")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-2 transition-colors"
            aria-label={t("chat.debug.close")}
            data-testid="rag-debug-close-btn"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div
          className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
          data-testid="rag-debug-content"
        >
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-muted/40 border-border/70 rounded-xl border p-3">
              <div className="text-muted-foreground text-[11px] font-medium">
                {t("chat.debug.latency")}
              </div>
              <div className="text-foreground mt-1 font-mono text-lg font-bold">
                {latencies.totalMs} <span className="text-xs font-normal">ms</span>
              </div>
            </div>

            <div className="bg-muted/40 border-border/70 rounded-xl border p-3">
              <div className="text-muted-foreground text-[11px] font-medium">
                {t("chat.debug.tokens")}
              </div>
              <div className="text-foreground mt-1 font-mono text-lg font-bold">
                {telemetry.tokenCount} <span className="text-xs font-normal">tok</span>
              </div>
            </div>

            <div className="bg-muted/40 border-border/70 rounded-xl border p-3">
              <div className="text-muted-foreground text-[11px] font-medium">
                {t("chat.debug.route_id")}
              </div>
              <div
                className="text-foreground mt-1 truncate text-xs font-semibold"
                title={telemetry.routeId}
              >
                {telemetry.routeId}
              </div>
            </div>

            <div className="bg-muted/40 border-border/70 rounded-xl border p-3">
              <div className="text-muted-foreground text-[11px] font-medium">
                {t("chat.debug.valid")}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    telemetry.validationState.isValid ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-foreground text-xs font-semibold">
                  {telemetry.validationState.isValid
                    ? t("chat.debug.valid.grounded")
                    : t("chat.debug.valid.insufficient")}
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Stages Waterfall */}
          <div className="space-y-3" data-testid="rag-debug-stages-section">
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              {t("chat.debug.stages")}
            </h4>

            <div className="bg-muted/30 border-border/60 space-y-3 rounded-xl border p-3.5 sm:p-4">
              {stages.map((stg) => {
                const percent = Math.min(
                  100,
                  Math.max(4, Math.round((stg.durationMs / maxStageMs) * 100)),
                );
                return (
                  <div key={stg.id} className="space-y-1" data-testid={`rag-stage-${stg.id}`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">{stg.name}</span>
                        <span className="text-muted-foreground hidden text-[11px] sm:inline">
                          • {stg.details}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-mono font-semibold">
                        {stg.durationMs} ms
                      </span>
                    </div>

                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${stg.color} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspected Sources & Chunks */}
          <div className="space-y-3" data-testid="rag-debug-sources-section">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
                {t("chat.debug.sources")}
              </h4>
              <span className="text-muted-foreground text-xs">
                {telemetry.sources.length} {telemetry.sources.length === 1 ? "source" : "sources"}
              </span>
            </div>

            {telemetry.sources.length === 0 ? (
              <div className="bg-muted/20 border-border/50 text-muted-foreground rounded-xl border p-4 text-center text-xs">
                No sources required for this query.
              </div>
            ) : (
              <div className="space-y-2">
                {telemetry.sources.map((src, idx) => (
                  <div
                    key={src.id || idx}
                    className="bg-muted/30 border-border/60 hover:bg-muted/50 rounded-xl border p-3 transition-colors"
                    data-testid={`rag-source-item-${idx}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="bg-primary/10 text-primary shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-foreground truncate text-xs font-semibold">
                          {src.title}
                        </span>
                        <span className="text-muted-foreground bg-muted shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase">
                          {src.sourceType}
                        </span>
                      </div>

                      {src.score !== undefined && (
                        <span className="text-muted-foreground shrink-0 font-mono text-xs">
                          Score: {src.score}
                        </span>
                      )}
                    </div>

                    {src.snippet && (
                      <p className="text-muted-foreground/90 mt-2 line-clamp-2 text-xs leading-relaxed">
                        {src.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Model & Operational Info */}
          <div className="bg-muted/20 border-border/50 text-muted-foreground space-y-1.5 rounded-xl border p-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px]">
              <div>
                <span className="text-foreground font-semibold">Model:</span> {telemetry.modelId}
              </div>
              <div>
                <span className="text-foreground font-semibold">Provider:</span>{" "}
                {telemetry.providerType}
              </div>
              <div>
                <span className="text-foreground font-semibold">Mode:</span>{" "}
                {telemetry.conversationMode}
              </div>
              <div>
                <span className="text-foreground font-semibold">Language:</span>{" "}
                {telemetry.language} ({telemetry.direction})
              </div>
            </div>

            <p className="border-border/40 border-t pt-2 text-[11px] leading-relaxed italic">
              🔒 {t("chat.debug.safety_notice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
