import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Briefcase, Code2, Download, Mail, User } from "lucide-react";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages";
import { getProfile, listEntries } from "@/server/content/repository";
import { getQuickQuestions } from "@/ai/settings";
import { AuroraBackdrop } from "@/ui/page-hero";
import { SplitText, Reveal } from "@/ui/motion/reveal";
import { fieldProps } from "@/ui/editable";
import { CountUp } from "@/ui/count-up";
import { Marquee } from "@/ui/marquee";
import { RolesTypewriter } from "@/features/home/roles-typewriter";
import { HomeAskBox } from "@/features/home/home-ask-box";
import { CvLink } from "@/ui/cv-link";

const SECTIONS: {
  id: "about" | "experience" | "projects" | "certificates" | "contact";
  href: string;
  icon: typeof User;
  tone: string;
}[] = [
  {
    id: "about",
    href: "/cv",
    icon: User,
    tone: "bg-blue-50 text-[#2F6FED] border-blue-100/80 dark:text-blue-400",
  },
  {
    id: "experience",
    href: "/experience",
    icon: Briefcase,
    tone: "bg-emerald-50 text-emerald-600 border-emerald-100/80 dark:text-emerald-400",
  },
  {
    id: "projects",
    href: "/projects",
    icon: Code2,
    tone: "bg-purple-50 text-purple-600 border-purple-100/80 dark:text-purple-400",
  },
  {
    id: "certificates",
    href: "/certificates",
    icon: Award,
    tone: "bg-amber-50 text-amber-600 border-amber-100/80 dark:text-amber-400",
  },
  {
    id: "contact",
    href: "/contact",
    icon: Mail,
    tone: "bg-rose-50 text-rose-600 border-rose-100/80 dark:text-rose-400",
  },
];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = toLocale((await params).locale);
  const [{ t, tx }, profile, projects, experience, certificates, skills, questions] =
    await Promise.all([
      getTranslator(locale),
      getProfile(locale),
      listEntries("project", locale),
      listEntries("experience", locale),
      listEntries("certificate", locale),
      listEntries("skill_group", locale),
      getQuickQuestions(locale),
    ]);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const name = profile?.t.name ?? "";
  const roles = profile?.t.roles.length ? profile.t.roles : [profile?.t.headline ?? ""];
  const technologies = [
    ...new Set([
      ...skills.flatMap((s) => s.data.items),
      ...projects.flatMap((p) => p.data.tags),
      ...experience.flatMap((e) => e.data.technologies),
    ]),
  ].slice(0, 36);
  const stats: { key: MessageKey; value: number }[] = [
    { key: "home.stats.projects", value: projects.length },
    { key: "home.stats.roles", value: experience.length },
    { key: "home.stats.certificates", value: certificates.length },
    { key: "home.stats.technologies", value: technologies.length },
  ].filter((s) => s.value > 0) as { key: MessageKey; value: number }[];

  return (
    <div className="w-full">
      <section
        className="grain relative w-full overflow-hidden bg-white dark:bg-[#07101F]"
        aria-labelledby="hero-name"
      >
        <AuroraBackdrop intensity="home" />
        <div className="relative z-10 mx-auto max-w-[1420px] px-4 py-14 text-start sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className="relative inline-block w-full">
            <h1
              id="hero-name"
              className="font-display relative text-4xl leading-[1.1] font-bold tracking-tight text-[#173B6C] sm:text-5xl md:text-6xl lg:text-[64px] dark:text-[#F4F7FF]"
            >
              {profile ? (
                <span {...fieldProps(profile, "name")}>
                  <SplitText text={name} baseDelay={120} step={34} />
                </span>
              ) : null}
            </h1>
            <span
              className="hero-name-shimmer-sweep"
              style={{ ["--shimmer-delay" as string]: "1100ms" }}
              aria-hidden="true"
            />
          </div>

          <p
            data-reveal="blur"
            style={{ ["--reveal-delay" as string]: "450ms" }}
            className="font-ui mt-4 text-lg leading-relaxed font-medium text-[#64748B] sm:text-xl md:text-[22px] dark:text-[#A7B3C7]"
          >
            {profile ? (
              <span {...fieldProps(profile, "roles")}>
                <RolesTypewriter roles={roles} />
              </span>
            ) : null}
          </p>

          {profile?.t.tagline ? (
            <p
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: "580ms" }}
              className="mt-3 max-w-2xl text-sm leading-relaxed text-[#637089] sm:text-base dark:text-[#9AA8C0]"
            >
              <span {...fieldProps(profile, "tagline")}>{profile.t.tagline}</span>
            </p>
          ) : null}

          <div
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "700ms" }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link href={`/${locale}/projects`} className="btn-action-primary group">
              {tx("home.hero.ctaProjects")}
              <Arrow
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </Link>
            {profile?.data.cv ? (
              <CvLink className="btn-action-secondary group">
                <Download
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
                {tx("home.hero.ctaCv")}
              </CvLink>
            ) : null}
            <Link href={`/${locale}/contact`} className="btn-action-secondary">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {tx("home.hero.ctaContact")}
            </Link>
          </div>

          <div data-reveal="up" style={{ ["--reveal-delay" as string]: "820ms" }} className="mt-9">
            <HomeAskBox questions={questions} />
          </div>

          {stats.length ? (
            <dl
              data-reveal="fade"
              style={{ ["--reveal-delay" as string]: "950ms" }}
              className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="rounded-2xl border border-[#E5EAF2] bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
                >
                  <dt className="text-[11px] font-semibold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                    {tx(stat.key)}
                  </dt>
                  <dd className="font-display mt-1 text-2xl font-bold text-[#173B6C] tabular-nums dark:text-white">
                    <CountUp
                      value={stat.value}
                      suffix={stat.key === "home.stats.technologies" ? "+" : ""}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      {technologies.length ? (
        <div className="border-y border-[#E5EAF2] bg-[#F8FAFF]/60 py-4 dark:border-white/[0.06] dark:bg-white/[0.015]">
          <Marquee items={technologies} />
        </div>
      ) : null}

      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <nav
          aria-label={t("home.sections.label")}
          className="w-full divide-y divide-[#E5EAF2] border-b border-[#E5EAF2] dark:divide-white/[0.08] dark:border-white/[0.08]"
        >
          {SECTIONS.map((item, index) => {
            const Icon = item.icon;
            const base = `home.section.${item.id}` as const;
            return (
              <Reveal
                as="article"
                key={item.id}
                delay={index * 90}
                className="group relative -mx-4 flex flex-col justify-between gap-6 rounded-2xl px-4 py-6 transition-colors duration-300 hover:bg-[#F8FAFF]/80 sm:py-7 md:flex-row md:items-center lg:py-8 dark:hover:bg-white/[0.02]"
              >
                <div className="flex flex-1 flex-col items-start gap-5 text-start sm:flex-row sm:items-center sm:gap-6">
                  <div
                    aria-hidden="true"
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 sm:h-16 sm:w-16 dark:border-white/[0.08] dark:bg-neutral-900/90 ${item.tone}`}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-xs font-medium tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                      {tx(`${base}.category`)}
                    </p>
                    <h2 className="text-xl font-bold tracking-tight text-[#173B6C] sm:text-2xl dark:text-[#F6F8FC]">
                      {tx(`${base}.title`)}
                    </h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-[#637089] sm:text-[15px] lg:max-w-3xl dark:text-[#9AA8C0]">
                      {tx(`${base}.description`)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 pt-2 md:pt-0">
                  <Link
                    href={`/${locale}${item.href}`}
                    className="inline-flex h-11 w-[220px] items-center justify-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-4 text-sm font-semibold tracking-tight text-[#2F6FED] shadow-2xs transition-all duration-300 hover:bg-[#E0EEFF] hover:shadow-[0_10px_24px_-12px_rgba(47,111,237,0.55)] sm:h-12 sm:w-[235px] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:border-indigo-500/40 dark:hover:bg-white/[0.08] dark:hover:shadow-[0_0_18px_rgba(99,102,241,0.2)]"
                  >
                    {tx(`${base}.cta`)}
                    <Arrow
                      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
