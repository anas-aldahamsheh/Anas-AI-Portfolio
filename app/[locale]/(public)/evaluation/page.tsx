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
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const initialData = await evaluationService.getDashboardData();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Engineering Evidence Context */}
      <div className="mb-8 border-b border-neutral-200/80 pb-6 dark:border-neutral-800/80">
        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {isAr ? "منظومة قياس واختبار الجودة" : "Quality Engineering & Evaluation"}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          {isAr ? "بيئة التقييم المعياري للذكاء الاصطناعي" : "AI Benchmark & Quality Evaluation"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {isAr
            ? "بيئة تقييم قطعية صممها وبناها أنس الدحامشة لقياس دقة الاسترجاع (Retrieval Accuracy)، مصداقية الإسناد (Grounding Fidelity)، التكافؤ ثنائي اللغة، ومراقبة زمن الاستجابة P95 في بيئة إنتاجية حقيقية."
            : "A deterministic evaluation environment built by Anas Al Dahamsheh to benchmark retrieval quality, grounding fidelity, bilingual consistency, and latency under production workloads."}
        </p>
      </div>

      <EvaluationDashboard initialData={initialData} />
    </div>
  );
}
