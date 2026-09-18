import type { Metadata } from "next";
import { auditLogService } from "@/modules/admin/infrastructure/audit-log-service";
import { AuditLogViewer } from "@/modules/admin/presentation";

export const dynamic = "force-dynamic";

interface AdminAuditPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminAuditPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "سجل التدقيق والأمان | لوحة التحكم"
      : "Audit Trail & Security Logs | Admin Control Plane",
    description: isArabic
      ? "سجل غير قابل للتعديل يوثق جميع العمليات الإدارية الحساسة مع حجب تام للبيانات السرية."
      : "Immutable audit log tracking administrative actions and system modifications with full secret redaction.",
  };
}

export default async function AdminAuditPage({ params }: AdminAuditPageProps) {
  const { locale } = await params;
  const supportedLocale = locale === "ar" ? "ar" : "en";

  const [eventsResult, summary] = await Promise.all([
    auditLogService.listEvents({ limit: 50, offset: 0 }),
    auditLogService.getSummary(),
  ]);

  return (
    <div className="py-2">
      <AuditLogViewer
        initialEvents={eventsResult.events}
        initialSummary={summary}
        locale={supportedLocale}
      />
    </div>
  );
}
