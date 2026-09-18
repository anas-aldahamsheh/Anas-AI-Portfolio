"use client";

import { useState } from "react";
import { PromptSummary, PromptDetail, PromptDiff } from "@/ai/contracts/prompt-registry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  FileCode,
  GitCompare,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Clock,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { extractVariables } from "@/ai/prompts/prompt-template";

export interface PromptRegistryManagerProps {
  initialPrompts: PromptSummary[];
  locale: string;
}

type TabType = "current" | "history" | "new_version" | "compare" | "test";

export function PromptRegistryManager({ initialPrompts, locale }: PromptRegistryManagerProps) {
  const isArabic = locale === "ar";

  const [prompts, setPrompts] = useState<PromptSummary[]>(initialPrompts);
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialPrompts[0]?.slug || "chat_system",
  );
  const [activeTab, setActiveTab] = useState<TabType>("current");

  // Selected prompt full details
  const [detail, setDetail] = useState<PromptDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New version form state
  const [newSystemPrompt, setNewSystemPrompt] = useState("");
  const [newUserTemplate, setNewUserTemplate] = useState("");
  const [newChangelog, setNewChangelog] = useState("");
  const [newMakeActive, setNewMakeActive] = useState(true);
  const [savingVersion, setSavingVersion] = useState(false);

  // Compare versions state
  const [compareV1, setCompareV1] = useState<number>(1);
  const [compareV2, setCompareV2] = useState<number>(1);
  const [diffResult, setDiffResult] = useState<PromptDiff | null>(null);
  const [comparing, setComparing] = useState(false);

  // Tester state
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testRenderedSystem, setTestRenderedSystem] = useState<string | null>(null);
  const [testRenderedUser, setTestRenderedUser] = useState<string | null>(null);
  const [testMissingVars, setTestMissingVars] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  // Feedback messages
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch full details when prompt is selected or reloaded
  const loadPromptDetail = async (slug: string) => {
    setLoadingDetail(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/prompts/${slug}`);
      if (res.ok) {
        const data = await res.json();
        const pDetail: PromptDetail = data.prompt;
        setDetail(pDetail);

        // Prepopulate new version draft from current active
        if (pDetail.activeVersion) {
          setNewSystemPrompt(pDetail.activeVersion.systemPrompt);
          setNewUserTemplate(pDetail.activeVersion.userTemplate || "");
          setNewChangelog("");
          setNewMakeActive(true);

          // Setup compare defaults
          const v0 = pDetail.versions[0];
          const v1 = pDetail.versions[1];
          if (pDetail.versions.length >= 2 && v0 && v1) {
            setCompareV1(v1.versionNumber);
            setCompareV2(v0.versionNumber);
          } else {
            setCompareV1(pDetail.activeVersion.versionNumber);
            setCompareV2(pDetail.activeVersion.versionNumber);
          }

          // Setup test variables placeholders
          const vars = extractVariables(
            `${pDetail.activeVersion.systemPrompt} ${pDetail.activeVersion.userTemplate || ""}`,
          );
          const initialVars: Record<string, string> = {};
          vars.forEach((v) => {
            initialVars[v] = `[Sample ${v}]`;
          });
          setTestVariables(initialVars);
          setTestRenderedSystem(null);
          setTestRenderedUser(null);
          setTestMissingVars([]);
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: isArabic ? "فشل تحميل تفاصيل التوجيه" : "Failed to load prompt details",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Initial load on first render
  useState(() => {
    if (selectedSlug) {
      loadPromptDetail(selectedSlug);
    }
  });

  const handleSelectPrompt = (slug: string) => {
    setSelectedSlug(slug);
    loadPromptDetail(slug);
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSystemPrompt.trim()) return;

    setSavingVersion(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/prompts/${selectedSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: newSystemPrompt,
          userTemplate: newUserTemplate || null,
          changelog: newChangelog || null,
          makeActive: newMakeActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create version");
      }

      setFeedback({
        type: "success",
        message: isArabic
          ? `تم إنشاء الإصدار v${data.version.versionNumber} بنجاح`
          : `Successfully created version v${data.version.versionNumber}`,
      });

      // Reload list and details
      await loadPromptDetail(selectedSlug);
      const listRes = await fetch("/api/admin/prompts");
      if (listRes.ok) {
        const listData = await listRes.json();
        setPrompts(listData.prompts);
      }

      setActiveTab("current");
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error creating version",
      });
    } finally {
      setSavingVersion(false);
    }
  };

  const handleRollback = async (versionNumber: number) => {
    const confirmMessage = isArabic
      ? `هل أنت متأكد من تفعيل الإصدار v${versionNumber} لهذا التوجيه؟`
      : `Are you sure you want to rollback to version v${versionNumber}?`;

    if (!window.confirm(confirmMessage)) return;

    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/prompts/${selectedSlug}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Rollback failed");
      }

      setFeedback({
        type: "success",
        message: isArabic
          ? `تم استرجاع وتفعيل الإصدار v${versionNumber} بنجاح`
          : `Successfully rolled back to version v${versionNumber}`,
      });

      await loadPromptDetail(selectedSlug);
      const listRes = await fetch("/api/admin/prompts");
      if (listRes.ok) {
        const listData = await listRes.json();
        setPrompts(listData.prompts);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Rollback failed",
      });
    }
  };

  const handleRunCompare = async () => {
    setComparing(true);
    setDiffResult(null);
    try {
      const res = await fetch(
        `/api/admin/prompts/${selectedSlug}/compare?v1=${compareV1}&v2=${compareV2}`,
      );
      if (res.ok) {
        const data = await res.json();
        setDiffResult(data.diff);
      }
    } catch {
      setFeedback({
        type: "error",
        message: isArabic ? "فشل مقارنة الإصدارين" : "Failed to compare versions",
      });
    } finally {
      setComparing(false);
    }
  };

  const handleRunTest = async () => {
    if (!detail?.activeVersion) return;
    setTesting(true);

    try {
      const res = await fetch("/api/admin/prompts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: detail.activeVersion.systemPrompt,
          userTemplate: detail.activeVersion.userTemplate,
          variables: testVariables,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestRenderedSystem(data.result.renderedSystemPrompt);
        setTestRenderedUser(data.result.renderedUserPrompt);
        setTestMissingVars(data.result.missingVariables);
      }
    } catch {
      setFeedback({
        type: "error",
        message: isArabic ? "فشل اختبار القالب" : "Failed to test template",
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activePromptSummary = prompts.find((p) => p.slug === selectedSlug);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <Sparkles className="text-primary h-6 w-6" />
            <span>{isArabic ? "سجل التوجيهات الذكية" : "AI Prompt Registry"}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isArabic
              ? "إدارة وتعديل قوالب وتوجيهات الذكاء الاصطناعي مع دعم الإصدارات والاسترجاع الفوري."
              : "Authoritative registry for AI prompts with versioning, rollbacks, diffs, and live testing."}
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Prompt Selector List on side, Active Detail on main */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Prompts list */}
        <div className="space-y-3 lg:col-span-4">
          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {isArabic ? "التوجيهات المتاحة" : "Available Prompts"}
          </div>

          <div className="space-y-2">
            {prompts.map((p) => {
              const isSelected = p.slug === selectedSlug;
              return (
                <button
                  key={p.slug}
                  onClick={() => handleSelectPrompt(p.slug)}
                  className={`w-full rounded-xl border p-4 text-start transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-primary shadow-xs ring-1"
                      : "border-border bg-card hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground text-sm font-semibold">{p.name}</span>
                    <Badge variant={isSelected ? "default" : "outline"} size="sm">
                      v{p.activeVersionNumber || 1}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {p.description}
                  </div>
                  <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                    <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]">
                      {p.slug}
                    </span>
                    <span>•</span>
                    <span>
                      {p.totalVersions} {isArabic ? "إصدارات" : "versions"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Prompt Workspace */}
        <div className="lg:col-span-8">
          <div className="border-border bg-card rounded-xl border shadow-xs">
            {/* Workspace Header */}
            <div className="border-border flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-foreground text-lg font-bold">
                    {activePromptSummary?.name || selectedSlug}
                  </h2>
                  <Badge variant="secondary" size="sm" className="font-mono text-xs">
                    {selectedSlug}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {activePromptSummary?.description}
                </p>
              </div>

              {detail?.activeVersion && (
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm" className="gap-1.5">
                    <Check className="h-3 w-3" />
                    <span>Active: v{detail.activeVersion.versionNumber}</span>
                  </Badge>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="border-border bg-muted/30 flex flex-wrap gap-1 border-b px-4 pt-3">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "current"
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{isArabic ? "الإصدار النشط" : "Active Version"}</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>{isArabic ? "سجل الإصدارات" : "Version History"}</span>
                {detail && (
                  <span className="bg-muted text-muted-foreground py-0.2 rounded-full px-1.5 text-[10px]">
                    {detail.versions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("new_version")}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "new_version"
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{isArabic ? "إصدار جديد" : "Draft Version"}</span>
              </button>

              <button
                onClick={() => setActiveTab("compare")}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "compare"
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span>{isArabic ? "مقارنة" : "Compare"}</span>
              </button>

              <button
                onClick={() => setActiveTab("test")}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "test"
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isArabic ? "اختبار القالب" : "Template Tester"}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {loadingDetail ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  {isArabic ? "جارٍ التحميل..." : "Loading prompt details..."}
                </div>
              ) : (
                <>
                  {/* TAB: Current Version */}
                  {activeTab === "current" && (
                    <div className="space-y-6">
                      {detail?.activeVersion ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {isArabic ? "تاريخ الإصدار:" : "Version date:"}{" "}
                                {new Date(detail.activeVersion.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {detail.activeVersion.changelog && (
                              <Badge variant="outline" size="sm" className="text-xs">
                                {detail.activeVersion.changelog}
                              </Badge>
                            )}
                          </div>

                          {/* Variables List */}
                          {detail.activeVersion.variables.length > 0 && (
                            <div className="bg-muted/40 rounded-lg p-3.5">
                              <div className="text-muted-foreground mb-2 text-xs font-semibold">
                                {isArabic
                                  ? "المتغيرات المكتشفة بالقالب:"
                                  : "Detected Template Variables:"}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {detail.activeVersion.variables.map((v) => (
                                  <span
                                    key={v}
                                    className="bg-card border-border text-primary rounded-md border px-2 py-0.5 font-mono text-xs font-medium"
                                  >
                                    {`{{${v}}}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* System Prompt View */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                {isArabic ? "توجيه النظام (System Prompt)" : "System Prompt"}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    detail.activeVersion!.systemPrompt,
                                    "systemPrompt",
                                  )
                                }
                                className="text-muted-foreground h-7 gap-1 text-xs"
                              >
                                {copiedField === "systemPrompt" ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span>{isArabic ? "تم النسخ" : "Copied"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>{isArabic ? "نسخ" : "Copy"}</span>
                                  </>
                                )}
                              </Button>
                            </div>
                            <pre className="border-border bg-muted/40 text-foreground max-h-96 overflow-y-auto rounded-lg border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                              {detail.activeVersion.systemPrompt}
                            </pre>
                          </div>

                          {/* User Template View */}
                          {detail.activeVersion.userTemplate && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                  {isArabic ? "قالب المستخدم (User Template)" : "User Template"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      detail.activeVersion!.userTemplate!,
                                      "userTemplate",
                                    )
                                  }
                                  className="text-muted-foreground h-7 gap-1 text-xs"
                                >
                                  {copiedField === "userTemplate" ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-500" />
                                      <span>{isArabic ? "تم النسخ" : "Copied"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>{isArabic ? "نسخ" : "Copy"}</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                              <pre className="border-border bg-muted/40 text-foreground max-h-60 overflow-y-auto rounded-lg border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                {detail.activeVersion.userTemplate}
                              </pre>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                          {isArabic ? "لا يوجد إصدار نشط حالياً." : "No active version found."}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Version History */}
                  {activeTab === "history" && (
                    <div className="space-y-4">
                      <div className="text-muted-foreground text-xs">
                        {isArabic
                          ? "قائمة بكافة الإصدارات التاريخية مع إمكانية استرجاع أي إصدار فورياً:"
                          : "Chronological version history with one-click rollback functionality:"}
                      </div>

                      <div className="divide-border border-border divide-y rounded-lg border">
                        {detail?.versions.map((ver) => (
                          <div
                            key={ver.id}
                            className={`flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center ${
                              ver.isActive ? "bg-primary/5" : "bg-card"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm font-bold">
                                  Version {ver.versionNumber}
                                </span>
                                {ver.isActive && (
                                  <Badge variant="default" size="sm">
                                    {isArabic ? "النشط حالياً" : "Currently Active"}
                                  </Badge>
                                )}
                                <span className="text-muted-foreground text-xs">
                                  {new Date(ver.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs">
                                {ver.changelog ||
                                  (isArabic ? "لا يوجد ملخص تعديل" : "No changelog provided")}
                              </p>
                              <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                                <span>
                                  {ver.variables.length} {isArabic ? "متغيرات" : "variables"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {!ver.isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRollback(ver.versionNumber)}
                                  className="gap-1.5 text-xs"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>{isArabic ? "استرجاع هذا الإصدار" : "Rollback"}</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Draft New Version */}
                  {activeTab === "new_version" && (
                    <form onSubmit={handleCreateVersion} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          {isArabic ? "توجيه النظام (System Prompt) *" : "System Prompt *"}
                        </label>
                        <textarea
                          rows={10}
                          value={newSystemPrompt}
                          onChange={(e) => setNewSystemPrompt(e.target.value)}
                          required
                          className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border p-3 font-mono text-xs focus:ring-1 focus:outline-hidden"
                          placeholder={
                            isArabic
                              ? "أدخل نص توجيه النظام..."
                              : "Enter system prompt instructions..."
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          {isArabic ? "قالب المستخدم (User Template)" : "User Template"}
                        </label>
                        <textarea
                          rows={4}
                          value={newUserTemplate}
                          onChange={(e) => setNewUserTemplate(e.target.value)}
                          className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border p-3 font-mono text-xs focus:ring-1 focus:outline-hidden"
                          placeholder={
                            isArabic
                              ? "مثال: الاستفسار: {{user_message}}"
                              : "Optional template e.g. Question: {{user_message}}"
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          {isArabic ? "ملخص التعديلات (Changelog)" : "Changelog"}
                        </label>
                        <input
                          type="text"
                          value={newChangelog}
                          onChange={(e) => setNewChangelog(e.target.value)}
                          placeholder={
                            isArabic
                              ? "مثال: تحسين صياغة الاستشهادات باللغة العربية"
                              : "e.g. Improved citation instructions and boundary rules"
                          }
                          className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs focus:ring-1 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="makeActiveCheck"
                          checked={newMakeActive}
                          onChange={(e) => setNewMakeActive(e.target.checked)}
                          className="text-primary focus:ring-primary h-4 w-4 rounded border-neutral-300"
                        />
                        <label
                          htmlFor="makeActiveCheck"
                          className="text-foreground text-xs font-medium"
                        >
                          {isArabic
                            ? "تفعيل هذا الإصدار فوراً (Make active immediately)"
                            : "Make this version active immediately upon saving"}
                        </label>
                      </div>

                      <div className="border-border border-t pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={savingVersion || !newSystemPrompt.trim()}
                          className="gap-2 text-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            {savingVersion
                              ? isArabic
                                ? "جارٍ الحفظ..."
                                : "Saving..."
                              : isArabic
                                ? "حفظ ونشر الإصدار"
                                : "Save Version"}
                          </span>
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* TAB: Compare Versions */}
                  {activeTab === "compare" && (
                    <div className="space-y-5">
                      <div className="bg-muted/40 flex flex-wrap items-center gap-4 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs font-semibold">v1:</span>
                          <select
                            value={compareV1}
                            onChange={(e) => setCompareV1(Number(e.target.value))}
                            aria-label="Select first version to compare"
                            className="border-border bg-background text-foreground rounded-md border px-2.5 py-1.5 text-xs"
                          >
                            {detail?.versions.map((v) => (
                              <option key={v.versionNumber} value={v.versionNumber}>
                                Version {v.versionNumber}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-muted-foreground text-xs font-bold">VS</span>

                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs font-semibold">v2:</span>
                          <select
                            value={compareV2}
                            onChange={(e) => setCompareV2(Number(e.target.value))}
                            aria-label="Select second version to compare"
                            className="border-border bg-background text-foreground rounded-md border px-2.5 py-1.5 text-xs"
                          >
                            {detail?.versions.map((v) => (
                              <option key={v.versionNumber} value={v.versionNumber}>
                                Version {v.versionNumber}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRunCompare}
                          disabled={comparing}
                          className="gap-1.5 text-xs"
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                          <span>{comparing ? "Comparing..." : "Compute Diff"}</span>
                        </Button>
                      </div>

                      {diffResult && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="border-border rounded-lg border p-3">
                              <span className="text-muted-foreground font-semibold">
                                System Prompt:{" "}
                              </span>
                              <span
                                className={
                                  diffResult.systemPromptChanged
                                    ? "font-bold text-amber-600"
                                    : "text-emerald-600"
                                }
                              >
                                {diffResult.systemPromptChanged ? "Modified" : "Identical"}
                              </span>
                            </div>
                            <div className="border-border rounded-lg border p-3">
                              <span className="text-muted-foreground font-semibold">
                                User Template:{" "}
                              </span>
                              <span
                                className={
                                  diffResult.userTemplateChanged
                                    ? "font-bold text-amber-600"
                                    : "text-emerald-600"
                                }
                              >
                                {diffResult.userTemplateChanged ? "Modified" : "Identical"}
                              </span>
                            </div>
                          </div>

                          {(diffResult.addedVariables.length > 0 ||
                            diffResult.removedVariables.length > 0) && (
                            <div className="bg-muted/40 space-y-2 rounded-lg p-3 text-xs">
                              {diffResult.addedVariables.length > 0 && (
                                <div>
                                  <span className="font-bold text-emerald-600">
                                    + Added Variables:{" "}
                                  </span>
                                  {diffResult.addedVariables.join(", ")}
                                </div>
                              )}
                              {diffResult.removedVariables.length > 0 && (
                                <div>
                                  <span className="font-bold text-rose-600">
                                    - Removed Variables:{" "}
                                  </span>
                                  {diffResult.removedVariables.join(", ")}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <span className="text-muted-foreground text-xs font-bold">
                                Version {diffResult.v1Number}
                              </span>
                              <pre className="border-border bg-muted/20 text-foreground max-h-80 overflow-y-auto rounded-lg border p-3 font-mono text-[11px] whitespace-pre-wrap">
                                {diffResult.v1.systemPrompt}
                              </pre>
                            </div>

                            <div className="space-y-1">
                              <span className="text-muted-foreground text-xs font-bold">
                                Version {diffResult.v2Number}
                              </span>
                              <pre className="border-border bg-muted/20 text-foreground max-h-80 overflow-y-auto rounded-lg border p-3 font-mono text-[11px] whitespace-pre-wrap">
                                {diffResult.v2.systemPrompt}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Template Tester */}
                  {activeTab === "test" && (
                    <div className="space-y-5">
                      <div className="text-muted-foreground text-xs">
                        {isArabic
                          ? "اختبار تعويض متغيرات القالب مباشرة ومعاينة التوليد النهائي قبل التفعيل:"
                          : "Test placeholder variable substitution and preview the rendered prompt output:"}
                      </div>

                      {/* Variable inputs */}
                      <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-4">
                        <div className="text-foreground text-xs font-semibold">
                          {isArabic ? "قيم المتغيرات للاختبار:" : "Test Variable Values:"}
                        </div>

                        {Object.keys(testVariables).length === 0 ? (
                          <div className="text-muted-foreground text-xs italic">
                            {isArabic
                              ? "لا توجد متغيرات مطلوبة في هذا القالب."
                              : "No placeholder variables found in this template."}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {Object.keys(testVariables).map((varName) => (
                              <div key={varName} className="space-y-1">
                                <label className="text-muted-foreground font-mono text-[11px] font-medium">
                                  {`{{${varName}}}`}
                                </label>
                                <input
                                  type="text"
                                  value={testVariables[varName]}
                                  onChange={(e) =>
                                    setTestVariables({
                                      ...testVariables,
                                      [varName]: e.target.value,
                                    })
                                  }
                                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded border px-2.5 py-1.5 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleRunTest}
                            disabled={testing}
                            className="gap-1.5 text-xs"
                          >
                            <Play className="h-3 w-3" />
                            <span>
                              {testing
                                ? "Rendering..."
                                : isArabic
                                  ? "معاينة التوليد"
                                  : "Preview Render"}
                            </span>
                          </Button>
                        </div>
                      </div>

                      {/* Rendered Preview */}
                      {testRenderedSystem !== null && (
                        <div className="space-y-3">
                          {testMissingVars.length > 0 && (
                            <div className="rounded-lg border border-amber-500/20 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                              ⚠️ Missing variables: {testMissingVars.join(", ")}
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                              {isArabic
                                ? "النتيجة المعاينة (System Prompt):"
                                : "Rendered System Prompt:"}
                            </span>
                            <pre className="border-border bg-card text-foreground max-h-80 overflow-y-auto rounded-lg border p-4 font-mono text-xs whitespace-pre-wrap">
                              {testRenderedSystem}
                            </pre>
                          </div>

                          {testRenderedUser !== null && (
                            <div className="space-y-1.5">
                              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                {isArabic
                                  ? "النتيجة المعاينة (User Template):"
                                  : "Rendered User Template:"}
                              </span>
                              <pre className="border-border bg-card text-foreground max-h-40 overflow-y-auto rounded-lg border p-4 font-mono text-xs whitespace-pre-wrap">
                                {testRenderedUser}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
