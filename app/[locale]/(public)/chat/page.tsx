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

  const title = dict["chat.title"] || (supportedLocale === "ar" ? "اسأل عن أنس" : "Ask About Anas");
  const description =
    dict["chat.subtitle"] ||
    (supportedLocale === "ar"
      ? "مساعد تفاعلي موجه لمسؤولي التوظيف والمهندسين للإجابة عن خبرات ومشاريع أنس الدحامشة."
      : "Interactive recruiter assistant providing evidence-grounded answers about Anas Al Dahamsheh's engineering track record.");

  return {
    title: `${title} | Anas Al Dahamsheh`,
    description,
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  await params;

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-sm text-neutral-500">
          Loading...
        </div>
      }
    >
      <ChatPageClient />
    </Suspense>
  );
}
