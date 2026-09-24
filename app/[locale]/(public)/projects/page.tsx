import type { Metadata } from "next";
import { projectService } from "@/modules/projects/infrastructure/project-service";
import { ProjectCatalog } from "@/modules/projects/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["projects.catalog.title"] ||
    (supportedLocale === "ar" ? "المشاريع والأنظمة الهندسية" : "Engineering & AI Projects");
  const description =
    dict["projects.catalog.description"] ||
    (supportedLocale === "ar"
      ? "منظومات إنتاجية، وهياكل وكيلة، ومساهمات مفتوحة المصدر."
      : "Production systems, agentic architectures, and open-source contributions.");

  return {
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  const [catalogResult, dict] = await Promise.all([
    projectService.listProjects({ locale: supportedLocale }),
    localizedTextService.getDictionary(supportedLocale),
  ]);

  const heading =
    dict["projects.catalog.title"] ||
    (supportedLocale === "ar" ? "المشاريع والأنظمة الهندسية" : "Engineering & AI Projects");
  const subtitle =
    dict["projects.catalog.description"] ||
    (supportedLocale === "ar"
      ? "منظومات إنتاجية، وهياكل وكيلة، ومساهمات مفتوحة المصدر تم بناؤها بمعايير موثوقية عالية."
      : "Production systems, agentic architectures, and open-source contributions built with high reliability.");

  return (
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={heading}
        titleKey="projects.catalog.title"
        subtitle={subtitle}
        subtitleKey="projects.catalog.description"
      />

      {/* Main Catalog Content Container */}
      <div className="mx-auto w-full max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <ProjectCatalog
          initialProjects={catalogResult.projects}
          categories={catalogResult.categories}
          tags={catalogResult.tags}
          locale={supportedLocale}
          showFilters={false}
        />
      </div>
    </div>
  );
}
