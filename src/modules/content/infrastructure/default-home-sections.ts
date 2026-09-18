import type { SectionData } from "../domain/sections";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

export function getDefaultHomeSections(locale: SupportedLocale): SectionData[] {
  const isAr = locale === "ar";

  return [
    {
      id: "sec-hero",
      pageId: "page-home",
      sectionType: "hero",
      orderIndex: 10,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "منصة المحفظة الهندسية والذكاء الاصطناعي" : "AI Engineering Portfolio Platform",
      subtitle: isAr
        ? "منظومة إنتاجية متكاملة لاستعراض المشاريع البرمجية وحلول الذكاء الاصطناعي المعقدة."
        : "A production-ready platform designed for recruiters and engineering leaders with immediate open access.",
      blocks: [
        {
          id: "blk-hero-heading",
          blockType: "heading",
          orderIndex: 10,
          isVisible: true,
          config: { level: "h1", align: "start" },
          content: {
            text: isAr
              ? "منصة المحفظة الهندسية والذكاء الاصطناعي"
              : "AI Engineering Portfolio Platform",
            subtitle: isAr
              ? "منظومة إنتاجية متكاملة لاستعراض المشاريع البرمجية وحلول الذكاء الاصطناعي المعقدة."
              : "A production-ready platform designed for recruiters and engineering leaders with immediate open access.",
          },
        },
        {
          id: "blk-hero-cta",
          blockType: "cta",
          orderIndex: 20,
          isVisible: true,
          config: { variant: "primary", align: "start" },
          content: {
            label: isAr ? "استكشف المشاريع" : "Explore Projects",
            url: "/projects",
            openInNewTab: false,
          },
        },
      ],
    },
    {
      id: "sec-capabilities",
      pageId: "page-home",
      sectionType: "capabilities",
      orderIndex: 20,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "الخدمات والقدرات المتاحة للزوار" : "Instant Guest Capabilities",
      subtitle: isAr
        ? "جميع الميزات متاحة للاستعراض الفوري بدون أي حاجة لإنشاء حساب."
        : "All platform features are immediately available without requiring authentication.",
      blocks: [
        {
          id: "blk-capabilities-cards",
          blockType: "card_collection",
          orderIndex: 10,
          isVisible: true,
          config: { columns: "2" },
          content: {
            columns: "2",
            items: [
              {
                id: "card-projects",
                title: isAr ? "المشاريع ودراسات الحالة" : "Projects & Deep Dives",
                description: isAr
                  ? "استعراض كامل المشاريع المعمارية والبرمجية مع دراسات تفصيلية موثقة."
                  : "Explore full software engineering and AI projects with comprehensive case studies.",
                badge: "Live",
                url: "/projects",
                icon: "folder-git-2",
              },
              {
                id: "card-cv",
                title: isAr ? "السيرة الذاتية الرسمية" : "CV & Professional Resume",
                description: isAr
                  ? "معاينة مباشرة في المتصفح وإمكانية تنزيل نسخة PDF المعتمدة بنقرة واحدة."
                  : "Live in-browser preview and instant one-click verified PDF download.",
                badge: "Verified",
                url: "/cv",
                icon: "file-text",
              },
              {
                id: "card-ai",
                title: isAr
                  ? "المساعد الذكي المدعوم بالـ RAG"
                  : "Interactive Grounded AI Assistant",
                description: isAr
                  ? "محادثة حية تستند إلى بيانات المحفظة المثبتة للإجابة عن الخبرات والمهارات."
                  : "Conversational portfolio AI grounded in verified facts, code, and career history.",
                badge: "AI",
                url: "/chat",
                icon: "sparkles",
              },
              {
                id: "card-job-fit",
                title: isAr ? "محلل المواءمة الوظيفية (ATS)" : "Job Fit & ATS Match Analyzer",
                description: isAr
                  ? "تحليل فوري لوصف الوظيفة ومطابقته بدقة مع الخبرات والإنجازات."
                  : "Instant job description analysis matching roles against skills, projects, and impact.",
                badge: "Tool",
                url: "/job-fit",
                icon: "briefcase",
              },
            ],
          },
        },
      ],
    },
    {
      id: "sec-metrics",
      pageId: "page-home",
      sectionType: "metrics",
      orderIndex: 30,
      isVisible: true,
      status: "PUBLISHED",
      title: isAr ? "معايير الأداء والموثوقية" : "Engineering Quality & Standards",
      blocks: [
        {
          id: "blk-metrics-items",
          blockType: "metrics",
          orderIndex: 10,
          isVisible: true,
          config: {},
          content: {
            items: [
              {
                value: "100%",
                label: isAr ? "ديناميكي بالكامل" : "Fully Dynamic",
                description: isAr ? "صفر نصوص ثابتة في كود الواجهة" : "Zero hardcoded copy in JSX",
              },
              {
                value: "< 100ms",
                label: isAr ? "زمن استجابة فائق" : "Cache Latency",
                description: isAr
                  ? "ذاكرة تخزين واستجابة سريعة"
                  : "In-memory caching and bounded timeouts",
              },
              {
                value: "WCAG 2.2",
                label: isAr ? "إمكانية وصول قياسية" : "Accessibility AA",
                description: isAr
                  ? "دعم كامل لقارئات الشاشة والتنقل بلوحة المفاتيح"
                  : "Full screen-reader and keyboard navigation support",
              },
            ],
          },
        },
      ],
    },
  ];
}
