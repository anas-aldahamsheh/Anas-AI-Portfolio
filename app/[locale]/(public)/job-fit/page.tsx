import type { Metadata } from "next";
import { JobFitAnalyzer } from "@/modules/job-fit/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface JobFitPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: JobFitPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["jobfit.title"] ||
    (supportedLocale === "ar" ? "محلل التوافق الوظيفي المدعوم بالأدلة" : "Job Fit Analyzer");
  const description =
    dict["jobfit.subtitle"] ||
    (supportedLocale === "ar"
      ? "مطابقة متطلبات أي دور هندسي مباشرة مع الأدلة الموثقة ومشاريع المحفظة الحقيقية."
      : "Map any role requirements directly to verified engineering evidence, projects, and architectural decisions.");

  return {
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function JobFitPage({ params }: JobFitPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Engineering Project Showcase Context */}
      <div className="mb-8 border-b border-neutral-200/80 pb-6 dark:border-neutral-800/80">
        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {isAr ? "مشروع تطبيقي وأداة مهندسة" : "Applied Engineering Tool"}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          {isAr ? "محلل المواءمة الوظيفية ونقاط التوافق" : "Job Fit & ATS Alignment Engine"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {isAr
            ? "أداة هندسية صممها وبناها أنس الدحامشة: تدمج التحليل الدلالي لمواصفات الوظيفة مع خوارزميات تقييم قطعية لمطابقة المتطلبات بدقة مع الأدلة والمشاريع البرمجية الحقيقية."
            : "An engineering tool built by Anas Al Dahamsheh combining LLM semantic requirement extraction with deterministic scoring algorithms to match candidate achievements against job descriptions."}
        </p>
      </div>

      <JobFitAnalyzer />
    </main>
  );
}
