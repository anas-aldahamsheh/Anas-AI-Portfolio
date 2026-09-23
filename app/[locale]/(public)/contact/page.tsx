import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ExternalLink, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import type { SupportedLocale } from "@/modules/localization/domain/locales";
import { DEVELOPER_PROFILE } from "@/lib/config/developer-profile";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تواصل معي | أنس الدحامشة" : "Contact Anas Al Dahamsheh | AI Engineer",
    description: isAr
      ? "تواصل مباشرة مع أنس الدحامشة لمناقشة فرص العمل، المشاريع الهندسية، والتعاون التقني."
      : "Get in touch directly with Anas Al Dahamsheh to discuss AI Engineer roles, project collaborations, and technical opportunities.",
  };
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "ar" ? "ar" : "en") as SupportedLocale;
  const isAr = supportedLocale === "ar";

  const contactChannels = [
    {
      title: isAr ? "البريد الإلكتروني" : "Email",
      value: DEVELOPER_PROFILE.email.address,
      href: DEVELOPER_PROFILE.email.href,
      description: isAr
        ? "للاستفسارات الرسمية، التوظيف، والتعاون التقني"
        : "Best for job inquiries, discussions, and formal notes",
      icon: Mail,
      actionLabel: isAr ? "إرسال بريد" : "Send Email",
    },
    {
      title: isAr ? "رقم الهاتف والواتساب" : "Direct Phone / WhatsApp",
      value: DEVELOPER_PROFILE.phone.display,
      href: DEVELOPER_PROFILE.phone.href,
      description: isAr
        ? "للتواصل السريع والمكالمات الهاتفية المباشرة"
        : "Direct line for quick inquiries or telephone discussions",
      icon: Phone,
      actionLabel: isAr ? "اتصال فوري" : "Call Directly",
    },
    {
      title: "LinkedIn",
      value: DEVELOPER_PROFILE.linkedin.display,
      href: DEVELOPER_PROFILE.linkedin.url,
      description: isAr
        ? "الملف المهني وتفاصيل الشبكة التقنية"
        : "Professional network, endorsements, and direct messaging",
      icon: LinkedinIcon,
      actionLabel: isAr ? "زيارة الملف" : "View Profile",
    },
    {
      title: "GitHub",
      value: DEVELOPER_PROFILE.github.display,
      href: DEVELOPER_PROFILE.github.url,
      description: isAr
        ? "المستودعات البرمجية والمشاريع المفتوحة"
        : "Source code, architectural implementations, and commits",
      icon: GithubIcon,
      actionLabel: isAr ? "استعراض الأكواد" : "View Repositories",
    },
  ];

  return (
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        badge={
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3.5 py-1 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
            <Mail className="h-3.5 w-3.5" />
            <span>{isAr ? "بيانات وقنوات الاتصال المباشر" : "Direct Contact Channels"}</span>
          </div>
        }
        title={isAr ? "تواصل معي مباشرة" : "Let's Connect"}
        subtitle={
          isAr
            ? "متاح حالياً لفرص العمل كمهندس ذكاء اصطناعي (AI Engineer)، وأدوار هندسة البرمجيات السحابية، والتعاون في بناء الأنظمة الذكية."
            : "Currently open for AI Engineer positions, systems engineering roles, and high-impact technical collaborations."
        }
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1420px] px-4 pb-16 sm:px-6 lg:px-10">
        {/* Contact Channels Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {contactChannels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D0E2FF] hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
              >
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                        {channel.title}
                      </h2>
                      <p className="font-mono text-xs font-semibold text-[#2F6FED] dark:text-indigo-300">
                        {channel.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3.5 text-xs leading-relaxed text-[#6C7893] sm:text-sm dark:text-[#9AA8C0]">
                    {channel.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#E5EAF2] pt-4 dark:border-white/[0.06]">
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-4 py-2 text-xs font-semibold text-[#173B6C] transition-all hover:bg-[#E0EEFF] hover:text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#F4F7FF] dark:hover:bg-white/[0.08]"
                  >
                    <span>{channel.actionLabel}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Recruiter Prompt Assistant */}
        <FadeIn delay={0.15}>
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-[#D0E2FF] bg-gradient-to-br from-[#EEF5FF] via-white to-[#F0F5FF] p-6 shadow-sm sm:p-8 dark:border-white/[0.1] dark:from-white/[0.04] dark:via-white/[0.02] dark:to-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                {isAr
                  ? "هل لديك استفسار محدد لمسؤولي التوظيف؟"
                  : "Have a specific recruiter question?"}
              </h3>
            </div>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#6C7893] sm:text-sm dark:text-[#9AA8C0]">
              {isAr
                ? "يمكنك استخدام المساعد الذكي المعتمد على الـ RAG والمدرّب على بيانات أنس الموثقة للإجابة فوراً عن أي تساؤل يتعلق بالخبرات، الأكواد، أو المهارات."
                : "You can also ask the conversational RAG assistant anytime to get immediate, evidence-grounded answers about Anas's qualifications, architecture decisions, and code."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/${supportedLocale}?chat=open`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full bg-[#173B6C] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1E4B8A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  <span>
                    {isAr ? "فتح المساعد الذكي (Ask About Anas)" : "Ask About Anas (RAG Assistant)"}
                  </span>
                </Button>
              </Link>
              <Link href={`/${supportedLocale}/cv`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-4 py-2.5 text-xs font-semibold text-[#2F6FED] shadow-2xs hover:bg-[#E0EEFF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isAr ? "السيرة الذاتية (PDF)" : "Download Resume (PDF)"}</span>
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
