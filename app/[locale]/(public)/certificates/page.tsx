import type { Metadata } from "next";
import Link from "next/link";
import { Award, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { certificateService } from "@/modules/certificates/infrastructure/certificate-service";
import { CertificatesCatalog } from "@/modules/certificates/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface CertificatesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CertificatesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "ar" ? "ar" : "en") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["certificates.catalog.title"] ||
    (supportedLocale === "ar"
      ? "الدورات والشهادات المعتمدة | أنس الدحامشة"
      : "Certificates & Courses | Anas Al Dahamsheh");

  const description =
    dict["certificates.catalog.subtitle"] ||
    (supportedLocale === "ar"
      ? "سجل الدورات التخصصية والشهادات المعتمدة لأنس الدحامشة في هندسة الذكاء الاصطناعي، RAG، وهندسة البرمجيات."
      : "Explore verified technical certifications, specialized AI courses, and credentials earned by Anas Al Dahamsheh.");

  return {
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function CertificatesPage({ params }: CertificatesPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "ar" ? "ar" : "en") as SupportedLocale;
  const isArabic = supportedLocale === "ar";

  const [certificates, dict] = await Promise.all([
    certificateService.getCertificates(),
    localizedTextService.getDictionary(supportedLocale),
  ]);

  const heading =
    dict["certificates.catalog.title"] ||
    (isArabic ? "الدورات والشهادات المعتمدة" : "Certificates & Professional Courses");

  const subtitle =
    dict["certificates.catalog.subtitle"] ||
    (isArabic
      ? "سجل الدورات التخصصية والشهادات المعتمدة في هندسة الذكاء الاصطناعي، مسارات RAG الهجينة، وهندسة البرمجيات الإنتاجية."
      : "A verified record of technical certifications and specialized courses in AI engineering, hybrid RAG pipelines, and production systems.");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Header Section */}
      <FadeIn delay={0.05}>
        <div className="mb-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span>{isArabic ? "الاعتمادات والدورات" : "Credentials & Continuous Learning"}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
            {heading}
          </h1>

          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/${supportedLocale}/cv`}>
              <Button variant="primary" size="sm" className="gap-2">
                <Download className="h-3.5 w-3.5" />
                <span>{isArabic ? "السيرة الذاتية (About & Resume)" : "About & Resume"}</span>
              </Button>
            </Link>
            <Link href={`/${supportedLocale}/projects`}>
              <Button variant="outline" size="sm" className="gap-2">
                <span>{isArabic ? "استعراض المشاريع" : "Explore Projects"}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Catalog Grid with Cards & Detail Modal */}
      <FadeIn delay={0.1}>
        <CertificatesCatalog certificates={certificates} locale={supportedLocale} />
      </FadeIn>
    </div>
  );
}
