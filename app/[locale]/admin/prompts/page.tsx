import type { Metadata } from "next";
import { promptService } from "@/ai/prompts";
import { PromptRegistryManager } from "@/modules/admin/presentation";

interface AdminPromptsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminPromptsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "سجل التوجيهات الذكية (Prompts) | لوحة التحكم"
      : "AI Prompt Registry | Admin Control Plane",
    description: isArabic
      ? "إدارة وتعديل قوالب وتوجيهات الذكاء الاصطناعي مع دعم الإصدارات والاسترجاع الآمن."
      : "Manage, version, test, and rollback production AI prompts safely.",
  };
}

export default async function AdminPromptsPage({ params }: AdminPromptsPageProps) {
  const { locale } = await params;
  const supportedLocale = locale === "ar" ? "ar" : "en";

  const prompts = await promptService.listPrompts();

  return (
    <div className="py-2">
      <PromptRegistryManager initialPrompts={prompts} locale={supportedLocale} />
    </div>
  );
}
