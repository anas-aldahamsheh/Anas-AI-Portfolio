import type { Metadata } from "next";
import { cvService } from "@/modules/cv/infrastructure/cv-service";
import { CvViewer } from "@/modules/cv/presentation";
import { getCurrentSession } from "@/modules/auth/infrastructure/server-auth";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface CvPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CvPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["cv.title"] || (supportedLocale === "ar" ? "السيرة الذاتية المهنية" : "Curriculum Vitae");
  const description =
    dict["cv.subtitle"] ||
    (supportedLocale === "ar"
      ? "عرض وتحميل أحدث نسخة معتمدة من السيرة الذاتية المهنية"
      : "View and download the latest verified resume");

  return {
    title: `${title} | Anas Portfolio`,
    description,
  };
}

export default async function CvPage({ params }: CvPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  const [publishedCv, session] = await Promise.all([
    cvService.getPublishedCv(),
    getCurrentSession(),
  ]);

  const isAdmin = session?.role === "ADMIN";
  const versions = isAdmin ? await cvService.listVersions() : [];

  return <CvViewer cv={publishedCv} versions={versions} locale={supportedLocale} />;
}
