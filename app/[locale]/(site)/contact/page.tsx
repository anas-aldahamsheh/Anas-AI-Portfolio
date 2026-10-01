import type { Metadata } from "next";
import { ArrowUpRight, FileText, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { getProfile } from "@/server/content/repository";
import { PageHero } from "@/ui/page-hero";
import { Reveal } from "@/ui/motion/reveal";
import { Card, Container } from "@/ui/primitives";
import { fieldProps } from "@/ui/editable";
import { GithubIcon, LinkedinIcon } from "@/ui/icons";
import { CopyButton } from "@/features/contact/copy-button";
import { AskButton } from "@/features/assistant/ask-button";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  return {
    title: t("contact.hero.title"),
    description: t("contact.hero.subtitle"),
    alternates: { canonical: `/${locale}/contact` },
  };
}

const display = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = toLocale((await params).locale);
  const [{ t, tx }, profile] = await Promise.all([getTranslator(locale), getProfile(locale)]);

  const methods: {
    key: string;
    label: ReactNode;
    value: string;
    href: string;
    icon: ReactNode;
    copy?: string;
    external?: boolean;
    field: string;
    tone: string;
  }[] = [];
  if (profile?.data.email)
    methods.push({
      key: "email",
      label: tx("contact.email"),
      value: profile.data.email,
      href: `mailto:${profile.data.email}`,
      icon: <Mail className="h-5 w-5" />,
      copy: profile.data.email,
      field: "email",
      tone: "from-blue-500/15 to-cyan-500/10 text-[#2F6FED]",
    });
  if (profile?.data.showPhone && profile.data.phone)
    methods.push({
      key: "phone",
      label: tx("contact.phone"),
      value: profile.data.phone,
      href: `tel:${profile.data.phone.replace(/[^\d+]/g, "")}`,
      icon: <Phone className="h-5 w-5" />,
      copy: profile.data.phone,
      field: "phone",
      tone: "from-emerald-500/15 to-teal-500/10 text-emerald-600",
    });
  if (profile?.data.linkedin)
    methods.push({
      key: "linkedin",
      label: tx("contact.linkedin"),
      value: display(profile.data.linkedin),
      href: profile.data.linkedin,
      icon: <LinkedinIcon className="h-5 w-5" />,
      external: true,
      field: "linkedin",
      tone: "from-sky-500/15 to-blue-500/10 text-[#0A66C2]",
    });
  if (profile?.data.github)
    methods.push({
      key: "github",
      label: tx("contact.github"),
      value: display(profile.data.github),
      href: profile.data.github,
      icon: <GithubIcon className="h-5 w-5" />,
      external: true,
      field: "github",
      tone: "from-slate-500/15 to-slate-400/10 text-slate-800 dark:text-slate-200",
    });
  if (profile?.data.cv)
    methods.push({
      key: "cv",
      label: tx("contact.cv"),
      value: t("cv.download"),
      href: "/api/cv",
      icon: <FileText className="h-5 w-5" />,
      field: "cv",
      tone: "from-violet-500/15 to-fuchsia-500/10 text-violet-600",
    });

  return (
    <div className="w-full">
      <PageHero
        title={t("contact.hero.title")}
        titleKey="contact.hero.title"
        subtitle={t("contact.hero.subtitle")}
        subtitleKey="contact.hero.subtitle"
        eyebrow={
          profile?.data.openToWork ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {tx("contact.available")}
            </span>
          ) : undefined
        }
      />

      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((method, index) => (
            <Reveal key={method.key} delay={index * 70}>
              <Card className="group relative h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 dark:text-white ${method.tone}`}
                    aria-hidden="true"
                  >
                    {method.icon}
                  </span>
                  {method.copy ? (
                    <CopyButton
                      value={method.copy}
                      label={t("contact.copy")}
                      copiedLabel={t("contact.copied")}
                    />
                  ) : null}
                </div>
                <p className="mt-5 text-xs font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                  {method.label}
                </p>
                <a
                  href={method.href}
                  {...(method.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="mt-1 inline-flex items-center gap-1.5 text-base font-semibold break-all text-[#173B6C] after:absolute after:inset-0 after:content-[''] hover:text-[#2F6FED] dark:text-[#F4F7FF] dark:hover:text-indigo-300"
                  dir={method.key === "cv" ? undefined : "ltr"}
                >
                  {profile ? (
                    <span {...fieldProps(profile, method.field)}>{method.value}</span>
                  ) : (
                    method.value
                  )}
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </a>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <div
            data-pause-offscreen=""
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#173B6C] via-[#1E4B8A] to-[#2F6FED] p-8 text-white sm:p-10 dark:from-[#1e1b4b] dark:via-[#312e81] dark:to-[#4F46E5]"
          >
            <span
              className="beam [inset:0] [--beam-rest-dark:rgb(255_255_255/0.12)] [--beam-rest:rgb(255_255_255/0.14)]"
              aria-hidden="true"
            />
            <div
              aria-hidden="true"
              className="float-y pointer-events-none absolute -end-28 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(34_211_238/0.32),transparent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute start-0 -bottom-32 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.32),transparent)]"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-2">
                <h2 className="font-display text-2xl font-bold">{tx("contact.askTitle")}</h2>
                <p className="text-sm leading-relaxed text-white/80">{tx("contact.askText")}</p>
              </div>
              <AskButton
                variant="secondary"
                className="!border-white/20 !bg-white !text-[#173B6C] hover:!bg-white/90"
                prompt={
                  locale === "ar"
                    ? "هل أنس مناسب لوظيفة AI Engineer؟ وكيف أتواصل معه؟"
                    : "Is Anas a good fit for an AI Engineer role, and how do I reach him?"
                }
              >
                {t("chat.open")}
              </AskButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
