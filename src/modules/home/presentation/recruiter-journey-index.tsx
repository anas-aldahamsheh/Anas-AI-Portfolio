"use client";

import Link from "next/link";
import {
  FileText,
  Briefcase,
  FolderGit2,
  Award,
  Mail,
  Download,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Layers,
  MessageSquare,
} from "lucide-react";

export interface RecruiterJourneyIndexProps {
  locale: string;
}

export function RecruiterJourneyIndex({ locale }: RecruiterJourneyIndexProps) {
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const journeySteps = [
    {
      id: "step-about",
      stepNumber: "01",
      destination: isArabic ? "نبذة والسيرة الذاتية" : "About & Resume",
      href: `/${locale}/cv`,
      icon: FileText,
      badgeText: isArabic ? "الرؤية والمسيرة" : "Story & Mindset",
      title: isArabic
        ? "الرؤية الهندسية، الخلفية، والمسيرة"
        : "The Engineering Story, Philosophy & Background",
      bullets: isArabic
        ? [
            "فلسفة معمارية تركز على أنظمة الذكاء الاصطناعي القطعية والموثوقة.",
            "خبرة راسخة في هندسة الويب وتطوير المنظومات المتكاملة (Full-Stack).",
            "إمكانية تنزيل السيرة الذاتية الرسمية بنقرة واحدة بصيغة PDF.",
          ]
        : [
            "Architectural focus on deterministic, production-grade AI systems.",
            "Solid full-stack engineering background across modern cloud platforms.",
            "Instant 1-click verified PDF resume download.",
          ],
      tags: isArabic
        ? ["هندسة الويب المتكاملة", "تفكير معماري", "سيرة ذاتية PDF"]
        : ["Full-Stack AI", "Systems Architecture", "PDF Resume"],
      ctaText: isArabic ? "استكشف النبذة والسيرة الذاتية" : "Explore About & Resume",
    },
    {
      id: "step-experience",
      stepNumber: "02",
      destination: isArabic ? "الخبرات العملية" : "Experience",
      href: `/${locale}/experience`,
      icon: Briefcase,
      badgeText: isArabic ? "الأثر الملموس" : "Track Record",
      title: isArabic
        ? "المسار المهني، المناصب، والأثر الواقعي"
        : "Career Roles, Milestones & Commercial Impact",
      bullets: isArabic
        ? [
            "تطوير ونشر حلول برمجية تجارية في بيئات عمل إنتاجية سريعة النمو.",
            "إدارة دورة حياة النظام من قواعد البيانات وحتى بيئة الاستضافة السحابية.",
            "حوكمة جودة الكود، المعايير القياسية، والتعاون التقني الفعّال.",
          ]
        : [
            "Delivering robust commercial software in fast-paced production environments.",
            "End-to-end delivery from database architecture to resilient cloud hosting.",
            "Cross-functional technical leadership and code quality governance.",
          ],
      tags: isArabic
        ? ["حلول المؤسسات", "تسليم إنتاجي", "تطوير مستمر"]
        : ["Enterprise Solutions", "Production Delivery", "Scalable Systems"],
      ctaText: isArabic ? "استعرض المسار المهني والخبرات" : "View Career Experience",
    },
    {
      id: "step-projects",
      stepNumber: "03",
      destination: isArabic ? "المشاريع ودراسات الحالة" : "Projects",
      href: `/${locale}/projects`,
      icon: FolderGit2,
      badgeText: isArabic ? "إثبات عملي" : "Proof of Engineering",
      title: isArabic
        ? "معماريات وأنظمة مبنية للإنتاج الحقيقي"
        : "Engineered Architectures Built for Real-World Scale",
      bullets: isArabic
        ? [
            "أنظمة Hybrid RAG متقدمة تدمج المتجهات الدلالية مع الفهرسة المعجمية.",
            "وكلاء أذكياء (Autonomous Agents) مع استدعاء الأدوات وسياجات الأمان.",
            "معالجة صوتية لحظية فائقة السرعة مع ديمو حي وكود مصدري موثق.",
          ]
        : [
            "Advanced Hybrid RAG combining dense BGE-M3 vectors + BM25 lexical fusion.",
            "Autonomous Agents featuring deterministic tool-calling & reflection loops.",
            "Ultra low-latency neural speech streaming with live interactive demos.",
          ],
      tags: isArabic
        ? ["Hybrid RAG", "الوكلاء الأذكياء", "ديمو حي وكود مفتوح"]
        : ["Hybrid RAG", "Agentic Workflows", "Live Demos & GitHub"],
      ctaText: isArabic ? "استكشف المشاريع ودراسات الحالة" : "Explore Projects & Case Studies",
    },
    {
      id: "step-certificates",
      stepNumber: "04",
      destination: isArabic ? "الدورات والشهادات" : "Certificates",
      href: `/${locale}/certificates`,
      icon: Award,
      badgeText: isArabic ? "تدريب معتمد" : "Verified Credentials",
      title: isArabic
        ? "التدريب التخصصي والاعتمادات العالمية"
        : "Specialized Training & Recognized Certifications",
      bullets: isArabic
        ? [
            "اعتمادات تخصصية متقدمة في أحدث تقنيات RAG وهندسة الوكلاء الأذكياء.",
            "برامج تدريبية من DeepLearning.AI و Stanford Online ومؤسسات رائدة.",
            "كتالوج منظم يوضح المهارات المكتسبة والتقنيات المجتازة بدقة.",
          ]
        : [
            "Specialized masteries in advanced RAG, Agentic AI, and Cloud.",
            "Completed programs from DeepLearning.AI, Stanford Online, and partners.",
            "Curated catalog of mastered competencies and verified competencies.",
          ],
      tags: isArabic
        ? ["DeepLearning.AI", "Stanford Online", "تعلم مستمر"]
        : ["DeepLearning.AI", "Stanford Online", "Continuous Learning"],
      ctaText: isArabic ? "تصفح الشهادات والدورات" : "Browse Verified Certificates",
    },
    {
      id: "step-contact",
      stepNumber: "05",
      destination: isArabic ? "تواصل معي" : "Contact",
      href: `/${locale}/contact`,
      icon: Mail,
      badgeText: isArabic ? "جاهز للتعاون" : "Let's Connect",
      title: isArabic
        ? "بدء التعاون ومناقشة الفرص الوظيفية"
        : "Direct Inquiries, Collaboration & Hiring",
      bullets: isArabic
        ? [
            "متاح للفرص الوظيفية المباشرة ومشاريع الذكاء الاصطناعي عالية التأثير.",
            "جاهز للمقابلات التقنية، النقاشات المعمارية، والاستشارات المتخصصة.",
            "قنوات اتصال سريعة ومباشرة عبر الهاتف، البريد، وحساب لينكد إن.",
          ]
        : [
            "Open to high-impact full-time engineering roles and AI projects.",
            "Available for technical interviews, architectural discussions, and collaboration.",
            "Direct communication channels via phone, email, and verified LinkedIn.",
          ],
      tags: isArabic
        ? ["جاهزية فورية", "تواصل مباشر", "فرص وظيفية"]
        : ["Immediate Availability", "Direct Channels", "Career Inquiries"],
      ctaText: isArabic ? "تواصل معي مباشرة" : "Get in Touch Directly",
    },
  ];

  return (
    <div className="w-full space-y-12">
      {/* 1. Hero & Executive Statement */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-b from-white via-neutral-50/50 to-white p-6 sm:p-10 shadow-xs dark:border-neutral-800/80 dark:from-neutral-900 dark:via-neutral-900/50 dark:to-neutral-900">
        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Status Pill */}
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {isArabic
                  ? "متاح للفرص الوظيفية ومشاريع الـ AI"
                  : "Available for Opportunities & AI Roles"}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>
                {isArabic
                  ? "مهندس ذكاء اصطناعي وبرمجيات"
                  : "AI & Full-Stack Software Engineer"}
              </span>
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-50">
              {isArabic ? "أنس الدحامشة" : "Anas Al Dahamsheh"}
            </h1>
            <p className="text-sm font-medium leading-relaxed text-neutral-600 sm:text-base lg:text-lg dark:text-neutral-300">
              {isArabic
                ? "أبني أنظمة ذكاء اصطناعي إنتاجية، خطوط استرجاع RAG متقدمة، ووكلاء أذكياء مؤتمتين مع تطبيقات ويب فائقة الأداء والموثوقية."
                : "Architecting production-grade AI systems, high-accuracy hybrid RAG pipelines, and resilient web platforms built for scale."}
            </p>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={`/${locale}/cv`}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-900 shadow-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isArabic ? "تحميل السيرة الذاتية (PDF)" : "Download Resume (PDF)"}</span>
            </Link>

            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{isArabic ? "تواصل معي مباشرة" : "Get in Touch"}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-chat"));
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>{isArabic ? "اسأل عن أنس (AI Chat)" : "Ask About Anas"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Recruiter Journey & Index Section Header */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Layers className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-primary">
                {isArabic ? "فهرس الاستكشاف ومسار الريكروتر" : "The Recruiter's Roadmap & Index"}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
              {isArabic
                ? "خريطة الموقع ورؤوس الأقلام المركزة"
                : "Portfolio Landscape at a Glance"}
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {isArabic
              ? "موجز تسويقي لرؤوس الأقلام حسب احتياجك — اختر المحطة المناسبة للانتقال السريع:"
              : "Structured key points mapped to each section — select an area to inspect depth:"}
          </p>
        </div>

        {/* 3. The 5 Pipeline Journey Cards */}
        <div className="grid grid-cols-1 gap-5">
          {journeySteps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
              >
                <div className="space-y-4">
                  {/* Top Bar: Step Number + Destination Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {step.stepNumber}
                      </span>
                      <span className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" />
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <span>{step.destination}</span>
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-neutral-400">
                      {step.badgeText}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-neutral-900 sm:text-lg transition-colors group-hover:text-primary dark:text-neutral-100">
                    {step.title}
                  </h3>

                  {/* Key Highlights (Bullets - رؤوس أقلام) */}
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    {step.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-neutral-200/80 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="mt-5 border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100"
                  >
                    <span>{step.ctaText}</span>
                    <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
