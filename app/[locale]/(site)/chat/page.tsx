import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { getQuickQuestions } from "@/ai/settings";
import { PageHero } from "@/ui/page-hero";
import { Container } from "@/ui/primitives";
import { FullChat } from "@/features/assistant/full-chat";

export async function generateMetadata({ params }: PageProps<"/[locale]/chat">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("chat.page.title"),
    description: t("chat.page.subtitle"),
    alternates: { canonical: `/${locale}/chat` },
  };
}

export default async function ChatPage({ params }: PageProps<"/[locale]/chat">) {
  const locale = toLocale((await params).locale);
  const [{ t }, questions] = await Promise.all([getTranslator(locale), getQuickQuestions(locale)]);
  return (
    <div className="w-full">
      <PageHero
        title={t("chat.page.title")}
        titleKey="chat.page.title"
        subtitle={t("chat.page.subtitle")}
        subtitleKey="chat.page.subtitle"
      />
      <Container className="py-8 sm:py-10">
        <FullChat quickQuestions={questions} />
      </Container>
    </div>
  );
}
