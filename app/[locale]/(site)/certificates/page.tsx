import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { listEntries } from "@/server/content/repository";
import { PageHero } from "@/ui/page-hero";
import { Container, EmptyState } from "@/ui/primitives";
import { CertificateGallery } from "@/features/certificates/certificate-gallery";

/** "2026-09" → "September 2026" (or the Arabic month); a bare year stays as is. */
function formatIssued(value: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/certificates">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("certificates.hero.title"),
    description: t("certificates.hero.subtitle"),
    alternates: { canonical: `/${locale}/certificates` },
  };
}

export default async function CertificatesPage({ params }: PageProps<"/[locale]/certificates">) {
  const locale = toLocale((await params).locale);
  const [{ t, tx }, certificates] = await Promise.all([
    getTranslator(locale),
    listEntries("certificate", locale),
  ]);
  const ordered = [...certificates].sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || a.orderIndex - b.orderIndex,
  );

  return (
    <div className="w-full">
      <PageHero
        title={t("certificates.hero.title")}
        titleKey="certificates.hero.title"
        subtitle={t("certificates.hero.subtitle")}
        subtitleKey="certificates.hero.subtitle"
      />
      <Container className="py-10 sm:py-14 lg:py-16">
        {ordered.length === 0 ? (
          <div data-edit-list="certificate">
            <EmptyState>{tx("certificates.empty")}</EmptyState>
          </div>
        ) : (
          <CertificateGallery
            items={ordered.map((c) => ({
              id: c.id,
              slug: c.slug,
              title: c.t.title,
              issuer: c.t.issuer,
              description: c.t.description,
              issueDate: formatIssued(c.data.issueDate, locale),
              credentialId: c.data.credentialId,
              credentialUrl: c.data.credentialUrl,
              image: c.data.image,
              file: c.data.file,
              skills: c.data.skills,
              featured: c.data.featured,
            }))}
            labels={{
              verify: t("certificates.verify"),
              issued: t("certificates.issued"),
              id: t("certificates.id"),
              skills: t("certificates.skills"),
              view: t("certificates.view"),
              close: t("certificates.close"),
              file: t("certificates.file"),
            }}
          />
        )}
      </Container>
    </div>
  );
}
