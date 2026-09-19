import type { Metadata } from "next";
import { evaluationService } from "@/ai/evaluation";
import { EvaluationDashboard } from "@/modules/evaluation/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

export interface EvaluationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: EvaluationPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["eval.title"] ||
    (supportedLocale === "ar" ? "لوحة تقييم الجودة" : "AI Quality Evaluation");
  const description =
    dict["eval.subtitle"] ||
    (supportedLocale === "ar"
      ? "مقاييس جودة الاسترجاع والتوليد المقاسة فعلياً مع ضمانات الإسناد وتكافؤ اللغات."
      : "Measured retrieval and generation quality benchmarks with strict grounding and bilingual parity guarantees.");

  return {
    title: `${title} | Portfolio`,
    description,
  };
}

export default async function EvaluationPage() {
  const initialData = await evaluationService.getDashboardData();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <EvaluationDashboard initialData={initialData} />
    </div>
  );
}
