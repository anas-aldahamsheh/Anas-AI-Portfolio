"use client";

import { useState } from "react";
import {
  ToggleLeft,
  ToggleRight,
  Search,
  Sparkles,
  Shield,
  Layout,
  Gauge,
  FlaskConical,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { FeatureFlag } from "../domain/feature-flags";

export interface FeatureFlagManagerProps {
  initialFlags: FeatureFlag[];
  locale: string;
}

export function FeatureFlagManager({ initialFlags, locale }: FeatureFlagManagerProps) {
  const isAr = locale === "ar";
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const handleToggle = async (flag: FeatureFlag) => {
    setTogglingKey(flag.key);
    setFeedback(null);
    const newEnabled = !flag.isEnabled;

    try {
      const res = await fetch(`/api/admin/feature-flags/${encodeURIComponent(flag.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: flag.key,
          isEnabled: newEnabled,
          description: flag.description,
          targetRolloutPercentage: flag.targetRolloutPercentage ?? (newEnabled ? 100 : 0),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update feature flag");
      }

      setFlags((prev) =>
        prev.map((f) =>
          f.key === flag.key
            ? {
                ...f,
                isEnabled: newEnabled,
                targetRolloutPercentage: newEnabled ? 100 : 0,
                updatedAt: new Date().toISOString(),
              }
            : f,
        ),
      );

      setFeedback({
        type: "success",
        message: isAr
          ? `تم ${newEnabled ? "تفعيل" : "تعطيل"} راية الميزة '${flag.key}' بنجاح`
          : `Feature flag '${flag.key}' has been ${newEnabled ? "enabled" : "disabled"}.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error updating flag",
      });
    } finally {
      setTogglingKey(null);
    }
  };

  const handleRolloutChange = async (flag: FeatureFlag, percentage: number) => {
    try {
      const res = await fetch(`/api/admin/feature-flags/${encodeURIComponent(flag.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: flag.key,
          isEnabled: percentage > 0,
          description: flag.description,
          targetRolloutPercentage: percentage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update rollout");

      setFlags((prev) =>
        prev.map((f) =>
          f.key === flag.key
            ? {
                ...f,
                isEnabled: percentage > 0,
                targetRolloutPercentage: percentage,
                updatedAt: new Date().toISOString(),
              }
            : f,
        ),
      );
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error updating rollout",
      });
    }
  };

  const categories: {
    key: string;
    labelEn: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "all", labelEn: "All Flags", labelAr: "جميع الرايات", icon: Sliders },
    { key: "ai", labelEn: "AI & RAG", labelAr: "الذكاء الاصطناعي", icon: Sparkles },
    { key: "security", labelEn: "Security", labelAr: "الأمان", icon: Shield },
    { key: "ui", labelEn: "UI & Admin", labelAr: "واجهة المستخدم", icon: Layout },
    { key: "performance", labelEn: "Performance", labelAr: "الأداء", icon: Gauge },
    { key: "experimental", labelEn: "Experimental", labelAr: "تجريبي", icon: FlaskConical },
  ];

  const filteredFlags = flags.filter((f) => {
    if (selectedCategory !== "all" && f.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.key.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
  });

  const activeCount = flags.filter((f) => f.isEnabled).length;
  const canaryCount = flags.filter(
    (f) => f.isEnabled && (f.targetRolloutPercentage ?? 100) < 100,
  ).length;

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded px-2.5 py-1 text-xs font-bold tracking-wider uppercase">
              F042
            </span>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {isAr ? "إدارة رايات الميزات (Feature Flags)" : "Feature Flag Manager"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAr
              ? "التحكم في تفعيل وتعطيل قدرات النظام والإطلاق التدريجي (Canary) دون الحاجة لتعديل الكود أو إعادة النشر."
              : "Dynamically control platform features, canary percentage rollouts, and killswitches without redeployment."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="gap-1 text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {isAr ? `${activeCount} مفعل` : `${activeCount} Active`}
          </Badge>
          {canaryCount > 0 && (
            <Badge variant="outline" className="gap-1 border-amber-500/30 text-xs text-amber-600">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              {isAr ? `${canaryCount} إطلاق تدريجي` : `${canaryCount} Canary`}
            </Badge>
          )}
        </div>
      </div>

      {/* Feedback message */}
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
            className="text-xs font-semibold uppercase hover:opacity-75"
          >
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Toolbar: Category tabs and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-border flex flex-wrap gap-1 border-b sm:border-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <Button
                key={cat.key}
                variant={isSelected ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat.key)}
                className="gap-1.5 text-xs"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </Button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute start-3 top-2.5 h-4 w-4" />
          <Input
            placeholder={isAr ? "بحث في الرايات..." : "Search flags..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 text-xs"
          />
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {filteredFlags.length > 0 ? (
          filteredFlags.map((flag) => {
            const isToggling = togglingKey === flag.key;
            const rollout = flag.targetRolloutPercentage ?? (flag.isEnabled ? 100 : 0);
            const isCanary = flag.isEnabled && rollout < 100;

            return (
              <Card key={flag.key} className="hover:border-primary/30 transition-all">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-mono text-sm font-semibold">
                        {flag.key}
                      </span>
                      <Badge variant="outline" className="text-xs uppercase">
                        {flag.category}
                      </Badge>
                      {flag.isEnabled ? (
                        isCanary ? (
                          <Badge className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400">
                            {isAr ? `تدريجي (${rollout}%)` : `Canary (${rollout}%)`}
                          </Badge>
                        ) : (
                          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400">
                            {isAr ? "مفعل 100%" : "Active 100%"}
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground text-xs">
                          {isAr ? "معطل" : "Disabled"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {flag.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {/* Canary percentage slider if enabled */}
                    {flag.isEnabled && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {isAr ? "نسبة الإطلاق:" : "Rollout:"}
                        </span>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={rollout}
                          onChange={(e) => handleRolloutChange(flag, Number(e.target.value))}
                          className="accent-primary w-24 cursor-pointer"
                        />
                        <span className="w-8 text-end font-mono font-medium">{rollout}%</span>
                      </div>
                    )}

                    {/* On/Off Toggle Button */}
                    <Button
                      variant={flag.isEnabled ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleToggle(flag)}
                      disabled={isToggling}
                      className="min-w-28 gap-2 text-xs font-medium"
                    >
                      {isToggling ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : flag.isEnabled ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="text-muted-foreground h-4 w-4" />
                      )}
                      <span>
                        {flag.isEnabled ? (isAr ? "مفعل" : "Enabled") : isAr ? "معطل" : "Disabled"}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-muted-foreground p-8 text-center text-sm">
              {isAr
                ? "لا توجد رايات ميزات مطابقة للفئة أو البحث المحدد."
                : "No feature flags match the selected category or search filter."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
