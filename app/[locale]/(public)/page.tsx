import { getTranslations } from "@/modules/localization/application/get-translations";
import { RecruiterJourneyIndex } from "@/modules/home/presentation/recruiter-journey-index";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface PublicPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicHomePage({ params }: PublicPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const { dir } = await getTranslations(supportedLocale);

  return (
    <div dir={dir} className="w-full">
      <RecruiterJourneyIndex locale={supportedLocale} />
    </div>
  );
}
