import type { Metadata } from "next";
import { projectService } from "@/modules/projects/infrastructure/project-service";
import { ProjectCatalog } from "@/modules/projects/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Header Section */}
      <div className="mb-10 max-w-2xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#173B6C] sm:text-4xl dark:text-neutral-50">
          {heading}
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          {subtitle}
        </p>
      </div>

      {/* Catalog Content - Pure Grid of Project Cards */}
      <ProjectCatalog
        initialProjects={catalogResult.projects}
        categories={catalogResult.categories}
        tags={catalogResult.tags}
        locale={supportedLocale}
        showFilters={false}
      />
    </div>
  );
}
