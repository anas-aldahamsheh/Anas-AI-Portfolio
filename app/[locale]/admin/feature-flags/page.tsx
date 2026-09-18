import type { Metadata } from "next";
import { featureFlagService } from "@/modules/admin/infrastructure/feature-flag-service";
import { FeatureFlagManager } from "@/modules/admin/presentation";

export const dynamic = "force-dynamic";

interface AdminFeatureFlagsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminFeatureFlagsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "إدارة رايات الميزات | لوحة التحكم"
      : "Feature Flag Manager | Admin Control Plane",
    description: isArabic
      ? "التحكم في تفعيل وتعطيل الميزات والإطلاق التدريجي (Canary) دون الحاجة لإعادة النشر."
      : "Manage platform feature rollout toggles, canary percentages, and killswitches dynamically.",
  };
}

export default async function AdminFeatureFlagsPage({ params }: AdminFeatureFlagsPageProps) {
  const { locale } = await params;
  const supportedLocale = locale === "ar" ? "ar" : "en";

  const flags = await featureFlagService.listFlags();

  return (
    <div className="py-2">
      <FeatureFlagManager initialFlags={flags} locale={supportedLocale} />
    </div>
  );
}
