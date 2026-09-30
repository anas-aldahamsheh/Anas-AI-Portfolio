import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { PageHero } from "@/ui/page-hero";
import { Container } from "@/ui/primitives";
import { JobFitForm } from "@/features/assistant/job-fit-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/job-fit">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("fit.hero.title"),
    description: t("fit.hero.subtitle"),
    alternates: { canonical: `/${locale}/job-fit` },
  };
}

export default async function JobFitPage({ params }: PageProps<"/[locale]/job-fit">) {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return (
    <div className="w-full">
      <PageHero
        title={t("fit.hero.title")}
        titleKey="fit.hero.title"
        subtitle={t("fit.hero.subtitle")}
        subtitleKey="fit.hero.subtitle"
      />
      <Container className="py-8 sm:py-10">
        <JobFitForm />
      </Container>
    </div>
  );
}
