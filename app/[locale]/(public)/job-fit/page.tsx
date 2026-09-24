import type { Metadata } from "next";
import { JobFitAnalyzer } from "@/modules/job-fit/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
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
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={isAr ? "محلل المواءمة الوظيفية ونقاط التوافق" : "Job Fit & ATS Alignment Engine"}
        subtitle={
          isAr
            ? "أداة هندسية صممها وبناها أنس الدحامشة: تدمج التحليل الدلالي لمواصفات الوظيفة مع خوارزميات تقييم قطعية لمطابقة المتطلبات بدقة مع الأدلة والمشاريع البرمجية الحقيقية."
            : "An engineering tool built by Anas Al Dahamsheh combining LLM semantic requirement extraction with deterministic scoring algorithms to match candidate achievements against job descriptions."
        }
      />

      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <JobFitAnalyzer />
      </div>
    </div>
  );
}
