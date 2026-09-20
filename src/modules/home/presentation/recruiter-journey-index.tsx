"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

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
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Brand Header */}
      <header className="space-y-3 pb-8 sm:pb-12 border-b border-neutral-200/60 dark:border-neutral-800/60 text-start">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
          {isArabic ? "أنس الدحامشة" : "Anas Al Dahamsheh"}
        </h1>
        <p className="text-base sm:text-xl font-medium text-neutral-500 dark:text-neutral-400">
          {isArabic
            ? "مهندس ذكاء اصطناعي ومطور برمجيات شامل (Full-Stack)"
            : "AI Engineer & Full-Stack Developer"}
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-2xl pt-1">
          {isArabic
            ? "دليلك السريع للتعرف عليّ، استكشاف خبراتي العملية، مشاهدة مشاريعي الحية، وبدء التواصل."
            : "Your executive briefing to discover who I am, explore my experience, see live systems, and get in touch."}
        </p>
      </header>

      {/* Editorial Sections */}
      <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-start">
        {sections.map((item) => (
          <section key={item.id} className="py-8 sm:py-12 space-y-3">
            {/* Section Eyebrow */}
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              {item.category}
            </div>

            {/* Section Heading */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h2>

            {/* Section Description */}
            <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-3xl">
              {item.description}
            </p>

            {/* Direct Button */}
            <div className="pt-2">
              <Link
                href={item.href}
                className="group inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 hover:shadow-md dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
              >
                <span>{item.cta}</span>
                <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
