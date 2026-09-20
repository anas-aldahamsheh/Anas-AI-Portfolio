"use client";

import Link from "next/link";
import {
  User,
  Briefcase,
  Code2,
  Award,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export interface RecruiterJourneyIndexProps {
  locale: string;
}

export function RecruiterJourneyIndex({ locale }: RecruiterJourneyIndexProps) {
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const sections = [
    {
      id: "about",
      category: isArabic ? "نبذة والسيرة الذاتية" : "About & Resume",
      title: isArabic
        ? "القصة وراء رحلتي الهندسية"
        : "The Story Behind My Engineering Journey",
      description: isArabic
        ? "استكشف خلفيتي، تعليمي، نقاط قوتي التقنية، وسيرتي الذاتية للحصول على رؤية شاملة عن هويتي كمهندس."
        : "Explore my background, education, technical strengths, and resume for a complete view of who I am as an engineer.",
      href: `/${locale}/cv`,
      cta: isArabic ? "اكتشف مسيرتي الشخصية" : "Discover My Profile",
      icon: User,
      lightIconColor: "bg-blue-50 text-[#2F6FED] border-blue-100/80",
      darkIconColor: "dark:bg-neutral-900/90 dark:text-blue-400 dark:border-white/[0.08]",
    },
    {
      id: "experience",
      category: isArabic ? "الخبرات العملية" : "Experience",
      title: isArabic
        ? "مسار مهني بُني من خلال العمل الميداني الحقيقي"
        : "A Career Built Through Hands-On Work",
      description: isArabic
        ? "استكشف الشركات التي عملت معها، الأدوار التي شغلتها، والخبرات التي اكتسبتها على طول الطريق."
        : "Explore the companies I’ve worked with, the roles I’ve held, and the experience I’ve gained along the way.",
      href: `/${locale}/experience`,
      cta: isArabic ? "استعرض رحلتي المهنية" : "View My Journey",
      icon: Briefcase,
      lightIconColor: "bg-emerald-50 text-emerald-600 border-emerald-100/80",
      darkIconColor: "dark:bg-neutral-900/90 dark:text-emerald-400 dark:border-white/[0.08]",
    },
    {
      id: "projects",
      category: isArabic ? "المشاريع" : "Projects",
      title: isArabic
        ? "شاهد ما قمت ببنائه على أرض الواقع"
        : "See What I’ve Actually Built",
      description: isArabic
        ? "استكشف أنظمة الذكاء الاصطناعي، أدوات الأتمتة، والمشاريع البرمجية التي تحوّل الأفكار والتحديات التقنية إلى حلول واقعية تعمل بكفاءة."
        : "Explore AI systems, automation tools, and software projects that turn ideas and technical challenges into working solutions.",
      href: `/${locale}/projects`,
      cta: isArabic ? "استكشف أعمالي ومشاريعي" : "Explore My Work",
      icon: Code2,
      lightIconColor: "bg-purple-50 text-purple-600 border-purple-100/80",
      darkIconColor: "dark:bg-neutral-900/90 dark:text-purple-400 dark:border-white/[0.08]",
    },
    {
      id: "certificates",
      category: isArabic ? "الدورات والشهادات" : "Certificates",
      title: isArabic
        ? "تعلّم دائم.. وبناء مستمر."
        : "Always Learning. Always Building.",
      description: isArabic
        ? "استكشف الدورات والشهادات المهنية التي تواصل توسيع معرفتي وقدراتي التقنية."
        : "Explore the courses and professional certifications that continue to expand my knowledge and technical capabilities.",
      href: `/${locale}/certificates`,
      cta: isArabic ? "تصفح مسار التعلّم والشهادات" : "Explore My Learning",
      icon: Award,
      lightIconColor: "bg-amber-50 text-amber-600 border-amber-100/80",
      darkIconColor: "dark:bg-neutral-900/90 dark:text-amber-400 dark:border-white/[0.08]",
    },
    {
      id: "contact",
      category: isArabic ? "التواصل" : "Contact",
      title: isArabic
        ? "لنصنع شيئاً ذا قيمة حقيقية معاً"
        : "Let’s Build Something Valuable",
      description: isArabic
        ? "متاح لفرص هندسة الذكاء الاصطناعي، المشاريع البرمجية، التعاون التقني، والتحديات ذات الأثر الحقيقي."
        : "Open to AI engineering opportunities, software projects, technical collaborations, and meaningful challenges.",
      href: `/${locale}/contact`,
      cta: isArabic ? "لنتواصل الآن" : "Let’s Connect",
      icon: Mail,
      lightIconColor: "bg-rose-50 text-rose-600 border-rose-100/80",
      darkIconColor: "dark:bg-neutral-900/90 dark:text-rose-400 dark:border-white/[0.08]",
    },
  ];

  return (
    <div className="w-full">
      {/* 
        ==================================================
        FULL-WIDTH HERO SECTION (Edge-to-Edge matching Image 3)
        Full bleed width across the entire viewport (100vw),
        with subtle atmospheric gradient and ambient glow layers.
        Adapts seamlessly to Light and Dark Mode.
        ==================================================
      */}
      <section
        className="relative w-full border-b border-[#E5EAF2] bg-gradient-to-r from-[#EBF5FF] via-[#F4F8FF] to-[#FAF5FF] overflow-hidden transition-colors duration-300 dark:border-white/[0.08] dark:bg-gradient-to-r dark:from-[#0B1528] dark:via-[#07101F] dark:to-[#050B16]"
        aria-label={isArabic ? "المقدمة" : "Hero"}
      >
        {/* Ambient atmospheric layers */}
        <div
          className="pointer-events-none absolute -top-32 start-0 h-96 w-[550px] rounded-full bg-[#DDEEFF]/60 blur-3xl dark:bg-indigo-900/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 end-0 h-96 w-[500px] rounded-full bg-[#EEE9FF]/60 blur-3xl dark:bg-blue-900/25"
          aria-hidden="true"
        />

        {/* Subtle radial pattern matching Image 3 */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2F6FED_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] dark:opacity-[0.05]"
          aria-hidden="true"
        />

        {/* Centered Content Container */}
        <div className="relative z-10 mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 text-start">
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-[#0B1530] leading-[1.1] dark:text-[#F6F8FC]">
            {isArabic ? "أنس الدحامشة" : "Anas Al Dahamsheh"}
          </h1>
          <p className="mt-3 sm:mt-4 text-xl sm:text-2xl lg:text-[26px] font-medium tracking-tight text-[#6C7893] dark:text-[#9AA8C0]">
            {isArabic
              ? "مهندس ذكاء اصطناعي ومطور برمجيات شامل (Full-Stack)"
              : "AI Engineer & Full-Stack Developer"}
          </p>
        </div>
      </section>

      {/* 
        ==================================================
        5 NAVIGATION DESTINATION ROWS
        Centered within max-w-[1420px] content grid.
        ==================================================
      */}
      <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
        <div
          className="w-full divide-y divide-[#E5EAF2] border-t border-b border-[#E5EAF2] dark:divide-white/[0.08] dark:border-white/[0.08]"
          role="navigation"
          aria-label={isArabic ? "وجهات الاستكشاف" : "Destination Sections"}
        >
          {sections.map((item) => {
            const SectionIcon = item.icon;

            return (
              <article
                key={item.id}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 sm:py-7 lg:py-8 px-4 -mx-4 rounded-2xl transition-colors duration-200 hover:bg-[#F8FAFF]/80 dark:hover:bg-white/[0.02]"
              >
                {/* Left Zone + Center Zone Container */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 text-start">
                  {/* ZONE 1: ICON BLOCK (56-64px rounded square) */}
                  <div
                    className={`flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${item.lightIconColor} ${item.darkIconColor}`}
                    aria-hidden="true"
                  >
                    <SectionIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  {/* ZONE 2: CONTENT (Category, Headline, Description) */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#6C7893] dark:text-[#9AA8C0]">
                      {item.category}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1530] dark:text-[#F6F8FC]">
                      <Link
                        href={item.href}
                        className="hover:underline focus:outline-none focus:ring-2 focus:ring-[#2F6FED] rounded-md"
                      >
                        {item.title}
                      </Link>
                    </h2>

                    <p className="text-sm sm:text-[15px] leading-relaxed text-[#6C7893] dark:text-[#9AA8C0] max-w-2xl lg:max-w-3xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* ZONE 3: CTA BUTTON (Rounded pill with animated arrow) */}
                <div className="shrink-0 pt-2 md:pt-0">
                  <Link
                    href={item.href}
                    className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-full px-5 sm:px-6 text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#EEF5FF] text-[#2F6FED] border border-[#D0E2FF] hover:bg-[#E0EEFF] shadow-2xs hover:shadow-xs dark:bg-white/[0.04] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.08] dark:hover:border-indigo-500/40 dark:hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED]"
                  >
                    <span>{item.cta}</span>
                    <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
