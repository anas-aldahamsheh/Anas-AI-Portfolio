import type { Metadata } from "next";
import { AiLabView } from "@/modules/ai-lab/presentation";
import { aiLabService } from "@/ai/lab";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
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
    <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Engineering Context Intro */}
      <div className="mb-8 border-b border-neutral-200/80 pb-6 dark:border-neutral-800/80">
        <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          {isAr ? "براهين وتجارب هندسية حية" : "Engineering Proof of Concept"}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          {isAr
            ? "تجارب هندسة الذكاء الاصطناعي التفاعلية"
            : "Interactive AI Engineering Experiments"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {isAr
            ? "بيئة تجارب حية صممها وبناها أنس الدحامشة لإثبات آليات الاسترجاع الهجين، إعادة الترتيب بالمرمز المتقاطع (Cross-Encoder)، وضبط زمن الاستجابة وجودة التوليد عملياً."
            : "Interactive demonstrations built by Anas Al Dahamsheh to validate hybrid retrieval, cross-encoder reranking, latency bounds, and grounded generation in production scenarios."}
        </p>
      </div>

      <AiLabView initialDemos={initialDemos} />
    </main>
  );
}
