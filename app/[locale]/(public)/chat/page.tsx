import { Suspense } from "react";
import type { Metadata } from "next";
import { ChatPageClient } from "@/modules/chat/presentation";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface ChatPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;
  const dict = await localizedTextService.getDictionary(supportedLocale);

  const title =
    dict["chat.title"] ||
    (supportedLocale === "ar" ? "المساعد الذكي لملف الأعمال" : "Portfolio AI Assistant");
  const description =
    dict["chat.subtitle"] ||
    (supportedLocale === "ar"
      ? "إجابات موثقة بالأدلة والاستشهادات عن مشاريع وخبرات أنس."
      : "Evidence-grounded answers citing Anas's verified projects & skills.");

  return {
    title: `${title} | Anas Portfolio`,
    description,
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  await params;

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-sm text-neutral-500">
          Loading AI Assistant...
        </div>
      }
    >
      <ChatPageClient />
    </Suspense>
  );
}
