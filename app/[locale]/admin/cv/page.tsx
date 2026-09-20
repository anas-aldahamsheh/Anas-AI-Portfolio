import type { Metadata } from "next";
import { cvService } from "@/modules/cv/infrastructure/cv-service";
import { CvAdminManager } from "./cv-admin-manager";

interface AdminCvPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminCvPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "إدارة السيرة الذاتية والصناديق | لوحة التحكم"
      : "CV & Boxes Management | Admin Panel",
  };
}

export default async function AdminCvPage({ params }: AdminCvPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const [publishedCv, versions, boxes] = await Promise.all([
    cvService.getPublishedCv(),
    cvService.listVersions(),
    cvService.getCvBoxes(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-border border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {isArabic ? "إدارة السيرة الذاتية والصناديق التعريفية" : "CV & Profile Management"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isArabic
            ? "تحكّم بشكل كامل بصناديق السيرة الذاتية (حذف، تعديل، إضافة)، وارفع نسخ الـ PDF وانشرها بدون أشرطة المتصفح المزعجة."
            : "Fully manage profile & competency boxes (delete, edit, add, reorder) and upload/publish verified CV PDFs."}
        </p>
      </header>

      {/* Main Manager */}
      <CvAdminManager
        initialPublishedCv={publishedCv}
        initialVersions={versions}
        initialBoxes={boxes}
        locale={locale}
      />
    </div>
  );
}
