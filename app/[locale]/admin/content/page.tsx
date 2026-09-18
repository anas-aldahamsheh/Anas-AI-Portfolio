import type { Metadata } from "next";
import { contentCenterService } from "@/modules/content/infrastructure/content-center-service";
import { ContentCenterManager } from "@/modules/admin/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

export interface AdminContentPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminContentPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["admin.content.title"] ||
    (supportedLocale === "ar" ? "مركز إدارة المحتوى والأقسام" : "Admin Content Center");

  return {
    title: `${title} | Admin`,
    description: "Manage portfolio pages, dynamic sections, blocks, and publishing workflow.",
  };
}

export default async function AdminContentPage() {
  const initialSummary = await contentCenterService.getSummary();

  return (
    <div className="flex-1 space-y-6 p-6">
      <ContentCenterManager initialSummary={initialSummary} />
    </div>
  );
}
