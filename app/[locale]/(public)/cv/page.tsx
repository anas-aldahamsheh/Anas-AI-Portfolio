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
    dict["cv.title"] || (supportedLocale === "ar" ? "نبذة والسيرة الذاتية" : "About & Resume");
  const description =
    dict["cv.subtitle"] ||
    (supportedLocale === "ar"
      ? "الخلفية المهنية وفلسفة هندسة البرمجيات والنسخة المعتمدة من السيرة الذاتية"
      : "Executive background, engineering philosophy, and verified resume");

  return {
    title: `${title} | Anas Portfolio`,
    description,
  };
}

export default async function CvPage({ params }: CvPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  const [publishedCv, aboutConfig, session] = await Promise.all([
    cvService.getPublishedCv(),
    cvService.getAboutConfig(),
    getCurrentSession(),
  ]);

  const isAdmin = session?.role === "ADMIN";
  const versions = isAdmin ? await cvService.listVersions() : [];
  const about = aboutConfig[supportedLocale] || aboutConfig.en;

  return (
    <CvViewer
      cv={publishedCv}
      versions={versions}
      locale={supportedLocale}
      about={about}
    />
  );
}
