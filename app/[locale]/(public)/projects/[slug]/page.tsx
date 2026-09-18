import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectService } from "@/modules/projects/infrastructure/project-service";
import { ProjectDeepDive } from "@/modules/projects/presentation";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const project = await projectService.getProjectBySlug(slug, supportedLocale);

  if (!project) {
    return {
      title:
        supportedLocale === "ar"
          ? "المشروع غير موجود | Anas Portfolio"
          : "Project Not Found | Anas Portfolio",
      description:
        supportedLocale === "ar"
          ? "المشروع المطلوب غير موجود أو تمت أرشفته."
          : "The requested project could not be found or has been archived.",
    };
  }

  return {
    title: `${project.title} | Anas Portfolio`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.coverImageUrl ? [{ url: project.coverImageUrl }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug, locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  const project = await projectService.getProjectBySlug(slug, supportedLocale);

  if (!project) {
    notFound();
  }

  const relatedProjects = await projectService.getRelatedProjects(slug, supportedLocale, 2);

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <ProjectDeepDive
        project={project}
        relatedProjects={relatedProjects}
        locale={supportedLocale}
      />
    </div>
  );
}
