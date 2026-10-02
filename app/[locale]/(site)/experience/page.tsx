import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Download, Mail } from "lucide-react";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { getProfile, listEntries } from "@/server/content/repository";
import { formatPeriod } from "@/server/content/knowledge-sources";
import { PageHero } from "@/ui/page-hero";
import { Reveal } from "@/ui/motion/reveal";
import { Card, Container, EmptyState, TechChips } from "@/ui/primitives";
import { entryProps, fieldProps, listProps } from "@/ui/editable";
import { MediaImage } from "@/ui/media-image";
import { TimelineRail } from "@/features/experience/timeline-rail";
import { AskButton } from "@/features/assistant/ask-button";
import { CvLink } from "@/ui/cv-link";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/experience">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("experience.hero.title"),
    description: t("experience.hero.subtitle"),
    alternates: { canonical: `/${locale}/experience` },
  };
}

export default async function ExperiencePage({ params }: PageProps<"/[locale]/experience">) {
  const locale = toLocale((await params).locale);
  const [{ t, tx }, items, profile] = await Promise.all([
    getTranslator(locale),
    listEntries("experience", locale),
    getProfile(locale),
  ]);

  return (
    <div className="w-full">
      <PageHero
        title={t("experience.hero.title")}
        titleKey="experience.hero.title"
        subtitle={t("experience.hero.subtitle")}
        subtitleKey="experience.hero.subtitle"
      />

      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl" {...listProps("experience")}>
          {items.length === 0 ? (
            <EmptyState>{tx("experience.empty")}</EmptyState>
          ) : (
            <TimelineRail>
              <ol className="space-y-8">
                {items.map((item, index) => {
                  const period = formatPeriod(
                    locale,
                    item.data.startDate,
                    item.data.endDate,
                    item.data.current,
                  );
                  return (
                    <li
                      key={item.id}
                      id={item.slug}
                      className="relative scroll-mt-24 ps-12 sm:ps-16"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute start-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#EEF5FF] shadow-sm sm:h-10 sm:w-10 dark:border-[#07101F] dark:bg-indigo-950"
                      >
                        {item.data.current ? (
                          <span className="ping-soft absolute inset-1 rounded-full bg-[#2F6FED]/40" />
                        ) : null}
                        <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#2F6FED] to-[#8B5CF6]" />
                      </span>
                      <Reveal
                        variant="start"
                        delay={index * 60}
                        {...entryProps(item, `${item.t.role} — ${item.t.company}`)}
                      >
                        <Card as="article" className="group p-6 sm:p-8">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                              {item.data.logo ? (
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#E5EAF2] bg-white dark:border-white/[0.08]">
                                  <MediaImage
                                    src={item.data.logo}
                                    alt={item.t.company}
                                    sizes="48px"
                                    className="object-contain p-1.5"
                                  />
                                </div>
                              ) : null}
                              <div className="space-y-1">
                                <h2
                                  className="text-xl font-bold tracking-tight text-[#173B6C] sm:text-2xl dark:text-[#F4F7FF]"
                                  {...fieldProps(item, "role")}
                                >
                                  {item.t.role}
                                </h2>
                                <p className="text-xs font-semibold text-[#2F6FED] sm:text-sm dark:text-indigo-400">
                                  {item.data.companyUrl ? (
                                    <a
                                      href={item.data.companyUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 hover:underline"
                                      {...fieldProps(item, "company")}
                                    >
                                      {item.t.company}
                                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                                    </a>
                                  ) : (
                                    <span {...fieldProps(item, "company")}>{item.t.company}</span>
                                  )}
                                  {item.t.location ? (
                                    <span
                                      className="text-[#637089] dark:text-[#9AA8C0]"
                                      {...fieldProps(item, "location")}
                                    >
                                      {" "}
                                      · {item.t.location}
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                            {period ? (
                              <span className="w-fit shrink-0 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3.5 py-1 text-xs font-semibold text-[#1E40AF] dark:border-indigo-500/30 dark:bg-indigo-950/70 dark:text-indigo-200">
                                {period}
                              </span>
                            ) : null}
                          </div>

                          {item.t.summary ? (
                            <p
                              className="mt-4 text-sm leading-relaxed text-[#637089] dark:text-[#9AA8C0]"
                              {...fieldProps(item, "summary")}
                            >
                              {item.t.summary}
                            </p>
                          ) : null}

                          {item.t.highlights.length ? (
                            <div className="mt-5 space-y-2.5">
                              <h3 className="text-xs font-bold tracking-wider text-[#173B6C]/80 uppercase dark:text-indigo-300/90">
                                {tx("experience.outcomes")}
                              </h3>
                              <ul className="space-y-2 text-sm" {...fieldProps(item, "highlights")}>
                                {item.t.highlights.map((highlight, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2.5 text-[#637089] dark:text-[#9AA8C0]"
                                  >
                                    <CheckCircle2
                                      className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6FED] transition-transform duration-300 group-hover:scale-110 dark:text-indigo-400"
                                      aria-hidden="true"
                                    />
                                    <span className="leading-relaxed">{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {item.data.technologies.length ? (
                            <div
                              className="mt-5 border-t border-[#E5EAF2] pt-4 dark:border-white/[0.06]"
                              {...fieldProps(item, "technologies")}
                            >
                              <TechChips items={item.data.technologies} />
                            </div>
                          ) : null}
                        </Card>
                      </Reveal>
                    </li>
                  );
                })}
              </ol>
            </TimelineRail>
          )}

          <Reveal className="mt-12">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#E5EAF2] bg-gradient-to-r from-[#F8FAFF] via-white to-[#F3EEFE]/50 p-6 shadow-xs sm:flex-row sm:p-8 dark:border-white/[0.08] dark:from-white/[0.03] dark:via-white/[0.01] dark:to-indigo-950/20">
              <div className="space-y-1 text-start">
                <h2 className="text-base font-bold text-[#173B6C] sm:text-lg dark:text-[#F4F7FF]">
                  {tx("experience.cta.title")}
                </h2>
                <p className="max-w-xl text-sm text-[#637089] dark:text-[#9AA8C0]">
                  {tx("experience.cta.text")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {profile?.data.cv ? (
                  <CvLink className="btn-action-secondary">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t("cv.download")}
                  </CvLink>
                ) : (
                  <Link href={`/${locale}/contact`} className="btn-action-secondary">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {t("nav.contact")}
                  </Link>
                )}
                <AskButton
                  variant="primary"
                  prompt={
                    locale === "ar"
                      ? "ما أهم إنجازات أنس في خبراته العملية؟"
                      : "What are Anas's most important achievements at work?"
                  }
                >
                  {t("nav.ask")}
                </AskButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
