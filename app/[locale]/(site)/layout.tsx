import { ViewTransition } from "react";
import { toLocale } from "@/i18n/config";
import { getProfile } from "@/server/content/repository";
import { getQuickQuestions } from "@/ai/settings";
import { Navbar } from "@/features/site/navbar";
import { Footer } from "@/features/site/footer";
import { BrandLogo } from "@/features/site/brand-logo";
import { AssistantLauncher } from "@/features/assistant/assistant-launcher";
import { AdminGate } from "@/features/admin/admin-gate";

// Admin edits run as server actions on these pages (uploads are read by the AI after saving).
export const maxDuration = 60;

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = toLocale((await params).locale);
  const [profile, quickQuestions] = await Promise.all([
    getProfile(locale),
    getQuickQuestions(locale),
  ]);
  const name = profile?.t.name ?? "Anas Al Dahamsheh";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar logo={<BrandLogo name={name} />} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <ViewTransition default="page">{children}</ViewTransition>
      </main>
      <Footer locale={locale} profile={profile} />
      <AssistantLauncher quickQuestions={quickQuestions} />
      <AdminGate />
    </div>
  );
}
