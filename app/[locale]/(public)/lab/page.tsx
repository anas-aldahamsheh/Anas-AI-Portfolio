import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
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
        badge={
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3.5 py-1 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
            <FlaskConical className="h-3.5 w-3.5" />
            <span>{isAr ? "براهين وتجارب هندسية حية" : "Engineering Proof of Concept"}</span>
          </div>
        }
        title={isAr ? "تجارب هندسة الذكاء الاصطناعي التفاعلية" : "Interactive AI Engineering Experiments"}
        subtitle={
          isAr
            ? "بيئة تجارب حية صممها وبناها أنس الدحامشة لإثبات آليات الاسترجاع الهجين، إعادة الترتيب بالمرمز المتقاطع (Cross-Encoder)، وضبط زمن الاستجابة وجودة التوليد عملياً."
            : "Interactive demonstrations built by Anas Al Dahamsheh to validate hybrid retrieval, cross-encoder reranking, latency bounds, and grounded generation in production scenarios."
        }
      />

      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <AiLabView initialDemos={initialDemos} />
      </div>
    </div>
  );
}
