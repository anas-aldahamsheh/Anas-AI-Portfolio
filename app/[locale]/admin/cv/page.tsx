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
      ? "إدارة صفحة About & Resume | لوحة التحكم"
      : "About & Resume Management | Admin Panel",
  };
}

export default async function AdminCvPage({ params }: AdminCvPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const [publishedCv, versions, aboutConfig] = await Promise.all([
    cvService.getPublishedCv(),
    cvService.listVersions(),
    cvService.getAboutConfig(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-border border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {isArabic ? "إدارة صفحة About & Resume ومستند السيرة الذاتية" : "About & Resume & PDF Management"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isArabic
            ? "تحكّم بشكل كامل بمحتوى قسم نبذة عني (About Me)، وارفع نسخ الـ PDF واعتمدها بدون أشرطة المتصفح المزعجة."
            : "Fully manage the About Me narrative profile and upload/publish verified CV PDFs."}
        </p>
      </header>

      {/* Main Manager */}
      <CvAdminManager
        initialPublishedCv={publishedCv}
        initialVersions={versions}
        initialAbout={aboutConfig}
        locale={locale}
      />
    </div>
  );
}
