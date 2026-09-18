import { getTranslations } from "@/modules/localization/application/get-translations";
import { GuestReassuranceBadge } from "@/modules/auth/presentation/guest-reassurance-badge";
import { DirectionalIcon } from "@/modules/localization/presentation/directional-icon";
import { MixedContent } from "@/modules/localization/presentation/mixed-content";
import { ThemeToggle } from "@/modules/theme/presentation/theme-toggle";

interface PublicPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicHomePage({ params }: PublicPageProps) {
  const { locale } = await params;
  const { t, dir } = await getTranslations(locale);

  const publicFeatures = [
    {
      id: "projects",
      title: t("guest.capabilities.projects.title"),
      description: t("guest.capabilities.projects.description"),
    },
    {
      id: "cv",
      title: t("guest.capabilities.cv.title"),
      description: t("guest.capabilities.cv.description"),
    },
    {
      id: "ai-assistant",
      title: t("guest.capabilities.ai.title"),
      description: t("guest.capabilities.ai.description"),
    },
    {
      id: "job-fit",
      title: t("guest.capabilities.job_fit.title"),
      description: t("guest.capabilities.job_fit.description"),
    },
  ];

  return (
    <main
      dir={dir}
      className="flex min-h-screen flex-col items-center justify-start px-4 py-12 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full max-w-4xl space-y-8">
        <header className="space-y-3 text-start">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-neutral-50">
              {t("home.title")}
            </h1>
            <ThemeToggle locale={locale} />
          </div>
          <p className="text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
            <MixedContent text={t("home.subtitle")} />
          </p>
        </header>

        {/* Dynamic Guest Reassurance Banner */}
        <GuestReassuranceBadge
          title={t("guest.reassurance.title")}
          description={t("guest.reassurance.description")}
          ariaLabel={t("guest.reassurance.title")}
          locale={locale}
        />

        {/* Core Guest Capabilities Grid */}
        <section aria-label={t("guest.capabilities.title")} className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t("guest.capabilities.title")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {publicFeatures.map((feature) => (
              <div
                key={feature.id}
                className="group relative flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {feature.title}
                    </h3>
                    <DirectionalIcon
                      name="chevron-end"
                      size={18}
                      className="text-neutral-400 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-400">
                    <MixedContent text={feature.description} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
