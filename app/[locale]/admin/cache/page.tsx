import { Metadata } from "next";
import { CacheManager } from "@/modules/admin/presentation/cache-manager";
import { cacheService } from "@/lib/cache/cache-service";

export const dynamic = "force-dynamic";

interface AdminCachePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminCachePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "إدارة الذاكرة المؤقتة | لوحة التحكم" : "Cache Management | Admin Control Plane",
    description: isAr
      ? "إدارة وتفريغ ذاكرة التخزين المؤقت متعددة الوسوم"
      : "Multi-tier cache management and tag invalidation console",
  };
}

export default async function AdminCachePage({ params }: AdminCachePageProps) {
  const { locale } = await params;

  const stats = cacheService.getStats();
  const keys = cacheService.listKeys();

  return (
    <div className="space-y-6">
      <CacheManager initialStats={stats} initialKeys={keys} locale={locale} />
    </div>
  );
}
