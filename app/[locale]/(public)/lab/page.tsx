import type { Metadata } from "next";
import { AiLabView } from "@/modules/ai-lab/presentation";
import { aiLabService } from "@/ai/lab";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface AiLabPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AiLabPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["lab.title"] ||
    (supportedLocale === "ar" ? "مختبر هندسة الذكاء الاصطناعي" : "AI Engineering Lab");
  const description =
    dict["lab.subtitle"] ||
    (supportedLocale === "ar"
      ? "عروض تفاعلية حية لمعمارية استرجاع RAG، والبحث المتجهي، وإعادة الترتيب بالمرمز المتقاطع، والاستخراج المهيكل."
      : "Interactive demonstrations of production RAG, vector search, cross-encoder reranking, and deterministic extraction.");

  return {
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function AiLabPage({ params }: AiLabPageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const initialDemos = await aiLabService.listDemos({
    publishedOnly: true,
    locale,
  });

  return (
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={isAr ? "تجارب هندسة الذكاء الاصطناعي التفاعلية" : "Interactive AI Engineering Experiments"}
        titleKey="lab.title"
        subtitle={
          isAr
            ? "بيئة تجارب حية صممها وبناها أنس الدحامشة لإثبات آليات الاسترجاع الهجين، إعادة الترتيب بالمرمز المتقاطع (Cross-Encoder)، وضبط زمن الاستجابة وجودة التوليد عملياً."
            : "Interactive demonstrations built by Anas Al Dahamsheh to validate hybrid retrieval, cross-encoder reranking, latency bounds, and grounded generation in production scenarios."
        }
        subtitleKey="lab.subtitle"
      />

      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <AiLabView initialDemos={initialDemos} />
      </div>
    </div>
  );
}
