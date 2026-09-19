import type { Metadata } from "next";
import { evaluationService } from "@/ai/evaluation";
import { EvaluationAdminManager } from "@/modules/admin/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

export interface AdminEvaluationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminEvaluationPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["eval.admin.title"] ||
    (supportedLocale === "ar" ? "مركز إدارة وتقييم جودة النماذج" : "AI Evaluation Control Center");

  return {
    title: `${title} | Admin`,
    description: "Inspect AI quality regression gates, dataset runs, and benchmark deltas.",
  };
}

export default async function AdminEvaluationPage() {
  const initialData = await evaluationService.getDashboardData();

  return (
    <div className="flex-1 space-y-6 p-6">
      <EvaluationAdminManager initialData={initialData} />
    </div>
  );
}
