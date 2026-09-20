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
      title: isArabic
        ? "من هو أنس؟ العقلية الهندسية والسيرة الذاتية"
        : "Who is Anas? The Engineering Mindset & Resume",
      description: isArabic
        ? "مهندس ذكاء اصطناعي وبرمجيات شغوف ببناء أنظمة برمجية متينة ومبتكرة تحل مشكلات واقعية بأعلى معايير الكفاءة."
        : "AI & Full-Stack Engineer dedicated to crafting resilient, deterministic systems that solve complex real-world challenges.",
      href: `/${locale}/cv`,
      cta: isArabic ? "تعرّف عليّ واطلع على السيرة الذاتية" : "Explore Background & Resume",
    },
    {
      id: "experience",
      title: isArabic
        ? "الخبرة في الميدان: أثر ملموس وقيمة حقيقية لفرق العمل"
        : "Field Experience: Real Impact in Production Teams",
      description: isArabic
        ? "مسيرة عملية في تصميم وتطوير حلول برمجية متكاملة رفعت كفاءة الأداء وخدمت آلاف المستخدمين بنجاح."
        : "Hands-on track record engineering commercial software solutions that scale seamlessly and drive measurable value.",
      href: `/${locale}/experience`,
      cta: isArabic ? "استعرض الخبرات العملية والمسار المهني" : "View Experience & Track Record",
    },
    {
      id: "projects",
      title: isArabic
        ? "تطبيقات وأنظمة حية تثبت قدراتي التقنية"
        : "Live Applications & Systems Proving Technical Depth",
      description: isArabic
        ? "من وكلاء الذكاء الاصطناعي وخطوط RAG الهجينة إلى تطبيقات الويب عالية السرعة والموثوقية."
        : "From autonomous AI agents and multi-stage RAG pipelines to sub-millisecond, responsive web applications.",
      href: `/${locale}/projects`,
      cta: isArabic ? "شاهد المشاريع ودراسات الحالة الحية" : "Explore Live Projects & Systems",
    },
    {
      id: "certificates",
      title: isArabic
        ? "اعتمادات وشهادات عالمية تؤكد التميز والتعلّم المستمر"
        : "Verified Certifications & Continuous Mastery",
      description: isArabic
        ? "تخصصات معمقة واعتمادات رسمية من كبرى المنصات الدولية لضمان مواكبة أحدث المعايير البرمجية."
        : "Industry-recognized credentials and deep-dive specializations keeping engineering practices at the global cutting edge.",
      href: `/${locale}/certificates`,
      cta: isArabic ? "تصفح الشهادات والاعتمادات المعتمدة" : "Browse Verified Credentials",
    },
    {
      id: "contact",
      title: isArabic
        ? "جاهز لنصنع فارقاً حقيقياً في مشروعك القادم؟"
        : "Ready to Create Real Value for Your Next Big Project?",
      description: isArabic
        ? "متاح حالياً للمشاريع الاستراتيجية والفرص الوظيفية المؤثرة. يسعدني دائماً بدء حوار مثمر وبناء."
        : "Currently open to high-impact engineering roles and technical collaborations. Let's connect and build together.",
      href: `/${locale}/contact`,
      cta: isArabic ? "تواصل معي مباشرة لنبدأ" : "Get in Touch Directly",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl py-4 sm:py-8">
      {/* Editorial Header */}
      <header className="space-y-3 pb-8 sm:pb-12 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {isArabic
              ? "متاح للفرص والمشاريع التقنية المؤثرة"
              : "Available for High-Impact Roles & Projects"}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
          {isArabic ? "أنس الدحامشة" : "Anas Al Dahamsheh"}
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-2xl">
          {isArabic
            ? "دليلك السريع للتعرف عليّ، استكشاف خبراتي العملية، مشاهدة مشاريعي الحية، وبدء التواصل."
            : "Your executive briefing to discover who I am, explore my experience, see live systems, and get in touch."}
        </p>
      </header>

      {/* Editorial Sections: Marketing Header -> Few Words -> Button */}
      <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
        {sections.map((item) => (
          <section key={item.id} className="py-10 sm:py-12 space-y-3.5">
            {/* Marketing Header */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h2>

            {/* A few impactful words */}
            <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-2xl">
              {item.description}
            </p>

            {/* Direct Action Button */}
            <div className="pt-2">
              <Link
                href={item.href}
                className="group inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 hover:shadow-md dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
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
