import type { Metadata } from "next";
import { ingestionService } from "@/ai/ingestion";
import { RagPipelineManager } from "@/modules/admin/presentation";

interface AdminRagPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminRagPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "منظومة الاسترجاع المعزز (RAG Pipeline) | لوحة التحكم"
      : "RAG Knowledge Pipeline | Admin Control Plane",
    description: isArabic
      ? "إدارة الفهرسة الدلالية واستخراج المعارف ومزامنة المتجهات للمحفظة الهندسية."
      : "Manage semantic indexing, knowledge extraction, and vector synchronization.",
  };
}

export default async function AdminRagPage({ params }: AdminRagPageProps) {
  const { locale } = await params;
  const supportedLocale = locale === "ar" ? "ar" : "en";

  const [status, config] = await Promise.all([
    ingestionService.getRagIndexStatus(),
    ingestionService.getRagConfiguration(),
  ]);

  return (
    <div className="py-2">
      <RagPipelineManager initialStatus={status} initialConfig={config} locale={supportedLocale} />
    </div>
  );
}
