import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { listEntries } from "@/server/content/repository";
import { PageHero } from "@/ui/page-hero";
import { Container } from "@/ui/primitives";
import { ProjectCatalog } from "@/features/projects/project-catalog";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("projects.hero.title"),
    description: t("projects.hero.subtitle"),
    alternates: { canonical: `/${locale}/projects` },
  };
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const locale = toLocale((await params).locale);
  const [{ t }, projects] = await Promise.all([
    getTranslator(locale),
    listEntries("project", locale),
  ]);
  // Featured first, then the owner's order.
  const ordered = [...projects].sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || a.orderIndex - b.orderIndex,
  );

  return (
    <div className="w-full">
      <PageHero
        title={t("projects.hero.title")}
        titleKey="projects.hero.title"
        subtitle={t("projects.hero.subtitle")}
        subtitleKey="projects.hero.subtitle"
      />
      <Container className="py-10 sm:py-14 lg:py-16">
        <ProjectCatalog
          locale={locale}
          projects={ordered.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.t.title,
            summary: p.t.summary,
            tags: p.data.tags,
            cover: p.data.cover,
            demoUrl: p.data.demoUrl,
            repoUrl: p.data.repoUrl,
            featured: p.data.featured,
            category: p.data.category,
            repoPrivate: p.data.repoPrivate,
            preview: p.data.showcase.find((item) => item.kind === "video")?.preview ?? "",
            poster: p.data.showcase.find((item) => item.kind === "video")?.poster ?? "",
            screens: p.data.showcase.filter((item) => item.kind === "image").length,
          }))}
          labels={{
            caseStudy: t("projects.caseStudy"),
            demo: t("projects.demo"),
            code: t("projects.code"),
            featured: t("projects.featured"),
            private: t("project.private"),
            screens: t("project.showcase.shots"),
            video: t("project.showcase.videoBadge"),
            all: t("projects.filter.all"),
            search: t("projects.search"),
            empty: t("projects.empty"),
            clear: t("projects.clear"),
            filter: t("projects.filter.label"),
            counts: {
              one: t("projects.count.one"),
              two: t("projects.count.two"),
              few: t("projects.count.few"),
              many: t("projects.count.many"),
              other: t("projects.count.other"),
            },
          }}
        />
      </Container>
    </div>
  );
}
