import type { Metadata } from "next";
import {
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { getProfile, listEntries } from "@/server/content/repository";
import { formatPeriod } from "@/server/content/knowledge-sources";
import { PageHero } from "@/ui/page-hero";
import { Reveal } from "@/ui/motion/reveal";
import { Card, Eyebrow, SectionTitle, TechChips, Container } from "@/ui/primitives";
import { entryProps, fieldProps, listProps } from "@/ui/editable";
import { MediaImage } from "@/ui/media-image";
import { SkillIcon } from "@/ui/skill-icon";
import { AskButton } from "@/features/assistant/ask-button";
import { CvPreview } from "@/features/cv/cv-preview";
import { CvLink } from "@/ui/cv-link";

export async function generateMetadata({ params }: PageProps<"/[locale]/cv">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("cv.hero.title"),
    description: t("cv.hero.subtitle"),
    alternates: { canonical: `/${locale}/cv` },
  };
}

export default async function CvPage({ params }: PageProps<"/[locale]/cv">) {
  const locale = toLocale((await params).locale);
  const [{ t, tx }, profile, skills, education] = await Promise.all([
    getTranslator(locale),
    getProfile(locale),
    listEntries("skill_group", locale),
    listEntries("education", locale),
  ]);
  const hasCv = Boolean(profile?.data.cv);

  return (
    <div className="w-full">
      <PageHero
        title={t("cv.hero.title")}
        titleKey="cv.hero.title"
        subtitle={t("cv.hero.subtitle")}
        subtitleKey="cv.hero.subtitle"
        actions={
          <>
            {hasCv ? (
              <>
                <CvLink className="btn-action-primary group">
                  <Download
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    aria-hidden="true"
                  />
                  {tx("cv.download")}
                </CvLink>
                <CvLink inline className="btn-action-secondary">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {tx("cv.open")}
                </CvLink>
              </>
            ) : null}
            <AskButton
              prompt={
                locale === "ar"
                  ? "لخّص لي خبرة أنس المهنية"
                  : "Summarize Anas's professional experience"
              }
            >
              {t("cv.askAi")}
            </AskButton>
          </>
        }
      />

      <Container className="space-y-10 py-10 sm:py-14 lg:py-16">
        {profile ? (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Reveal>
              <Card className="h-full space-y-5 p-6 sm:p-8">
                <div className="flex items-start gap-5">
                  {profile.data.avatar ? (
                    <div
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-[#EEF5FF] dark:ring-white/[0.06]"
                      {...fieldProps(profile, "avatar")}
                    >
                      <MediaImage
                        src={profile.data.avatar}
                        alt={profile.t.name}
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Eyebrow icon={<User className="h-3.5 w-3.5" />}>{tx("cv.about")}</Eyebrow>
                    <h2 className="text-2xl font-bold tracking-tight text-[#173B6C] sm:text-3xl dark:text-[#F4F7FF]">
                      <span {...fieldProps(profile, "name")}>{profile.t.name}</span>
                    </h2>
                    <p className="text-sm font-semibold text-[#2F6FED] sm:text-base dark:text-indigo-400">
                      <span {...fieldProps(profile, "headline")}>{profile.t.headline}</span>
                    </p>
                  </div>
                </div>
                <div
                  className="space-y-4 text-sm leading-7 text-[#637089] dark:text-[#9AA8C0]"
                  {...fieldProps(profile, "about")}
                >
                  {profile.t.about.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={120}>
              <Card className="relative h-full overflow-hidden p-6 sm:p-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-[#BAE6FD]/25 blur-3xl dark:bg-cyan-500/10"
                />
                <div className="relative space-y-5">
                  <SectionTitle icon={<Sparkles className="h-5 w-5" />}>
                    {tx("cv.summary")}
                  </SectionTitle>
                  <p
                    className="text-sm leading-7 text-[#637089] dark:text-[#9AA8C0]"
                    {...fieldProps(profile, "summary")}
                  >
                    {profile.t.summary}
                  </p>
                  <ul className="space-y-2.5 text-sm">
                    {profile.t.location ? (
                      <li className="flex items-center gap-2.5 text-[#173B6C] dark:text-[#E2E8F0]">
                        <MapPin
                          className="h-4 w-4 text-[#2F6FED] dark:text-indigo-300"
                          aria-hidden="true"
                        />
                        <span {...fieldProps(profile, "location")}>{profile.t.location}</span>
                      </li>
                    ) : null}
                    {profile.data.email ? (
                      <li className="flex items-center gap-2.5">
                        <Mail
                          className="h-4 w-4 text-[#2F6FED] dark:text-indigo-300"
                          aria-hidden="true"
                        />
                        <a
                          href={`mailto:${profile.data.email}`}
                          dir="ltr"
                          className="font-medium text-[#173B6C] underline-offset-4 hover:underline dark:text-[#E2E8F0]"
                        >
                          {profile.data.email}
                        </a>
                      </li>
                    ) : null}
                    {profile.t.availability ? (
                      <li className="flex items-center gap-2.5 text-[#173B6C] dark:text-[#E2E8F0]">
                        <span className="relative ms-1 me-1 flex h-2 w-2">
                          <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span {...fieldProps(profile, "availability")}>
                          {profile.t.availability}
                        </span>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </Card>
            </Reveal>
          </div>
        ) : null}

        <section aria-labelledby="skills-title" className="space-y-5" {...listProps("skill_group")}>
          <Reveal>
            <SectionTitle id="skills-title" icon={<Layers className="h-5 w-5" />}>
              {tx("cv.skills")}
            </SectionTitle>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group, i) => (
              <Reveal key={group.id} delay={i * 80} {...entryProps(group, group.t.title)}>
                <Card className="group h-full space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF5FF] to-[#F3EEFE] text-[#2F6FED] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 dark:from-indigo-500/15 dark:to-cyan-500/10 dark:text-indigo-300">
                      <SkillIcon name={group.data.icon} className="h-4.5 w-4.5" />
                    </span>
                    <h3
                      className="font-semibold text-[#173B6C] dark:text-[#F4F7FF]"
                      {...fieldProps(group, "title")}
                    >
                      {group.t.title}
                    </h3>
                  </div>
                  {group.t.description ? (
                    <p
                      className="text-xs leading-relaxed text-[#637089] dark:text-[#9AA8C0]"
                      {...fieldProps(group, "description")}
                    >
                      {group.t.description}
                    </p>
                  ) : null}
                  <div {...fieldProps(group, "items")}>
                    <TechChips items={group.data.items} />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {education.length ? (
          <section
            aria-labelledby="education-title"
            className="space-y-5"
            {...listProps("education")}
          >
            <Reveal>
              <SectionTitle id="education-title" icon={<GraduationCap className="h-5 w-5" />}>
                {tx("cv.education")}
              </SectionTitle>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {education.map((item, i) => (
                <Reveal key={item.id} delay={i * 80} {...entryProps(item, item.t.degree)}>
                  <Card className="h-full space-y-2 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3
                        className="font-semibold text-[#173B6C] dark:text-[#F4F7FF]"
                        {...fieldProps(item, "degree")}
                      >
                        {item.t.degree}
                      </h3>
                      {formatPeriod(locale, item.data.startDate, item.data.endDate) ? (
                        <span className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#1E40AF] dark:border-indigo-500/30 dark:bg-indigo-950/70 dark:text-indigo-200">
                          {formatPeriod(locale, item.data.startDate, item.data.endDate)}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className="text-sm font-medium text-[#2F6FED] dark:text-indigo-300"
                      {...fieldProps(item, "institution")}
                    >
                      {item.t.institution}
                      {item.t.location ? (
                        <span className="text-[#637089] dark:text-[#9AA8C0]">
                          {" "}
                          · {item.t.location}
                        </span>
                      ) : null}
                    </p>
                    {item.t.summary ? (
                      <p
                        className="text-sm leading-relaxed text-[#637089] dark:text-[#9AA8C0]"
                        {...fieldProps(item, "summary")}
                      >
                        {item.t.summary}
                      </p>
                    ) : null}
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        <Reveal as="section" aria-labelledby="resume-title">
          <Card className="relative space-y-5 overflow-hidden p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-[#DDD6FE]/30 blur-3xl dark:bg-violet-500/10"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle id="resume-title" icon={<FileText className="h-5 w-5" />}>
                {tx("cv.resume")}
              </SectionTitle>
              {hasCv ? (
                <div className="flex flex-wrap gap-3">
                  <CvLink className="btn-action-primary">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t("cv.download")}
                  </CvLink>
                  <CvLink inline className="btn-action-secondary">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {t("cv.open")}
                  </CvLink>
                </div>
              ) : null}
            </div>
            {hasCv ? (
              <CvPreview
                label={t("cv.preview")}
                hideLabel={t("cv.hidePreview")}
                title={t("cv.resume")}
              />
            ) : (
              <p className="relative text-sm text-[#637089] dark:text-[#9AA8C0]">
                {tx("cv.noFile")}{" "}
                <Link
                  href={`/${locale}/contact`}
                  className="font-semibold text-[#2F6FED] underline-offset-4 hover:underline dark:text-indigo-300"
                >
                  {t("nav.contact")}
                </Link>
              </p>
            )}
          </Card>
        </Reveal>
      </Container>
    </div>
  );
}
