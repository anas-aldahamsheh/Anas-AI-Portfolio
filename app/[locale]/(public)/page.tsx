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
      className="flex min-h-screen flex-col items-center justify-start px-4 py-8 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full max-w-4xl space-y-6">
        <RecruiterJourneyIndex locale={supportedLocale} />
      </div>
    </main>
  );
}
