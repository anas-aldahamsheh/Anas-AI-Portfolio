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
    title: `${title} | Anas Portfolio`,
    description,
  };
}

export default async function AiLabPage({ params }: AiLabPageProps) {
  const { locale } = await params;
  const initialDemos = await aiLabService.listDemos({
    publishedOnly: true,
    locale,
  });

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <AiLabView initialDemos={initialDemos} />
    </main>
  );
}
