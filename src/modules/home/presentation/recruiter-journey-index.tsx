"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Briefcase,
  Code2,
  Award,
  Mail,
  ArrowRight,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { useAdminEdit, EditableText } from "@/modules/admin/presentation";
import { useTranslation } from "@/modules/localization/presentation/localization-provider";

export interface RecruiterJourneyIndexProps {
  locale: string;
}

export function RecruiterJourneyIndex({ locale }: RecruiterJourneyIndexProps) {
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const heroRef = useRef<HTMLElement>(null);
  const { isAdmin, isEditMode, openEditor } = useAdminEdit();
  const { dictionary } = useTranslation();

  const fullTitle =
    dictionary["home.hero.title"] ||
    (isArabic ? "أنس الدحامشة" : "Anas Al Dahamsheh");
  const fullSub1 =
    dictionary["home.hero.sub1"] ||
    (isArabic ? "مهندس ذكاء اصطناعي" : "AI Engineer");
  const fullSub2 =
    dictionary["home.hero.sub2"] ||
    (isArabic
      ? "ومطور برمجيات شامل (Full-Stack)"
      : "& Full-Stack Developer");

  const isTestEnv =
    typeof process !== "undefined" && process.env.NODE_ENV === "test";

  const [mounted, setMounted] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [sub1Text, setSub1Text] = useState("");
  const [sub2Text, setSub2Text] = useState("");
  const [cursorPhase, setCursorPhase] = useState<"title" | "sub" | "none">("title");
  const [isTitleDone, setIsTitleDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    setTitleText("");
    setSub1Text("");
    setSub2Text("");
    setIsTitleDone(false);
    setCursorPhase("title");

    const streamTitle = (idx: number) => {
      if (isCancelled) return;
      if (idx <= fullTitle.length) {
        setTitleText(fullTitle.slice(0, idx));
        if (idx < fullTitle.length) {
          const delay = 40 + Math.floor(Math.random() * 16);
          timeoutId = setTimeout(() => streamTitle(idx + 1), delay);
        } else {
          setIsTitleDone(true);
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            setCursorPhase("sub");
            streamSub1(1);
          }, 240);
        }
      }
    };

    const streamSub1 = (idx: number) => {
      if (isCancelled) return;
      if (idx <= fullSub1.length) {
        setSub1Text(fullSub1.slice(0, idx));
        if (idx < fullSub1.length) {
          const delay = 35 + Math.floor(Math.random() * 14);
          timeoutId = setTimeout(() => streamSub1(idx + 1), delay);
        } else {
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            streamSub2(1);
          }, 60);
        }
      }
    };

    const streamSub2 = (idx: number) => {
      if (isCancelled) return;
      if (idx <= fullSub2.length) {
        setSub2Text(fullSub2.slice(0, idx));
        if (idx < fullSub2.length) {
          const delay = 28 + Math.floor(Math.random() * 12);
          timeoutId = setTimeout(() => streamSub2(idx + 1), delay);
        } else {
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            setCursorPhase("none");
          }, 1200);
        }
      }
    };

    timeoutId = setTimeout(() => streamTitle(1), 160);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [fullTitle, fullSub1, fullSub2]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroRef.current.style.setProperty("--mouse-x", `${x}px`);
    heroRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

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
      {/* 
        ==================================================
        FULL-WIDTH HERO SECTION (Matching Reference Image)
        Ethereal cyan aura on the left, clean white in the center,
        and soft lavender/purple aura on the right.
        Dark mode adapts with deep navy and subtle cyan/violet glows.
        Same layout, spacing, and typography rhythm as reference banner.
        ==================================================
      */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="group/hero relative w-full bg-white overflow-hidden transition-colors duration-300 dark:bg-[#07101F]"
        aria-label={isArabic ? "المقدمة" : "Hero"}
        style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
      >
        {/* Interactive Mouse Spotlight Glow - Light Mode */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100 dark:hidden"
          style={{
            background:
              "radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.24), rgba(168, 85, 247, 0.18), transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Interactive Mouse Spotlight Glow - Dark Mode */}
        <div
          className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100 dark:block"
          style={{
            background:
              "radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(14, 165, 233, 0.28), rgba(147, 51, 234, 0.24), transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Living Aurora Glow Aura on Left */}
        <div
          className="hero-aurora-left pointer-events-none absolute -top-24 -start-20 h-[520px] w-[640px] rounded-full bg-gradient-to-br from-[#BAE6FD]/85 via-[#E0F2FE]/70 to-transparent blur-[100px] dark:from-[#0284c7]/30 dark:via-[#0369a1]/18 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Living Aurora Glow Aura on Right */}
        <div
          className="hero-aurora-right pointer-events-none absolute -top-20 -end-20 h-[540px] w-[660px] rounded-full bg-gradient-to-bl from-[#DDD6FE]/90 via-[#EDE9FE]/70 to-transparent blur-[110px] dark:from-[#7c3aed]/30 dark:via-[#6d28d9]/18 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Soft Ambient Floating Center Orb */}
        <div
          className="hero-aurora-center pointer-events-none absolute top-1/4 start-1/2 -translate-x-1/2 h-[350px] w-[500px] rounded-full bg-gradient-to-r from-[#BAE6FD]/40 to-[#DDD6FE]/40 blur-[120px] dark:from-[#0284c7]/15 dark:to-[#7c3aed]/15"
          aria-hidden="true"
        />

        {/* Base horizontal wash from soft cyan to transparent center to soft lavender */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EBF6FE]/80 via-transparent to-[#F3EEFE]/80 dark:from-[#0B1728]/70 dark:via-transparent dark:to-[#150E2A]/70"
          aria-hidden="true"
        />

        {/* Soft bottom fade so hero seamlessly blends into the rest of the page without any sharp cutoff */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-b from-transparent to-white dark:to-[#07101F]"
          aria-hidden="true"
        />

        {/* Content Container matching reference image layout */}
        <div className="relative z-10 mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-14 sm:py-18 lg:py-22 text-start">
          <div className="relative inline-block w-full">
            <h1
              aria-label={fullTitle}
              className="relative font-space-grotesk font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-[1.15] text-[#173B6C] dark:text-[#F4F7FF]"
            >
              {mounted && !isTestEnv ? (
                <span className="relative">
                  <span>{titleText}</span>
                  {cursorPhase === "title" && (
                    <span
                      className="relative inline-block w-0 overflow-visible align-baseline pointer-events-none"
                      aria-hidden="true"
                    >
                      <span
                        className="absolute start-1 bottom-[0.14em] w-[3px] sm:w-[3.5px] rounded-full bg-gradient-to-b from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.7)]"
                        style={{ height: "0.82em" }}
                      />
                    </span>
                  )}
                  <span className="invisible select-none pointer-events-none" aria-hidden="true">
                    {fullTitle.slice(titleText.length)}
                  </span>
                </span>
              ) : (
                <span>{fullTitle}</span>
              )}
            </h1>
            {isTitleDone && (
              <div className="hero-name-shimmer-sweep pointer-events-none" aria-hidden="true" />
            )}
            {isAdmin && isEditMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  openEditor({
                    entityType: "ui_text",
                    entityId: "home.hero.title",
                    fieldOrBlockId: "value",
                    locale: isArabic ? "ar" : "en",
                    title: "Hero Title (home.hero.title)",
                    initialData: fullTitle,
                  });
                }}
                aria-label="Edit Hero Title"
                className="absolute -top-3.5 end-0 z-30 inline-flex items-center gap-1 rounded-md bg-[#4F46E5] px-2 py-0.5 text-xs font-semibold text-white shadow-md hover:bg-[#4338CA] transition-all cursor-pointer opacity-85 hover:opacity-100"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit Title</span>
              </button>
            )}
          </div>

          <div className="relative inline-block w-full max-w-2xl mt-3 sm:mt-4">
            <p
              aria-label={`${fullSub1} ${fullSub2}`}
              className="relative font-manrope font-medium text-base sm:text-lg md:text-xl lg:text-[21px] leading-relaxed text-[#64748B] dark:text-[#A7B3C7]"
            >
              {mounted && !isTestEnv ? (
                <span className="relative">
                  {sub1Text && (
                    <span className="bg-gradient-to-r from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] bg-clip-text text-transparent font-semibold">
                      {sub1Text}
                    </span>
                  )}
                  {sub2Text && <span className="inline-block" aria-hidden="true">&nbsp;</span>}
                  {sub2Text && (
                    <span className="text-[#64748B] dark:text-[#A7B3C7]">
                      {sub2Text}
                    </span>
                  )}
                  {cursorPhase === "sub" && (
                    <span
                      className="relative inline-block w-0 overflow-visible align-baseline pointer-events-none"
                      aria-hidden="true"
                    >
                      <span
                        className="absolute start-1 bottom-[0.14em] w-[2.5px] rounded-full bg-gradient-to-b from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] animate-pulse shadow-[0_0_8px_rgba(8,145,178,0.7)]"
                        style={{ height: "0.8em" }}
                      />
                    </span>
                  )}
                  {/* Invisible remaining characters ensure line count and line wrapping remain 100% constant */}
                  <span className="invisible select-none pointer-events-none" aria-hidden="true">
                    {cursorPhase === "title"
                      ? `${fullSub1} ${fullSub2}`
                      : cursorPhase === "sub"
                      ? sub2Text
                        ? fullSub2.slice(sub2Text.length)
                        : ` ${fullSub1.slice(sub1Text.length)} ${fullSub2}`
                      : ""}
                  </span>
                </span>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] bg-clip-text text-transparent font-semibold">
                    {fullSub1}
                  </span>
                  <span className="inline-block" aria-hidden="true">&nbsp;</span>
                  <span className="text-[#64748B] dark:text-[#A7B3C7]">
                    {fullSub2}
                  </span>
                </>
              )}
            </p>
            {isAdmin && isEditMode && (
              <div className="absolute -top-3.5 end-0 z-30 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openEditor({
                      entityType: "ui_text",
                      entityId: "home.hero.sub1",
                      fieldOrBlockId: "value",
                      locale: isArabic ? "ar" : "en",
                      title: "Hero Subtitle 1 (home.hero.sub1)",
                      initialData: fullSub1,
                    });
                  }}
                  aria-label="Edit Subtitle 1"
                  className="inline-flex items-center gap-1 rounded-md bg-[#4F46E5] px-2 py-0.5 text-xs font-semibold text-white shadow-md hover:bg-[#4338CA] transition-all cursor-pointer opacity-85 hover:opacity-100"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit Subtitle 1</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openEditor({
                      entityType: "ui_text",
                      entityId: "home.hero.sub2",
                      fieldOrBlockId: "value",
                      locale: isArabic ? "ar" : "en",
                      title: "Hero Subtitle 2 (home.hero.sub2)",
                      initialData: fullSub2,
                    });
                  }}
                  aria-label="Edit Subtitle 2"
                  className="inline-flex items-center gap-1 rounded-md bg-[#0891B2] px-2 py-0.5 text-xs font-semibold text-white shadow-md hover:bg-[#0e7490] transition-all cursor-pointer opacity-85 hover:opacity-100"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit Subtitle 2</span>
                </button>
              </div>
            )}
          </div>
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
          className="w-full divide-y divide-[#E5EAF2] border-b border-[#E5EAF2] dark:divide-white/[0.08] dark:border-white/[0.08]"
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
                    <div className="text-xs font-medium uppercase tracking-wider text-[#6C7893] dark:text-[#9AA8C0]">
                      <EditableText
                        textKey={`home.section.${item.id}.category`}
                        fallback={item.category}
                      />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#173B6C] dark:text-[#F6F8FC]">
                      <EditableText
                        textKey={`home.section.${item.id}.title`}
                        fallback={item.title}
                      />
                    </h2>

                    <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-[#6C7893] dark:text-[#9AA8C0] max-w-2xl lg:max-w-3xl">
                      <EditableText
                        textKey={`home.section.${item.id}.description`}
                        fallback={item.description}
                        multiline
                      />
                    </p>
                  </div>
                </div>

                {/* ZONE 3: CTA BUTTON (Fixed equal size matching user requirement) */}
                <div className="shrink-0 pt-2 md:pt-0">
                  <Link
                    href={item.href}
                    className="inline-flex h-11 sm:h-12 w-[220px] sm:w-[235px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#EEF5FF] text-[#2F6FED] border border-[#D0E2FF] hover:bg-[#E0EEFF] shadow-2xs hover:shadow-xs dark:bg-white/[0.04] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.08] dark:hover:border-indigo-500/40 dark:hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED]"
                  >
                    <EditableText
                      textKey={`home.section.${item.id}.cta`}
                      fallback={item.cta}
                    />
                    <ArrowIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
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
