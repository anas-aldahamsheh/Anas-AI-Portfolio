"use client";

import { useState } from "react";
import {
  Database,
  Trash2,
  RefreshCw,
  Search,
  Activity,
  Layers,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { CacheStats, CacheKeySummary, SystemCacheTag } from "@/lib/cache/cache-types";

export interface CacheManagerProps {
  initialStats: CacheStats;
  initialKeys: CacheKeySummary[];
  locale: string;
}

const KNOWN_TAGS: {
  key: SystemCacheTag;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
}[] = [
  {
    key: "content",
    labelEn: "Content & Sections",
    labelAr: "المحتوى والأقسام",
    descEn: "Dynamic pages, sections, blocks, and UI text copy.",
    descAr: "الصفحات الديناميكية والأقسام والكتل ونصوص الواجهة.",
  },
  {
    key: "projects",
    labelEn: "Projects Catalog",
    labelAr: "كتالوج المشاريع",
    descEn: "Project lists, deep-dive narratives, and translations.",
    descAr: "قوائم المشاريع، السرد المعماري، والترجمات.",
  },
  {
    key: "cv",
    labelEn: "CV & Resumes",
    labelAr: "السيرة الذاتية",
    descEn: "Published CV version, download payloads, and metadata.",
    descAr: "نسخ السيرة الذاتية المنشورة وملفات التنزيل والبيانات.",
  },
  {
    key: "ai",
    labelEn: "AI Registry",
    labelAr: "سجل الذكاء الاصطناعي",
    descEn: "Providers, active model bindings, and runtime policies.",
    descAr: "المزودون، ربط النماذج الفعالة، وسياسات التشغيل.",
  },
  {
    key: "prompts",
    labelEn: "Prompt Templates",
    labelAr: "قوالب التوجيهات",
    descEn: "Active prompt templates, system instructions, and variables.",
    descAr: "قوالب التوجيهات الفعالة، تعليمات النظام، والمتغيرات.",
  },
  {
    key: "rag",
    labelEn: "RAG & Vectors",
    labelAr: "فهرسة المعرفة (RAG)",
    descEn: "Knowledge chunks, status telemetry, and vector store indices.",
    descAr: "قطع المعرفة، القياسات الآنية، ومؤشرات قاعدة المتجهات.",
  },
  {
    key: "social",
    labelEn: "Social Profiles",
    labelAr: "الملفات الاجتماعية",
    descEn: "GitHub, LinkedIn, and social popover link data.",
    descAr: "بيانات GitHub و LinkedIn ونوافذ الروابط الاجتماعية.",
  },
  {
    key: "feature_flags",
    labelEn: "Feature Flags",
    labelAr: "رايات الميزات",
    descEn: "Feature toggles and canary percentage rollouts.",
    descAr: "تبديل الميزات ونسب الإطلاق التدريجي.",
  },
  {
    key: "eval",
    labelEn: "AI Evaluation",
    labelAr: "تقييم الذكاء الاصطناعي",
    descEn: "Golden benchmark datasets, metrics, and regression runs.",
    descAr: "مجموعات البيانات القياسية والقياسات واختبارات الانحدار.",
  },
];

export function CacheManager({ initialStats, initialKeys, locale }: CacheManagerProps) {
  const isAr = locale === "ar";
  const [stats, setStats] = useState<CacheStats>(initialStats);
  const [keys, setKeys] = useState<CacheKeySummary[]>(initialKeys);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [invalidatingTag, setInvalidatingTag] = useState<string | null>(null);
  const [isFlushingAll, setIsFlushingAll] = useState(false);
  const [showFlushConfirm, setShowFlushConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const fetchLatest = async () => {
    try {
      const res = await fetch("/api/admin/cache");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setKeys(data.keys);
        }
      }
    } catch {
      // Ignore network glitch
    }
  };

  const handleInvalidateTag = async (tag: string) => {
    setInvalidatingTag(tag);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: [tag] }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تفريغ وسم "${tag}" بنجاح (${data.invalidatedCount} مفتاح).`
            : `Successfully invalidated tag "${tag}" (${data.invalidatedCount} keys).`,
        });
        await fetchLatest();
      } else {
        setFeedback({
          type: "error",
          message: data.error || (isAr ? "فشل تفريغ الذاكرة" : "Failed to invalidate tag"),
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: String(err),
      });
    } finally {
      setInvalidatingTag(null);
    }
  };

  const handleInvalidateKey = async (key: string) => {
    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: [key] }),
      });

      if (res.ok) {
        await fetchLatest();
      }
    } catch {
      // Silently handle
    }
  };

  const handleFlushAll = async () => {
    setIsFlushingAll(true);
    setShowFlushConfirm(false);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/cache/flush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تفريغ كامل الذاكرة المؤقتة بنجاح (${data.flushedCount} مفتاح).`
            : `All cache flushed successfully (${data.flushedCount} keys).`,
        });
        await fetchLatest();
      } else {
        setFeedback({
          type: "error",
          message: data.error || (isAr ? "فشل تفريغ الذاكرة" : "Failed to flush cache"),
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: String(err),
      });
    } finally {
      setIsFlushingAll(false);
    }
  };

  const filteredKeys = keys.filter((k) => {
    const matchesTag = selectedTag === "all" || k.tags.includes(selectedTag);
    const matchesSearch =
      searchQuery === "" ||
      k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {isAr ? "ذاكرة التخزين المؤقت وتفريغها" : "Caching & Invalidation"}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              F043
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAr
              ? "استراتيجية الذاكرة المؤقتة متعددة الوسوم مع تفريغ فوري ومراقبة معدل الإصابة."
              : "Tag and key-based multi-tier caching with instant invalidation and hit rate telemetry."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLatest} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isAr ? "تحديث الآن" : "Refresh"}</span>
          </Button>

          {showFlushConfirm ? (
            <div className="animate-in fade-in flex items-center gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleFlushAll}
                disabled={isFlushingAll}
                className="gap-1.5 text-xs"
              >
                {isFlushingAll ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                <span>{isAr ? "تأكيد التفريغ الشامل" : "Confirm Flush All"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFlushConfirm(false)}
                className="text-xs"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowFlushConfirm(true)}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isAr ? "تفريغ شامل" : "Flush All Caches"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent className="space-y-1 p-4">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-xs font-medium">{isAr ? "المفاتيح النشطة" : "Total Keys"}</span>
              <Database className="text-primary h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{stats.totalKeys}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 p-4">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-xs font-medium">{isAr ? "معدل الإصابة" : "Hit Rate"}</span>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold">{(stats.hitRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 p-4">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-xs font-medium">{isAr ? "إصابات ناجحة" : "Total Hits"}</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.hits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 p-4">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-xs font-medium">
                {isAr ? "إخفاقات الذاكرة" : "Cache Misses"}
              </span>
              <Flame className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-muted-foreground text-2xl font-bold">{stats.misses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 p-4">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-xs font-medium">{isAr ? "الوسوم النشطة" : "Active Tags"}</span>
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.tagsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Invalidation Grid */}
      <div className="space-y-4">
        <h2 className="text-foreground text-base font-semibold">
          {isAr ? "تفريغ حسب الوسم المعماري" : "Tag-Based Cache Invalidation"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KNOWN_TAGS.map((tag) => {
            const count = stats.tagDistribution[tag.key] || 0;
            const isInvalidating = invalidatingTag === tag.key;

            return (
              <Card key={tag.key} className="hover:border-primary/30 transition-all">
                <CardContent className="flex h-full flex-col justify-between space-y-3 p-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground text-sm font-semibold">
                        {isAr ? tag.labelAr : tag.labelEn}
                      </span>
                      <Badge variant={count > 0 ? "default" : "secondary"} className="text-xs">
                        {count} {isAr ? "عنصر" : "items"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {isAr ? tag.descAr : tag.descEn}
                    </p>
                  </div>

                  <div className="border-border flex items-center justify-between border-t pt-2">
                    <span className="text-muted-foreground font-mono text-xs">#{tag.key}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInvalidateTag(tag.key)}
                      disabled={isInvalidating || count === 0}
                      className="h-7 gap-1.5 text-xs"
                    >
                      {isInvalidating ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="text-muted-foreground h-3 w-3" />
                      )}
                      <span>{isAr ? "تفريغ الوسم" : "Purge Tag"}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Keys Explorer Table */}
      <Card>
        <CardHeader className="border-border flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            {isAr ? "مستكشف المفاتيح المخزنة" : "Cached Keys Inspector"}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="text-muted-foreground absolute start-2.5 top-2.5 h-3.5 w-3.5" />
              <Input
                placeholder={isAr ? "بحث في المفاتيح أو الوسوم..." : "Search keys or tags..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 ps-8 text-xs"
              />
            </div>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border-input bg-background h-8 rounded-md border px-2.5 text-xs"
            >
              <option value="all">{isAr ? "جميع الوسوم" : "All Tags"}</option>
              {KNOWN_TAGS.map((t) => (
                <option key={t.key} value={t.key}>
                  {isAr ? t.labelAr : t.labelEn}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-border border-b">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">
                    {isAr ? "المفتاح" : "Cache Key"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الوسوم" : "Tags"}</th>
                  <th className="px-4 py-3 text-start font-medium">
                    {isAr ? "الوقت المتبقي" : "TTL Remaining"}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    {isAr ? "مرات الإصابة" : "Hits"}
                  </th>
                  <th className="px-4 py-3 text-end font-medium">{isAr ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredKeys.length > 0 ? (
                  filteredKeys.map((item) => (
                    <tr key={item.key} className="hover:bg-muted/20 transition-colors">
                      <td className="text-foreground max-w-xs truncate px-4 py-3 font-mono">
                        {item.key}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((t) => (
                            <Badge key={t} variant="outline" className="px-1.5 py-0 text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 font-mono">
                        {Math.ceil(item.ttlRemainingMs / 1000)}s
                      </td>
                      <td className="text-foreground px-4 py-3 font-semibold">{item.hits}</td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInvalidateKey(item.key)}
                          className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                          title={isAr ? "حذف المفتاح" : "Delete key"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground p-8 text-center">
                      {isAr
                        ? "لا توجد مفاتيح مخزنة تطابق معايير البحث."
                        : "No cached keys found matching the criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
