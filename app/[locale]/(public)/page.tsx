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
    <div
      dir={dir}
      className="mx-auto w-full max-w-[1420px] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10"
    >
      <RecruiterJourneyIndex locale={supportedLocale} />
    </div>
  );
}
