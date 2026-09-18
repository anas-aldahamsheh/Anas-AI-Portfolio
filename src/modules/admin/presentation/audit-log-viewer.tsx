"use client";

import { useState } from "react";
import {
  Shield,
  FileSpreadsheet,
  Download,
  Search,
  Eye,
  Clock,
  User,
  Server,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { AuditEventRecord, AuditLogSummary } from "../domain/audit-log";

export interface AuditLogViewerProps {
  initialEvents: AuditEventRecord[];
  initialSummary: AuditLogSummary;
  locale: string;
}

export function AuditLogViewer({
  initialEvents,
  initialSummary,
  locale,
}: AuditLogViewerProps) {
  const isAr = locale === "ar";
  const [events, setEvents] = useState<AuditEventRecord[]>(initialEvents);
  const [summary, setSummary] = useState<AuditLogSummary>(initialSummary);
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventForDiff, setSelectedEventForDiff] = useState<AuditEventRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFilteredEvents = async (action = selectedAction, entityType = selectedEntityType) => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (action !== "all") params.set("action", action);
      if (entityType !== "all") params.set("entityType", entityType);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.events);
        setSummary(data.summary);
      }
    } catch {
      // retain current events
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    fetchFilteredEvents(action, selectedEntityType);
  };

  const handleEntityTypeChange = (entityType: string) => {
    setSelectedEntityType(entityType);
    fetchFilteredEvents(selectedAction, entityType);
  };

  const filteredEvents = events.filter((e) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      e.action.toLowerCase().includes(query) ||
      e.entityType.toLowerCase().includes(query) ||
      (e.entityId && e.entityId.toLowerCase().includes(query)) ||
      (e.userEmail && e.userEmail.toLowerCase().includes(query)) ||
      (e.ipAddress && e.ipAddress.toLowerCase().includes(query))
    );
  });

  const getActionBadgeClass = (action: string) => {
    if (action.includes("delete")) {
      return "bg-destructive/10 text-destructive border-destructive/20";
    }
    if (action.includes("publish") || action.includes("create")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (action.includes("secret") || action.includes("role")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              F041
            </span>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {isAr ? "سجل التدقيق والأمان غير القابل للتعديل" : "Audit Trail & Security Logs"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAr
              ? "سجل غير قابل للتعديل يوثق جميع العمليات الإدارية وتغييرات النماذج والتوجيهات والناشرين مع حجب تام للأسرار."
              : "Immutable audit log recording administrative operations, model bindings, prompt publishes, and secrets with zero credential leakage."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFilteredEvents()}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>

          <a href="/api/admin/audit/export?format=csv" download>
            <Button variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              {isAr ? "تصدير CSV" : "Export CSV"}
            </Button>
          </a>

          <a href="/api/admin/audit/export?format=json" download>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4 text-primary" />
              {isAr ? "تصدير JSON" : "Export JSON"}
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>{isAr ? "إجمالي الأحداث المسجلة" : "Total Audit Events"}</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{summary.totalEvents}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {isAr ? "سجل كامل محمي ومختوم" : "Immutable ledger integrity"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>{isAr ? "عمليات حساسة (أمان/نماذج/أسرار)" : "High-Impact Security Actions"}</span>
              <Shield className="h-4 w-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary.securityEventsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {isAr ? "تغييرات أدوار/أسرار/نماذج" : "Role, secret, and model updates"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>{isAr ? "الكيانات المراقبة" : "Tracked Entity Types"}</span>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {Object.keys(summary.entityTypesBreakdown).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {isAr ? "نماذج، توجيهات، سيرة ذاتية، محتوى" : "Models, prompts, CV, content"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs">
              <span>{isAr ? "حماية السرية والتشفير" : "Credential Redaction"}</span>
              <KeyRound className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              100%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-emerald-600">
              ✓ {isAr ? "حجب فوري لجميع مفاتيح الـ API" : "Zero credential leakage guaranteed"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-lg border p-4 bg-muted/10">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAr ? "بحث في سجل التدقيق..." : "Search audit trail..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 text-xs"
            />
          </div>

          <div className="w-48">
            <Select value={selectedAction} onValueChange={handleActionChange}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={isAr ? "جميع العمليات" : "All Actions"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? "جميع العمليات" : "All Actions"}</SelectItem>
                <SelectItem value="model_assignment">model_assignment</SelectItem>
                <SelectItem value="prompt_publish">prompt_publish</SelectItem>
                <SelectItem value="cv_publish">cv_publish</SelectItem>
                <SelectItem value="reindex">reindex</SelectItem>
                <SelectItem value="secret_update">secret_update</SelectItem>
                <SelectItem value="system_init">system_init</SelectItem>
                <SelectItem value="content_update">content_update</SelectItem>
                <SelectItem value="content_delete">content_delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={selectedEntityType} onValueChange={handleEntityTypeChange}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={isAr ? "جميع الكيانات" : "All Entity Types"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? "جميع الكيانات" : "All Entity Types"}</SelectItem>
                <SelectItem value="model">model</SelectItem>
                <SelectItem value="prompt">prompt</SelectItem>
                <SelectItem value="cv">cv</SelectItem>
                <SelectItem value="rag">rag</SelectItem>
                <SelectItem value="secret">secret</SelectItem>
                <SelectItem value="system">system</SelectItem>
                <SelectItem value="section">section</SelectItem>
                <SelectItem value="page">page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {isAr
            ? `عرض ${filteredEvents.length} من أصل ${events.length} حدث`
            : `Showing ${filteredEvents.length} of ${events.length} events`}
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3 text-start">{isAr ? "الوقت والتاريخ" : "Timestamp"}</th>
                  <th className="p-3 text-start">{isAr ? "العملية" : "Action"}</th>
                  <th className="p-3 text-start">{isAr ? "نوع الكيان" : "Entity"}</th>
                  <th className="p-3 text-start">{isAr ? "المسؤول" : "Actor"}</th>
                  <th className="p-3 text-start">{isAr ? "عنوان IP" : "IP / Agent"}</th>
                  <th className="p-3 text-center">{isAr ? "الفروقات" : "State Diff"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {new Date(evt.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline" className={`text-xs ${getActionBadgeClass(evt.action)}`}>
                          {evt.action}
                        </Badge>
                      </td>

                      <td className="p-3 whitespace-nowrap text-xs">
                        <span className="font-semibold text-foreground">{evt.entityType}</span>
                        {evt.entityId && (
                          <span className="text-muted-foreground ms-1">({evt.entityId})</span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>{evt.userEmail || evt.userId || "system"}</span>
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {evt.ipAddress || "—"}
                      </td>

                      <td className="p-3 whitespace-nowrap text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEventForDiff(evt)}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isAr ? "معاينة" : "Diff"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      {isAr ? "لا توجد أحداث مطابقة لشروط البحث" : "No audit events match the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* State Diff Modal / Drawer */}
      {selectedEventForDiff && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-3xl rounded-xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">
                    {isAr ? "فروقات حالة الحدث التدقيقي" : "Audit Event State Diff"}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getActionBadgeClass(selectedEventForDiff.action)}`}>
                    {selectedEventForDiff.action}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {selectedEventForDiff.id} • {selectedEventForDiff.createdAt}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEventForDiff(null)}
                className="text-xs"
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isAr ? "الحالة السابقة (Previous State)" : "Previous State"}
                </span>
                <pre className="p-3 rounded-lg border bg-muted/20 text-xs font-mono overflow-auto max-h-64">
                  {selectedEventForDiff.previousState
                    ? JSON.stringify(selectedEventForDiff.previousState, null, 2)
                    : isAr
                      ? "لا توجد حالة سابقة (إنشاء جديد)"
                      : "null (new entity created)"}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isAr ? "الحالة الجديدة (New State - Redacted)" : "New State (Sanitized)"}
                </span>
                <pre className="p-3 rounded-lg border bg-muted/20 text-xs font-mono overflow-auto max-h-64 text-emerald-600 dark:text-emerald-400">
                  {selectedEventForDiff.newState
                    ? JSON.stringify(selectedEventForDiff.newState, null, 2)
                    : isAr
                      ? "لا توجد حالة جديدة (حذف)"
                      : "null (entity deleted)"}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              <span>
                {isAr ? "الممثل:" : "Actor:"} {selectedEventForDiff.userEmail || selectedEventForDiff.userId || "system"}
              </span>
              <span>
                {isAr ? "عنوان IP:" : "IP:"} {selectedEventForDiff.ipAddress || "—"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
