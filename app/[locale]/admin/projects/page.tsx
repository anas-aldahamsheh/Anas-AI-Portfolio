import { projectService } from "@/modules/projects/infrastructure/project-service";
import { ProjectsManager } from "./projects-manager";

interface AdminProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminProjectsPage({ params }: AdminProjectsPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const result = await projectService.listProjects({
    locale: isArabic ? "ar" : "en",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-border border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {isArabic ? "إدارة المشاريع وروابط العرض المباشر" : "Projects & Live Demo Management"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isArabic
            ? "تحكّم في إظهار أو إخفاء كبسة الـ Live Demo لكل مشروع بشكل مستقل، وعدّل رابط العرض مباشرة مع حفظ فوري."
            : "Independently toggle the Live Demo button for each project, and update demo destination URLs with instant persistence."}
        </p>
      </header>

      {/* Projects List with Controls */}
      <ProjectsManager initialProjects={result.projects} locale={locale} />
    </div>
  );
}
