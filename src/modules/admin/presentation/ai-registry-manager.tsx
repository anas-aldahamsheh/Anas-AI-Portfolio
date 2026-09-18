"use client";

import { useState } from "react";
import {
  Cpu,
  Server,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Play,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import type {
  DisplaySafeProvider,
  DisplaySafeModel,
  DisplaySafeAssignment,
  AiRuntimePolicy,
  AiCapability,
  AiProviderType,
  CapabilityTestResult,
} from "@/ai/contracts/provider-registry";

export interface AiRegistryManagerProps {
  initialProviders: DisplaySafeProvider[];
  initialModels: DisplaySafeModel[];
  initialAssignments: DisplaySafeAssignment[];
  initialPolicy: AiRuntimePolicy;
  locale: string;
}

type ActiveTab = "assignments" | "providers" | "models" | "policy";

export function AiRegistryManager({
  initialProviders,
  initialModels,
  initialAssignments,
  initialPolicy,
  locale,
}: AiRegistryManagerProps) {
  const { t } = useLocalization();
  const isArabic = locale === "ar";

  const [activeTab, setActiveTab] = useState<ActiveTab>("assignments");
  const [providers, setProviders] = useState<DisplaySafeProvider[]>(initialProviders);
  const [models, setModels] = useState<DisplaySafeModel[]>(initialModels);
  const [assignments, setAssignments] = useState<DisplaySafeAssignment[]>(initialAssignments);
  const [policy, setPolicy] = useState<AiRuntimePolicy>(initialPolicy);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, CapabilityTestResult>>({});

  // Add Provider Form State
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const [newProvType, setNewProvType] = useState<AiProviderType>("openai_compatible");
  const [newProvUrl, setNewProvUrl] = useState("");

  // Add Model Form State
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelProviderId, setNewModelProviderId] = useState(providers[0]?.id || "");
  const [newModelIdentifier, setNewModelIdentifier] = useState("");
  const [newModelCapability, setNewModelCapability] = useState<AiCapability>("generation");
  const [newModelContext, setNewModelContext] = useState("128000");

  const clearFeedbackLater = () => {
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Model Assignment change
  const handleAssignModel = async (capability: AiCapability, modelId: string) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/ai/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capability, modelId, environment: "production" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update assignment");
      }

      const selectedModel = models.find((m) => m.id === modelId);
      setAssignments((prev) =>
        prev.map((a) =>
          a.capability === capability
            ? {
                ...a,
                modelId,
                modelName: selectedModel?.modelId || modelId,
                providerName: selectedModel?.providerName || a.providerName,
                updatedAt: new Date().toISOString(),
              }
            : a,
        ),
      );

      setFeedback({
        type: "success",
        message: isArabic
          ? `تم تحديث نموذج ${capability} بنجاح دون الحاجة لإعادة النشر.`
          : `Active model for ${capability} updated successfully without deployment.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: (err as Error).message,
      });
    } finally {
      setIsSaving(false);
      clearFeedbackLater();
    }
  };

  // Handle Capability Testing per 19_MODEL_HEALTH_AND_CAPABILITY_CHECKS.md
  const handleTestCapability = async (model: DisplaySafeModel) => {
    setTestingModelId(model.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/ai/models/${model.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capability: model.capability }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Health check request failed");
      }

      setTestResults((prev) => ({
        ...prev,
        [model.id]: data.testResult,
      }));

      setFeedback({
        type: "success",
        message: data.testResult.message,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: (err as Error).message,
      });
    } finally {
      setTestingModelId(null);
      clearFeedbackLater();
    }
  };

  // Handle Add Provider
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName || !newProvUrl) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProvName,
          providerType: newProvType,
          baseUrl: newProvUrl,
          isEnabled: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create provider");

      setProviders((prev) => [{ ...data.provider, modelsCount: 0, activeModelsCount: 0 }, ...prev]);
      setNewProvName("");
      setNewProvUrl("");
      setShowAddProvider(false);
      setFeedback({
        type: "success",
        message: isArabic ? "تمت إضافة المزود بنجاح." : "Provider added successfully.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setIsSaving(false);
      clearFeedbackLater();
    }
  };

  // Handle Add Model
  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelIdentifier || !newModelProviderId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: newModelProviderId,
          modelId: newModelIdentifier,
          capability: newModelCapability,
          contextWindow: parseInt(newModelContext, 10) || null,
          isEnabled: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create model");

      const prov = providers.find((p) => p.id === newModelProviderId);
      const newDisplayModel: DisplaySafeModel = {
        ...data.model,
        providerName: prov?.name || "Provider",
        providerType: prov?.providerType || "custom_http",
        isCurrentlyAssigned: false,
      };

      setModels((prev) => [newDisplayModel, ...prev]);
      setNewModelIdentifier("");
      setShowAddModel(false);
      setFeedback({
        type: "success",
        message: isArabic ? "تم تسجيل النموذج بنجاح." : "Model registered successfully.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setIsSaving(false);
      clearFeedbackLater();
    }
  };

  // Handle Runtime Policy Save
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai/policy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update policy");

      setPolicy(data.policy);
      setFeedback({
        type: "success",
        message: isArabic ? "تم تحديث السياسة التشغيلية بنجاح." : "Runtime policy updated.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setIsSaving(false);
      clearFeedbackLater();
    }
  };

  const capabilitiesList: { key: AiCapability; label: string; icon: typeof Cpu }[] = [
    {
      key: "generation",
      label: t("admin.ai.capabilities.generation") || "Conversational Generation",
      icon: Sparkles,
    },
    {
      key: "embedding",
      label: t("admin.ai.capabilities.embedding") || "Multilingual Embedding",
      icon: Layers,
    },
    {
      key: "reranking",
      label: t("admin.ai.capabilities.reranking") || "Neural Reranking",
      icon: Cpu,
    },
    {
      key: "router",
      label: t("admin.ai.capabilities.router") || "Query Intent Router",
      icon: Server,
    },
    {
      key: "rewrite",
      label: t("admin.ai.capabilities.rewrite") || "Query Rewriter",
      icon: RefreshCw,
    },
    {
      key: "evaluator",
      label: t("admin.ai.capabilities.evaluator") || "Evaluation & Safety",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
            {t("admin.ai.registry.title") || "AI Provider & Model Registry"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t("admin.ai.registry.subtitle") ||
              "Configure providers, register models, and manage capability assignments dynamically."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{isArabic ? "المحرك جاهز" : "Registry Online"}</span>
          </Badge>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2.5 rounded-lg border p-3.5 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="-mb-px flex gap-4 sm:gap-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("assignments")}
            className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "assignments"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {t("admin.ai.tabs.assignments") || "Capability Assignments"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("providers")}
            className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "providers"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {t("admin.ai.tabs.providers") || "Providers"} ({providers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("models")}
            className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "models"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {t("admin.ai.tabs.models") || "Models & Verification"} ({models.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === "policy"
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {t("admin.ai.tabs.policy") || "Runtime Policy"}
          </button>
        </nav>
      </div>

      {/* TAB 1: Capability Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
            {isArabic
              ? "تعيين النماذج النشطة يتم بشكل فوري في قاعدة البيانات والذاكرة الوسيطة دون الحاجة لإعادة نشر التطبيق."
              : "Active model assignments take effect immediately across all runtime pipelines without requiring deployment or restarts."}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilitiesList.map((cap) => {
              const Icon = cap.icon;
              const assignment = assignments.find((a) => a.capability === cap.key);
              // Eligible models for this capability
              const eligibleModels = models.filter(
                (m) =>
                  m.capability === cap.key ||
                  (m.capability === "generation" &&
                    (cap.key === "router" || cap.key === "rewrite" || cap.key === "evaluator")),
              );

              return (
                <div
                  key={cap.key}
                  className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                          <Icon
                            className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="font-mono text-xs font-medium tracking-wide text-neutral-500 uppercase">
                          {cap.key}
                        </span>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {assignment?.providerName || "Assigned"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        {cap.label}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {assignment?.modelName || "No model assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <label
                      htmlFor={`assign-select-${cap.key}`}
                      className="mb-1.5 block text-[11px] font-medium text-neutral-500"
                    >
                      {isArabic ? "تغيير النموذج النشط:" : "Assign Active Model:"}
                    </label>
                    <Select
                      value={assignment?.modelId || ""}
                      onValueChange={(val) => handleAssignModel(cap.key, val)}
                      disabled={isSaving}
                    >
                      <SelectTrigger id={`assign-select-${cap.key}`} className="w-full text-xs">
                        <SelectValue placeholder="Select model..." />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleModels.map((em) => (
                          <SelectItem key={em.id} value={em.id} className="text-xs">
                            {em.modelId} ({em.providerName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Providers */}
      {activeTab === "providers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {isArabic ? "المزودون المعتمدون" : "Configured AI Providers"}
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddProvider(!showAddProvider)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{isArabic ? "إضافة مزود" : "Add Provider"}</span>
            </Button>
          </div>

          {/* Add Provider Modal / Form */}
          {showAddProvider && (
            <form
              onSubmit={handleCreateProvider}
              className="space-y-4 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {isArabic ? "تسجيل مزود ذكاء اصطناعي جديد" : "Register New AI Provider"}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "اسم المزود" : "Provider Name"}
                  </label>
                  <Input
                    value={newProvName}
                    onChange={(e) => setNewProvName(e.target.value)}
                    placeholder="e.g. Together AI Gateway"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "نوع البروتوكول" : "Provider Protocol"}
                  </label>
                  <Select
                    value={newProvType}
                    onValueChange={(val) => setNewProvType(val as AiProviderType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai_compatible">OpenAI Compatible</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="custom_http">Custom HTTP</SelectItem>
                      <SelectItem value="ollama">Ollama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "رابط نقطة النهاية (Base URL)" : "Base URL Endpoint"}
                  </label>
                  <Input
                    value={newProvUrl}
                    onChange={(e) => setNewProvUrl(e.target.value)}
                    placeholder="https://api.together.xyz/v1"
                    type="url"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddProvider(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                  {isArabic ? "حفظ المزود" : "Save Provider"}
                </Button>
              </div>
            </form>
          )}

          {/* Providers Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {providers.map((p) => (
              <div
                key={p.id}
                className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4.5 w-4.5 text-neutral-500" aria-hidden="true" />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {p.name}
                    </h3>
                  </div>
                  <Badge variant={p.isEnabled ? "default" : "secondary"} size="sm">
                    {p.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-neutral-500">
                    <span className="font-medium">Type:</span> {p.providerType}
                  </div>
                  <div className="font-mono break-all text-neutral-600 dark:text-neutral-400">
                    {p.baseUrl}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800">
                  <span>
                    {p.modelsCount} {isArabic ? "نماذج مسجلة" : "models configured"}
                  </span>
                  <span>
                    {p.activeModelsCount} {isArabic ? "نشطة" : "active roles"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Models & Verification */}
      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {isArabic
                ? "النماذج المسجلة والفحص الصحي"
                : "Registered Models & Capability Verification"}
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModel(!showAddModel)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{isArabic ? "تسجيل نموذج" : "Register Model"}</span>
            </Button>
          </div>

          {/* Add Model Form */}
          {showAddModel && (
            <form
              onSubmit={handleCreateModel}
              className="space-y-4 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {isArabic ? "تسجيل نموذج ذكاء اصطناعي جديد" : "Register New AI Model"}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "المزود" : "Target Provider"}
                  </label>
                  <Select value={newModelProviderId} onValueChange={setNewModelProviderId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "معرف النموذج" : "Model Identifier"}
                  </label>
                  <Input
                    value={newModelIdentifier}
                    onChange={(e) => setNewModelIdentifier(e.target.value)}
                    placeholder="e.g. BAAI/bge-m3"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "القدرة" : "Capability"}
                  </label>
                  <Select
                    value={newModelCapability}
                    onValueChange={(val) => setNewModelCapability(val as AiCapability)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generation">Generation</SelectItem>
                      <SelectItem value="embedding">Embedding</SelectItem>
                      <SelectItem value="reranking">Reranking</SelectItem>
                      <SelectItem value="router">Router</SelectItem>
                      <SelectItem value="rewrite">Rewrite</SelectItem>
                      <SelectItem value="evaluator">Evaluator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {isArabic ? "نافذة السياق" : "Context Window"}
                  </label>
                  <Input
                    value={newModelContext}
                    onChange={(e) => setNewModelContext(e.target.value)}
                    placeholder="128000"
                    type="number"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddModel(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                  {isArabic ? "حفظ النموذج" : "Save Model"}
                </Button>
              </div>
            </form>
          )}

          {/* Models Table */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-sm rtl:text-right">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase dark:bg-neutral-800/60 dark:text-neutral-400">
                <tr>
                  <th className="px-5 py-3.5">{isArabic ? "النموذج" : "Model ID"}</th>
                  <th className="px-5 py-3.5">{isArabic ? "المزود" : "Provider"}</th>
                  <th className="px-5 py-3.5">{isArabic ? "القدرة" : "Capability"}</th>
                  <th className="px-5 py-3.5">{isArabic ? "الحالة" : "Role Status"}</th>
                  <th className="px-5 py-3.5 text-end">
                    {isArabic ? "فحص القدرة" : "Verification"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {models.map((m) => {
                  const testResult = testResults[m.id];
                  const isTesting = testingModelId === m.id;

                  return (
                    <tr key={m.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {m.modelId}
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-600 dark:text-neutral-300">
                        {m.providerName}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" size="sm" className="font-mono text-[11px]">
                          {m.capability}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        {m.isCurrentlyAssigned ? (
                          <Badge variant="default" size="sm" className="bg-emerald-600">
                            {isArabic ? "مفعل بالإنتاج" : "Active"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-400">
                            {isArabic ? "احتياطي" : "Standby"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-end">
                        <div className="inline-flex items-center gap-2">
                          {testResult && (
                            <Badge
                              variant={testResult.success ? "secondary" : "outline"}
                              size="sm"
                              className={`gap-1 ${
                                testResult.success
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-rose-700 dark:text-rose-300"
                              }`}
                            >
                              <span>{testResult.latencyMs}ms</span>
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => handleTestCapability(m)}
                            isLoading={isTesting}
                            disabled={testingModelId !== null}
                          >
                            <Play className="h-3 w-3" aria-hidden="true" />
                            <span>
                              {isTesting
                                ? t("admin.ai.test.running") || "Testing..."
                                : t("admin.ai.test.button") || "Test"}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Runtime Policy */}
      {activeTab === "policy" && (
        <form
          onSubmit={handleSavePolicy}
          className="max-w-xl space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <Sliders className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {isArabic
                ? "إعدادات السياسة التشغيلية (Runtime Policy)"
                : "AI Runtime Policy Configuration"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="input-timeout"
                className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {isArabic ? "مهلة الاستجابة القصوى (بالملي ثانية)" : "Max Request Timeout (ms)"}
              </label>
              <div className="relative">
                <Input
                  id="input-timeout"
                  type="number"
                  min="1000"
                  max="120000"
                  value={policy.timeoutMs}
                  onChange={(e) =>
                    setPolicy({ ...policy, timeoutMs: parseInt(e.target.value, 10) || 30000 })
                  }
                  required
                />
                <Clock className="absolute end-3 top-2.5 h-4 w-4 text-neutral-400" />
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">
                {isArabic
                  ? "المهلة الافتراضية: 30,000 ملي ثانية (30 ثانية)"
                  : "Default: 30,000ms (30s)"}
              </p>
            </div>

            <div>
              <label
                htmlFor="input-retries"
                className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {isArabic
                  ? "الحد الأقصى للمحاولات عند الفشل"
                  : "Maximum Retries on Transient Failure"}
              </label>
              <Input
                id="input-retries"
                type="number"
                min="0"
                max="5"
                value={policy.maxRetries}
                onChange={(e) =>
                  setPolicy({ ...policy, maxRetries: parseInt(e.target.value, 10) || 0 })
                }
                required
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                {isArabic
                  ? "إعادة المحاولة للأخطاء المؤقتة فقط مع تراجع أسي."
                  : "Bounded retries with exponential backoff for transient errors."}
              </p>
            </div>

            <div>
              <label
                htmlFor="input-rpm"
                className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {isArabic
                  ? "الحد الأقصى للطلبات بالدقيقة (RPM)"
                  : "Rate Limit Budget (Requests per Minute)"}
              </label>
              <Input
                id="input-rpm"
                type="number"
                min="1"
                max="600"
                value={policy.rateLimitRpm}
                onChange={(e) =>
                  setPolicy({ ...policy, rateLimitRpm: parseInt(e.target.value, 10) || 30 })
                }
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              type="submit"
              size="sm"
              isLoading={isSaving}
              className="w-full"
            >
              {isArabic ? "حفظ وتطبيق السياسة" : "Apply Runtime Policy"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
