import type { Metadata } from "next";
import { modelRegistryService } from "@/ai/orchestration/model-registry-service";
import { AiRegistryManager } from "@/modules/admin/presentation";

interface AdminAiPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminAiPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "سجل مزودي ونماذج الذكاء الاصطناعي | لوحة التحكم"
      : "AI Provider & Model Registry | Admin Control Plane",
    description: isArabic
      ? "إدارة مزودي ونماذج الذكاء الاصطناعي وتعيين القدرات النشطة."
      : "Manage AI providers, models, and active capability assignments dynamically.",
  };
}

export default async function AdminAiPage({ params }: AdminAiPageProps) {
  const { locale } = await params;
  const supportedLocale = locale === "ar" ? "ar" : "en";

  const [providers, models, assignments, policy] = await Promise.all([
    modelRegistryService.listProviders(),
    modelRegistryService.listModels(),
    modelRegistryService.listAssignments("production"),
    modelRegistryService.getRuntimePolicy(),
  ]);

  return (
    <div className="py-2">
      <AiRegistryManager
        initialProviders={providers}
        initialModels={models}
        initialAssignments={assignments}
        initialPolicy={policy}
        locale={supportedLocale}
      />
    </div>
  );
}
