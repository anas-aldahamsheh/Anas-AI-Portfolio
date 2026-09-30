import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowUpRight, FileText, Mail, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages";
import type { Entry } from "@/server/content/collections";
import { fieldProps } from "@/ui/editable";
import { GithubIcon, LinkedinIcon } from "@/ui/icons";
import { Reveal } from "@/ui/motion/reveal";
import { CvLink } from "@/ui/cv-link";

const NAV: { href: string; key: MessageKey }[] = [
  { href: "", key: "nav.overview" },
  { href: "/cv", key: "nav.cv" },
  { href: "/experience", key: "nav.experience" },
  { href: "/projects", key: "nav.projects" },
  { href: "/certificates", key: "nav.certificates" },
  { href: "/contact", key: "nav.contact" },
];

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export async function Footer({
  locale,
  profile,
}: {
  locale: Locale;
  profile: Entry<"profile"> | null;
}) {
  const { t, tx } = await getTranslator(locale);
  const year = await currentYear();
  const contacts = profile
    ? [
        profile.data.email && {
          href: `mailto:${profile.data.email}`,
          label: profile.data.email,
          icon: <Mail className="h-3.5 w-3.5" />,
          field: "email",
        },
        profile.data.showPhone &&
          profile.data.phone && {
            href: `tel:${profile.data.phone.replace(/[^\d+]/g, "")}`,
            label: profile.data.phone,
            icon: <Phone className="h-3.5 w-3.5" />,
            field: "phone",
          },
        profile.data.linkedin && {
          href: profile.data.linkedin,
          label: displayUrl(profile.data.linkedin),
          icon: <LinkedinIcon className="h-3.5 w-3.5" />,
          field: "linkedin",
          external: true,
        },
        profile.data.github && {
          href: profile.data.github,
          label: displayUrl(profile.data.github),
          icon: <GithubIcon className="h-3.5 w-3.5" />,
          field: "github",
          external: true,
        },
      ].filter(Boolean)
    : [];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[#E5EAF2] dark:border-white/[0.08]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/4 -bottom-40 h-72 w-[36rem] rounded-full bg-gradient-to-r from-[#BAE6FD]/40 to-[#DDD6FE]/40 blur-[110px] dark:from-[#0284c7]/10 dark:to-[#7c3aed]/10"
      />
      <div className="relative mx-auto max-w-[1420px] px-4 py-12 sm:px-6 md:py-16 lg:px-10">
        <div className="grid gap-10 text-start sm:grid-cols-2 md:grid-cols-3">
          <Reveal className="space-y-3">
            <div>
              <p className="text-base font-bold tracking-tight text-[#173B6C] dark:text-[#F6F8FC]">
                {profile ? <span {...fieldProps(profile, "name")}>{profile.t.name}</span> : null}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#2F6FED] dark:text-indigo-400">
                {profile ? (
                  <span {...fieldProps(profile, "headline")}>{profile.t.headline}</span>
                ) : null}
              </p>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-[#637089] dark:text-[#9AA8C0]">
              {tx("footer.tagline")}
            </p>
            {profile?.data.openToWork ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {tx("contact.available")}
              </p>
            ) : null}
          </Reveal>

          <Reveal delay={90} className="space-y-3.5">
            <h2 className="text-xs font-bold tracking-wider text-[#173B6C] uppercase dark:text-[#F6F8FC]">
              {tx("footer.connect")}
            </h2>
            <ul className="flex flex-col items-start gap-2.5 text-xs">
              {contacts.map((item) =>
                item ? (
                  <li key={item.field}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group inline-flex items-center gap-2.5 font-medium text-[#637089] transition-colors hover:text-[#2F6FED] dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-blue-50 group-hover:text-[#2F6FED] dark:bg-white/[0.04] dark:text-neutral-300 dark:group-hover:bg-white/[0.08] dark:group-hover:text-white">
                        {item.icon}
                      </span>
                      <span dir="ltr" className="font-mono text-xs">
                        {item.label}
                      </span>
                    </a>
                  </li>
                ) : null,
              )}
              {profile?.data.cv ? (
                <li>
                  <CvLink className="group inline-flex items-center gap-2.5 font-medium text-[#637089] transition-colors hover:text-[#2F6FED] dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-blue-50 group-hover:text-[#2F6FED] dark:bg-white/[0.04] dark:text-neutral-300 dark:group-hover:bg-white/[0.08] dark:group-hover:text-white">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    {t("cv.download")}
                  </CvLink>
                </li>
              ) : null}
            </ul>
          </Reveal>

          <Reveal delay={180} className="space-y-3.5">
            <h2 className="text-xs font-bold tracking-wider text-[#173B6C] uppercase dark:text-[#F6F8FC]">
              {tx("footer.navigate")}
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="group inline-flex items-center gap-1 font-medium text-[#637089] transition-colors hover:text-[#2F6FED] dark:text-[#9AA8C0] dark:hover:text-white"
                  >
                    {t(item.key)}
                    <ArrowUpRight
                      className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:translate-x-1 rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#E5EAF2] pt-6 text-[11px] text-[#637089] sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:text-[#9AA8C0]">
          <p>
            © {year} {profile?.t.name}. {tx("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            <p className="hidden md:block">{tx("footer.builtWith")}</p>
            <Link
              href={`/${locale}/sign-in`}
              className="opacity-60 transition-opacity hover:opacity-100"
              rel="nofollow"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
