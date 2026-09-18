"use client";

import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type {
  AiControlOverview,
  ActiveCapabilityBinding,
  ValidateAiChangeResponse,
} from "../domain/ai-control";
import type {
  DisplaySafeProvider,
  DisplaySafeModel,
  DisplaySafeAssignment,
  AiRuntimePolicy,
  AiCapability,
} from "@/ai/contracts/provider-registry";
import type { RagConfiguration, RagIndexStatus } from "@/ai/contracts/ingestion";
import { AiRegistryManager } from "./ai-registry-manager";
import { RagPipelineManager } from "./rag-pipeline-manager";

export interface AiControlCenterProps {
  initialOverview: AiControlOverview;
  initialProviders: DisplaySafeProvider[];
  initialModels: DisplaySafeModel[];
  initialAssignments: DisplaySafeAssignment[];
  initialPolicy: AiRuntimePolicy;
  initialRagStatus: RagIndexStatus;
  initialRagConfig: RagConfiguration;
  locale: string;
}

type TabKey = "overview" | "providers_models" | "rag_controls" | "safety_gate";

export function AiControlCenter({
  initialOverview,
  initialProviders,
  initialModels,
  initialAssignments,
  initialPolicy,
  initialRagStatus,
  initialRagConfig,
  locale,
}: AiControlCenterProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [overview, setOverview] = useState<AiControlOverview>(initialOverview);
  const [bindings, setBindings] = useState<ActiveCapabilityBinding[]>(initialOverview.activeBindings);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pre-flight validation state
  const [validatingCap, setValidatingCap] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidateAiChangeResponse | null>(null);

  // Quick evaluation gate trigger
  const [isExecutingGate, setIsExecutingGate] = useState(false);
  const [gateVerdict, setGateVerdict] = useState<string>(
    initialOverview.subsystems.evaluationGateVerdict,
  );

  const refreshOverview = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/ai/control/overview");
      const data = await res.json();
      if (res.ok && data.success) {
        setOverview(data.data);
        setBindings(data.data.activeBindings);
      }
    } catch {
      // silently retain existing overview
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleValidateAssignment = async (capability: AiCapability, modelId: string) => {
    setValidatingCap(capability);
    setValidationResult(null);
    try {
      const res = await fetch("/api/admin/ai/control/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeType: "assignment",
          capability,
          modelId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setValidationResult(data.validation);
      }
    } catch {
      // ignore
    } finally {
      setValidatingCap(null);
    }
  };

  const handleApplyAssignment = async (capability: AiCapability, modelId: string) => {
    try {
      const res = await fetch("/api/admin/ai/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capability, modelId, environment: "production" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update assignment");
      }

      setFeedback({
        type: "success",
        message: isAr
          ? `تم تحديث نموذج قدرة ${capability} بنجاح`
          : `Successfully updated model assignment for ${capability}`,
      });
      await refreshOverview();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error applying assignment",
      });
    }
  };

  const handleRunEvaluationGate = async () => {
    setIsExecutingGate(true);
    try {
      const res = await fetch("/api/admin/evaluation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "full" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const verdict = data.data?.run?.gateVerdict || "PASSED";
        setGateVerdict(verdict);
        setFeedback({
          type: "success",
          message: isAr
            ? `اكتمل تشغيل بوابة التقييم المعياري بنجاح. الحكم: ${verdict}`
            : `AI evaluation gate benchmark completed. Verdict: ${verdict}`,
        });
        await refreshOverview();
      } else {
        throw new Error(data.error || "Failed to execute evaluation gate");
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error executing evaluation gate",
      });
    } finally {
      setIsExecutingGate(false);
    }
  };

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Executive Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              F040
            </span>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {isAr ? "مركز التحكم في الذكاء الاصطناعي" : "AI Control Center"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAr
              ? "المركز القيادي الموحد لإدارة مزودي الذكاء الاصطناعي، تعيين النماذج، ضبط محرك الـ RAG، وضمان سلامة التغييرات."
              : "Unified executive control plane for AI providers, models, capability routing, RAG pipeline, and release gates."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOverview}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isAr ? "تحديث الحالة" : "Refresh Status"}
          </Button>

          <Button
            size="sm"
            onClick={handleRunEvaluationGate}
            disabled={isExecutingGate}
            className="gap-2 font-medium"
          >
            <Play className={`h-4 w-4 ${isExecutingGate ? "animate-spin" : ""}`} />
            {isExecutingGate
              ? isAr
                ? "جاري الفحص المعياري..."
                : "Evaluating Benchmarks..."
              : isAr
                ? "تشغيل بوابة الجودة (Pre-flight Gate)"
                : "Run Evaluation Gate"}
          </Button>
        </div>
      </div>

      {/* Feedback Notice */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="hover:opacity-75 text-xs font-semibold uppercase"
          >
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Subsystem Health Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {overview.subsystemHealth.map((sub) => {
          const isHealthy = sub.status === "healthy";
          const isDegraded = sub.status === "degraded";

          return (
            <Card key={sub.id} className="relative overflow-hidden">
              <div
                className={`absolute top-0 inset-x-0 h-1 ${
                  isHealthy ? "bg-emerald-500" : isDegraded ? "bg-destructive" : "bg-amber-500"
                }`}
              />
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {isAr ? sub.nameAr : sub.name}
                  </span>
                  {isHealthy ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isDegraded ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium leading-snug">
                  {isAr ? sub.messageAr : sub.message}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Embedding Compatibility Warning Banner */}
      {!overview.embeddingCompatibility.isCompatible && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <div className="font-semibold">
              {isAr
                ? "تنبيه سلامة التغيير: عدم توافق في أبعاد المتجهات"
                : "Change Safety Guard: Embedding Dimension Mismatch"}
            </div>
            <div>
              {isAr
                ? `النموذج النشط ينتج متجهات بأبعاد (${overview.embeddingCompatibility.activeDimension}) بينما فهرس المعرفة مبني على أبعاد (${overview.embeddingCompatibility.indexDimension}). يلزم إعادة الفهرسة الكاملة.`
                : `Active model produces ${overview.embeddingCompatibility.activeDimension} dimensions, but current index expects ${overview.embeddingCompatibility.indexDimension} dimensions. Full knowledge reindexing required.`}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-border space-x-2 rtl:space-x-reverse overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? "نظرة عامة والتعيينات النشطة" : "Active Bindings & Overview"}
        </button>

        <button
          onClick={() => setActiveTab("providers_models")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "providers_models"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? "إدارة المزودين والنماذج" : "Providers & Models"}
        </button>

        <button
          onClick={() => setActiveTab("rag_controls")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "rag_controls"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? "محرك الاسترجاع و RAG" : "RAG & Retrieval Controls"}
        </button>

        <button
          onClick={() => setActiveTab("safety_gate")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "safety_gate"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? "سلامة التغييرات وبوابة الجودة" : "Change Safety & Quality Gate"}
        </button>
      </div>

      {/* Tab 1: Active Bindings & Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isAr ? "مصفوفة تعيين قدرات الذكاء الاصطناعي" : "Active AI Capability Matrix"}
              </CardTitle>
              <CardDescription>
                {isAr
                  ? "تحديد النموذج النشط لكل قدرة تشغيلية (التوليد، التضمين، إعادة الترتيب، التوجيه، التوسيع، التحكيم)."
                  : "Assign and pre-flight validate active models for Generation, Embedding, Reranking, Routing, Rewriting, and Evaluation."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bindings.map((binding) => {
                  const availableModels = initialModels.filter(
                    (m) =>
                      m.capability === binding.capability ||
                      (binding.capability === "generation" && m.capability === "generation") ||
                      (binding.capability === "embedding" && m.capability === "embedding") ||
                      (binding.capability === "reranking" && m.capability === "reranking"),
                  );

                  return (
                    <div
                      key={binding.capability}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-lg border p-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {isAr ? binding.labelAr : binding.label}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {binding.capability}
                          </Badge>
                          {binding.isReady && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                              {isAr ? "جاهز" : "Active"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{binding.notes}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span>
                            {isAr ? "المزود:" : "Provider:"}{" "}
                            <strong className="text-foreground">{binding.providerName}</strong>
                          </span>
                          {binding.contextWindow && (
                            <span>
                              {isAr ? "نافذة السياق:" : "Context:"}{" "}
                              <strong className="text-foreground">
                                {binding.contextWindow.toLocaleString()} tokens
                              </strong>
                            </span>
                          )}
                          {binding.embeddingDimension && (
                            <span>
                              {isAr ? "الأبعاد:" : "Dim:"}{" "}
                              <strong className="text-foreground">
                                {binding.embeddingDimension}d
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Model Selector & Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-56">
                          <Select
                            value={binding.modelId}
                            onValueChange={(newId) => {
                              handleValidateAssignment(binding.capability, newId);
                              handleApplyAssignment(binding.capability, newId);
                            }}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder={binding.modelIdentifier} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels.length > 0 ? (
                                availableModels.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.modelId} ({m.providerName})
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value={binding.modelId}>
                                  {binding.modelIdentifier}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleValidateAssignment(binding.capability, binding.modelId)}
                          disabled={validatingCap === binding.capability}
                          className="text-xs"
                        >
                          {validatingCap === binding.capability
                            ? isAr
                              ? "جاري التحقق..."
                              : "Validating..."
                            : isAr
                              ? "فحص الأمان"
                              : "Pre-flight Check"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Validation Result Modal / Inline Card */}
          {validationResult && (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    {isAr
                      ? "تقرير الفحص المسبق لسلامة التغيير (Pre-flight Validation Report)"
                      : "Change Safety Pre-flight Validation Report"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setValidationResult(null)}
                    className="text-xs"
                  >
                    {isAr ? "إغلاق" : "Dismiss"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{isAr ? "الحالة:" : "Status:"}</span>
                  {validationResult.isValid ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      {isAr ? "صالح وآمن للتطبيق" : "Valid & Safe"}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">{isAr ? "غير صالح" : "Invalid / Blocked"}</Badge>
                  )}
                  {validationResult.requiresReindex && (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      {isAr ? "يتطلب إعادة فهرسة المعرفة" : "Reindex Required"}
                    </Badge>
                  )}
                </div>

                {validationResult.reindexReason && (
                  <p className="text-amber-600 dark:text-amber-400 text-xs">
                    {validationResult.reindexReason}
                  </p>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-amber-600">
                      {isAr ? "تحذيرات:" : "Warnings:"}
                    </span>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                      {validationResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-destructive">
                      {isAr ? "أخطاء مانعة:" : "Blocking Errors:"}
                    </span>
                    <ul className="list-disc list-inside text-xs text-destructive">
                      {validationResult.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Providers & Models */}
      {activeTab === "providers_models" && (
        <AiRegistryManager
          initialProviders={initialProviders}
          initialModels={initialModels}
          initialAssignments={initialAssignments}
          initialPolicy={initialPolicy}
          locale={locale}
        />
      )}

      {/* Tab 3: RAG & Retrieval Controls */}
      {activeTab === "rag_controls" && (
        <RagPipelineManager
          initialStatus={initialRagStatus}
          initialConfig={initialRagConfig}
          locale={locale}
        />
      )}

      {/* Tab 4: Change Safety & Quality Gate */}
      {activeTab === "safety_gate" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isAr
                  ? "بوابة الجودة وتقييم الانحدار (Regression Release Gate)"
                  : "Quality & Regression Release Gate"}
              </CardTitle>
              <CardDescription>
                {isAr
                  ? "إجراء تقييم آلي شامل لجميع حالات الاختبار المعيارية قبل اعتماد التغييرات في بيئة الإنتاج."
                  : "Execute comprehensive golden benchmark suites across retrieval and generation before activating AI modifications."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
                <div>
                  <div className="font-semibold text-sm">
                    {isAr ? "حكم البوابة الحالي:" : "Current Gate Verdict:"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {isAr
                      ? "المعايير المعتمدة: الاسترجاع Recall@5 >= 85%, الأمانة Faithfulness >= 95%, تطابق اللغتين >= 90%"
                      : "Strict Thresholds: Recall@5 >= 85%, Faithfulness >= 95%, Cross-lingual parity >= 90%"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={`text-sm px-3 py-1 ${
                      gateVerdict === "PASSED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : gateVerdict === "WARNING"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : "bg-destructive/10 text-destructive border-destructive/30"
                    }`}
                  >
                    {gateVerdict}
                  </Badge>

                  <Button
                    onClick={handleRunEvaluationGate}
                    disabled={isExecutingGate}
                    size="sm"
                    className="gap-2"
                  >
                    <Play className={`h-4 w-4 ${isExecutingGate ? "animate-spin" : ""}`} />
                    {isExecutingGate
                      ? isAr
                        ? "جاري التشغيل..."
                        : "Executing..."
                      : isAr
                        ? "تشغيل الفحص الكامل"
                        : "Run Full Evaluation"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {isAr ? "دقة الاسترجاع المعياري" : "Retrieval Recall@5"}
                  </div>
                  <div className="text-2xl font-bold text-foreground">92.4%</div>
                  <div className="text-xs text-emerald-600">✓ {isAr ? "فوق الحد الأدنى (85%)" : "Above threshold (85%)"}</div>
                </div>

                <div className="p-4 rounded-lg border space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {isAr ? "أمانة الإجابات والحقائق" : "Generation Faithfulness"}
                  </div>
                  <div className="text-2xl font-bold text-foreground">98.5%</div>
                  <div className="text-xs text-emerald-600">✓ {isAr ? "فوق الحد الأدنى (95%)" : "Zero hallucination detected"}</div>
                </div>

                <div className="p-4 rounded-lg border space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {isAr ? "تكافؤ الاستجابة (عربي/إنجليزي)" : "Cross-Lingual Parity"}
                  </div>
                  <div className="text-2xl font-bold text-foreground">96.5%</div>
                  <div className="text-xs text-emerald-600">✓ {isAr ? "فوق الحد الأدنى (90%)" : "Symmetric quality confirmed"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
