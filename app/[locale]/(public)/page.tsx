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
    <main
      dir={dir}
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <RecruiterJourneyIndex locale={supportedLocale} />
    </main>
  );
}
