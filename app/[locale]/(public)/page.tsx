import { getTranslations } from "@/modules/localization/application/get-translations";
import { GuestReassuranceBadge } from "@/modules/auth/presentation/guest-reassurance-badge";
import { sectionService } from "@/modules/content/infrastructure/section-service";
import { DynamicPage } from "@/modules/content/presentation/dynamic-page";
import { FadeIn } from "@/components/motion";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface PublicPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicHomePage({ params }: PublicPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const { t, dir } = await getTranslations(supportedLocale);

  // Retrieve dynamic composable sections for the home page
  const sections = await sectionService.getPageSections("home", supportedLocale);

  return (
    <main
      dir={dir}
      className="flex min-h-screen flex-col items-center justify-start px-4 py-8 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full max-w-4xl space-y-6">
        {/* Dynamic Guest Reassurance Banner */}
        <FadeIn delay={0.05}>
          <GuestReassuranceBadge
            title={t("guest.reassurance.title")}
            description={t("guest.reassurance.description")}
            ariaLabel={t("guest.reassurance.title")}
            locale={supportedLocale}
          />
        </FadeIn>

        {/* Dynamic Composable Sections */}
        <DynamicPage sections={sections} locale={supportedLocale} />
      </div>
    </main>
  );
}
