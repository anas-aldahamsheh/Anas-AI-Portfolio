import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { certificateService } from "@/modules/certificates/infrastructure/certificate-service";
import { CertificatesCatalog } from "@/modules/certificates/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
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
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={heading}
        subtitle={subtitle}
        actions={
          <>
            <Link href={`/${supportedLocale}/cv`} className="btn-action-primary">
              <Download className="h-4 w-4" />
              <span>{isArabic ? "السيرة الذاتية (About & Resume)" : "About & Resume"}</span>
            </Link>
            <Link href={`/${supportedLocale}/projects`} className="btn-action-secondary">
              <span>{isArabic ? "استعراض المشاريع" : "Explore Projects"}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </>
        }
      />

      {/* Catalog Grid with Cards & Detail Modal */}
      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <FadeIn delay={0.1}>
          <CertificatesCatalog certificates={certificates} locale={supportedLocale} />
        </FadeIn>
      </div>
    </div>
  );
}
