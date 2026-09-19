import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ExternalLink, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

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
      value: "anashusam268@gmail.com",
      href: "mailto:anashusam268@gmail.com",
      description: isAr
        ? "للاستفسارات الرسمية، التوظيف، والتعاون التقني"
        : "Best for job inquiries, discussions, and formal notes",
      icon: Mail,
      actionLabel: isAr ? "إرسال بريد" : "Send Email",
    },
    {
      title: isAr ? "رقم الهاتف والواتساب" : "Direct Phone / WhatsApp",
      value: "+962 789 495 167",
      href: "tel:+962789495167",
      description: isAr
        ? "للتواصل السريع والمكالمات الهاتفية المباشرة"
        : "Direct line for quick inquiries or telephone discussions",
      icon: Phone,
      actionLabel: isAr ? "اتصال فوري" : "Call Directly",
    },
    {
      title: "LinkedIn",
      value: "linkedin.com/in/anas-aldahamsheh",
      href: "https://www.linkedin.com/in/anas-aldahamsheh",
      description: isAr
        ? "الملف المهني وتفاصيل الشبكة التقنية"
        : "Professional network, endorsements, and direct messaging",
      icon: LinkedinIcon,
      actionLabel: isAr ? "زيارة الملف" : "View Profile",
    },
    {
      title: "GitHub",
      value: "github.com/anas-aldahamsheh",
      href: "https://github.com/anas-aldahamsheh",
      description: isAr
        ? "المستودعات البرمجية والمشاريع المفتوحة"
        : "Source code, architectural implementations, and commits",
      icon: GithubIcon,
      actionLabel: isAr ? "استعراض الأكواد" : "View Repositories",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn delay={0.05}>
        <div className="space-y-3 text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <Mail className="h-3.5 w-3.5" />
            <span>{isAr ? "بيانات الاتصال" : "Direct Contact"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
            {isAr ? "تواصل معي مباشرة" : "Let's Connect"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
            {isAr
              ? "متاح حالياً لفرص العمل كمهندس ذكاء اصطناعي (AI Engineer)، وأدوار هندسة البرمجيات السحابية، والتعاون في بناء الأنظمة الذكية."
              : "Currently open for AI Engineer positions, systems engineering roles, and high-impact technical collaborations."}
          </p>
        </div>
      </FadeIn>

      {/* Contact Channels Grid */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {contactChannels.map((channel, idx) => {
          const Icon = channel.icon;
          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {channel.title}
                  </h2>
                </div>
                <p className="mt-2 font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  {channel.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {channel.description}
                </p>
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <a
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-800 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-100"
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
        <div className="mt-12 rounded-xl border border-neutral-200/80 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {isAr
                ? "هل لديك استفسار محدد لمسؤولي التوظيف؟"
                : "Have a specific recruiter question?"}
            </h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-400">
            {isAr
              ? "يمكنك استخدام المساعد الذكي المعتمد على الـ RAG والمدرّب على بيانات أنس الموثقة للإجابة فوراً عن أي تساؤل يتعلق بالخبرات، الأكواد، أو المهارات."
              : "You can also ask the conversational RAG assistant anytime to get immediate, evidence-grounded answers about Anas's qualifications, architecture decisions, and code."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href={`/${supportedLocale}/chat`}>
              <Button variant="primary" size="sm">
                <span>
                  {isAr ? "فتح المساعد الذكي (Ask About Anas)" : "Ask About Anas (RAG Assistant)"}
                </span>
              </Button>
            </Link>
            <Link href={`/${supportedLocale}/cv`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                <span>{isAr ? "السيرة الذاتية (PDF)" : "Download Resume (PDF)"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
