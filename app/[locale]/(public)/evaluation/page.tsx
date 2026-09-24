import type { Metadata } from "next";
import { evaluationService } from "@/ai/evaluation";
import { EvaluationDashboard } from "@/modules/evaluation/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
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
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const initialData = await evaluationService.getDashboardData();

  return (
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={isAr ? "بيئة التقييم المعياري للذكاء الاصطناعي" : "AI Benchmark & Quality Evaluation"}
        subtitle={
          isAr
            ? "بيئة تقييم قطعية صممها وبناها أنس الدحامشة لقياس دقة الاسترجاع (Retrieval Accuracy)، مصداقية الإسناد (Grounding Fidelity)، التكافؤ ثنائي اللغة، ومراقبة زمن الاستجابة P95 في بيئة إنتاجية حقيقية."
            : "A deterministic evaluation environment built by Anas Al Dahamsheh to benchmark retrieval quality, grounding fidelity, bilingual consistency, and latency under production workloads."
        }
      />

      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <EvaluationDashboard initialData={initialData} />
      </div>
    </div>
  );
}
