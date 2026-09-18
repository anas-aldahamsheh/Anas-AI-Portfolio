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
    title: `${title} | Anas Portfolio`,
    description,
  };
}

export default async function JobFitPage({ params }: JobFitPageProps) {
  await params;

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <JobFitAnalyzer />
    </main>
  );
}
