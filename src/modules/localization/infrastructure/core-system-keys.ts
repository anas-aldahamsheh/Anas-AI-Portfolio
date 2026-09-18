import type { SupportedLocale } from "../domain/locales";

export interface CoreSystemKeyDefinition {
  key: string;
  category:
    "navigation" | "guest" | "actions" | "home" | "auth" | "common" | "chat" | "cv" | "projects";
  description: string;
  translations: Record<SupportedLocale, string>;
}

export const CORE_SYSTEM_KEYS: CoreSystemKeyDefinition[] = [
  // Navigation & Actions
  {
    key: "nav.home",
    category: "navigation",
    description: "Main navigation link to home",
    translations: {
      ar: "الرئيسية",
      en: "Home",
    },
  },
  {
    key: "nav.projects",
    category: "navigation",
    description: "Navigation link to projects catalog",
    translations: {
      ar: "المشاريع",
      en: "Projects",
    },
  },
  {
    key: "nav.cv",
    category: "navigation",
    description: "Navigation link to CV viewer",
    translations: {
      ar: "السيرة الذاتية",
      en: "CV & Resume",
    },
  },
  {
    key: "nav.ai_chat",
    category: "navigation",
    description: "Navigation link to AI assistant",
    translations: {
      ar: "المساعد الذكي",
      en: "AI Assistant",
    },
  },
  {
    key: "nav.job_fit",
    category: "navigation",
    description: "Navigation link to Job Fit Analyzer",
    translations: {
      ar: "محلل الوظائف",
      en: "Job Fit Analyzer",
    },
  },
  {
    key: "nav.admin",
    category: "navigation",
    description: "Navigation link to admin panel",
    translations: {
      ar: "لوحة التحكم",
      en: "Admin",
    },
  },
  {
    key: "nav.sign_in",
    category: "navigation",
    description: "Navigation link to sign in",
    translations: {
      ar: "تسجيل الدخول",
      en: "Sign In",
    },
  },
  {
    key: "nav.sign_out",
    category: "navigation",
    description: "Navigation link to sign out",
    translations: {
      ar: "تسجيل الخروج",
      en: "Sign Out",
    },
  },
  {
    key: "nav.github",
    category: "navigation",
    description: "Navigation link to GitHub profile",
    translations: {
      ar: "GitHub",
      en: "GitHub",
    },
  },
  {
    key: "nav.linkedin",
    category: "navigation",
    description: "Navigation link to LinkedIn profile",
    translations: {
      ar: "LinkedIn",
      en: "LinkedIn",
    },
  },
  {
    key: "footer.rights",
    category: "common",
    description: "Footer copyright rights notice",
    translations: {
      ar: "جميع الحقوق محفوظة",
      en: "All rights reserved",
    },
  },
  {
    key: "footer.built_with",
    category: "common",
    description: "Footer engineering tag",
    translations: {
      ar: "منظومة برمجية إنتاجية مبنية بأعلى معايير الجودة والأداء.",
      en: "Engineered with production-grade reliability, performance, and accessibility.",
    },
  },
  {
    key: "footer.navigation",
    category: "navigation",
    description: "Footer section header for navigation",
    translations: {
      ar: "التنقل",
      en: "Navigation",
    },
  },
  {
    key: "footer.capabilities",
    category: "navigation",
    description: "Footer section header for capabilities",
    translations: {
      ar: "القدرات البرمجية",
      en: "Capabilities",
    },
  },
  {
    key: "footer.connect",
    category: "navigation",
    description: "Footer section header for social/connect links",
    translations: {
      ar: "التواصل والملفات",
      en: "Connect",
    },
  },
  {
    key: "actions.explore",
    category: "actions",
    description: "Action button to explore features",
    translations: {
      ar: "استكشف الآن",
      en: "Explore Now",
    },
  },
  {
    key: "actions.download",
    category: "actions",
    description: "Action button to download",
    translations: {
      ar: "تنزيل",
      en: "Download",
    },
  },
  {
    key: "actions.copy",
    category: "actions",
    description: "Action button to copy",
    translations: {
      ar: "نسخ",
      en: "Copy",
    },
  },
  {
    key: "actions.sign_in",
    category: "actions",
    description: "Action button to sign in",
    translations: {
      ar: "تسجيل الدخول",
      en: "Sign In",
    },
  },
  {
    key: "actions.sign_up",
    category: "actions",
    description: "Action button to sign up",
    translations: {
      ar: "إنشاء حساب",
      en: "Create Account",
    },
  },

  // Home Page Headers
  {
    key: "home.title",
    category: "home",
    description: "Main heading of the portfolio platform",
    translations: {
      ar: "منصة المحفظة الهندسية والذكاء الاصطناعي",
      en: "AI Engineering Portfolio Platform",
    },
  },
  {
    key: "home.subtitle",
    category: "home",
    description: "Main subtitle of the portfolio platform",
    translations: {
      ar: "منظومة إنتاجية متكاملة لاستعراض المشاريع البرمجية وحلول الذكاء الاصطناعي المعقدة.",
      en: "A production-ready platform designed for recruiters and engineering leaders with immediate open access.",
    },
  },

  // Guest Reassurance & Capabilities
  {
    key: "guest.reassurance.title",
    category: "guest",
    description: "Headline of the guest reassurance banner",
    translations: {
      ar: "وصول مباشر ومجاني بالكامل",
      en: "Guest-First Access",
    },
  },
  {
    key: "guest.reassurance.description",
    category: "guest",
    description: "Description informing visitors that no sign-up is required",
    translations: {
      ar: "كافة المشاريع، دراسات الحالة، معاينة وتنزيل السيرة الذاتية، والمساعد الذكي متاحة فوراً كزائر بدون أي قيود أو تسجيل دخول.",
      en: "All projects, case studies, CV preview/download, and interactive AI capabilities are immediately available as a guest without signing up.",
    },
  },
  {
    key: "guest.capabilities.title",
    category: "guest",
    description: "Title above the list of guest capabilities",
    translations: {
      ar: "الخدمات المتاحة فوراً كزائر:",
      en: "Instantly Available Guest Features:",
    },
  },
  {
    key: "guest.capabilities.projects.title",
    category: "guest",
    description: "Title for guest project catalog access",
    translations: {
      ar: "المشاريع ودراسات الحالة",
      en: "Projects & Deep Dives",
    },
  },
  {
    key: "guest.capabilities.projects.description",
    category: "guest",
    description: "Description for guest project catalog access",
    translations: {
      ar: "استعراض كامل المشاريع المعمارية والبرمجية مع دراسات تفصيلية موثقة.",
      en: "Explore full software engineering and AI projects with comprehensive case studies.",
    },
  },
  {
    key: "guest.capabilities.cv.title",
    category: "guest",
    description: "Title for guest CV access",
    translations: {
      ar: "السيرة الذاتية الرسمية",
      en: "CV & Professional Resume",
    },
  },
  {
    key: "guest.capabilities.cv.description",
    category: "guest",
    description: "Description for guest CV access",
    translations: {
      ar: "معاينة مباشرة في المتصفح وإمكانية تنزيل نسخة PDF المعتمدة بنقرة واحدة.",
      en: "Live in-browser preview and instant one-click verified PDF download.",
    },
  },
  {
    key: "guest.capabilities.ai.title",
    category: "guest",
    description: "Title for guest AI assistant access",
    translations: {
      ar: "المساعد الذكي المدعوم بالـ RAG",
      en: "Interactive Grounded AI Assistant",
    },
  },
  {
    key: "guest.capabilities.ai.description",
    category: "guest",
    description: "Description for guest AI assistant access",
    translations: {
      ar: "محادثة حية تستند إلى بيانات المحفظة المثبتة للإجابة عن الخبرات والمهارات.",
      en: "Conversational portfolio AI grounded in verified facts, code, and career history.",
    },
  },
  {
    key: "guest.capabilities.job_fit.title",
    category: "guest",
    description: "Title for guest Job Fit Analyzer access",
    translations: {
      ar: "محلل المواءمة الوظيفية (ATS)",
      en: "Job Fit & ATS Match Analyzer",
    },
  },
  {
    key: "guest.capabilities.job_fit.description",
    category: "guest",
    description: "Description for guest Job Fit Analyzer access",
    translations: {
      ar: "تحليل فوري لوصف الوظيفة ومطابقته بدقة مع الخبرات والإنجازات.",
      en: "Instant job description analysis matching roles against skills, projects, and impact.",
    },
  },

  // Common UI states
  {
    key: "common.loading",
    category: "common",
    description: "Generic loading label",
    translations: {
      ar: "جارٍ التحميل...",
      en: "Loading...",
    },
  },
  {
    key: "common.empty",
    category: "common",
    description: "Generic empty state label",
    translations: {
      ar: "لا توجد بيانات متاحة حالياً.",
      en: "No data available at this time.",
    },
  },
  {
    key: "common.error",
    category: "common",
    description: "Generic error label",
    translations: {
      ar: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      en: "An unexpected error occurred. Please try again.",
    },
  },

  // CV System keys
  {
    key: "cv.title",
    category: "cv",
    description: "Title of CV page",
    translations: {
      ar: "السيرة الذاتية المهنية",
      en: "Curriculum Vitae",
    },
  },
  {
    key: "cv.subtitle",
    category: "cv",
    description: "Subtitle of CV page",
    translations: {
      ar: "عرض وتحميل أحدث نسخة معتمدة من السيرة الذاتية لمهندس البرمجيات والذكاء الاصطناعي.",
      en: "View and download the latest verified resume for Software & AI Engineering.",
    },
  },
  {
    key: "cv.download",
    category: "cv",
    description: "Download CV button label",
    translations: {
      ar: "تحميل السيرة الذاتية (PDF)",
      en: "Download Resume (PDF)",
    },
  },
  {
    key: "cv.open_fullscreen",
    category: "cv",
    description: "Open in new window button label",
    translations: {
      ar: "فتح في نافذة مستقلة",
      en: "Open in New Window",
    },
  },
  {
    key: "cv.version_label",
    category: "cv",
    description: "CV version display",
    translations: {
      ar: "الإصدار {version}",
      en: "Version {version}",
    },
  },
  {
    key: "cv.published_date",
    category: "cv",
    description: "CV publication date display",
    translations: {
      ar: "تاريخ النشر: {date}",
      en: "Published: {date}",
    },
  },
  {
    key: "cv.filesize_label",
    category: "cv",
    description: "CV file size display",
    translations: {
      ar: "الحجم: {size}",
      en: "Size: {size}",
    },
  },
  {
    key: "cv.no_published",
    category: "cv",
    description: "Empty state when no CV is published",
    translations: {
      ar: "لا توجد نسخة سيرة ذاتية منشورة حالياً.",
      en: "No published CV is currently available.",
    },
  },
  {
    key: "cv.fallback_notice",
    category: "cv",
    description: "Notice when inline PDF viewer is unavailable",
    translations: {
      ar: "إذا لم يظهر مستند PDF في المتصفح، يمكنك تحميله مباشرة أو فتحه في نافذة جديدة.",
      en: "If the PDF does not display in your browser, you can download it directly or open it in a new window.",
    },
  },
  {
    key: "cv.admin.upload_title",
    category: "cv",
    description: "Admin title for CV upload section",
    translations: {
      ar: "رفع وتحديث السيرة الذاتية",
      en: "Upload & Update CV",
    },
  },
  {
    key: "cv.admin.changelog",
    category: "cv",
    description: "Admin changelog field label",
    translations: {
      ar: "ملاحظات التغيير والإصدار",
      en: "Changelog & Release Notes",
    },
  },
  {
    key: "cv.admin.publish",
    category: "cv",
    description: "Admin publish action",
    translations: {
      ar: "اعتماد ونشر",
      en: "Publish Version",
    },
  },
  {
    key: "cv.admin.rollback",
    category: "cv",
    description: "Admin rollback action",
    translations: {
      ar: "استعادة هذا الإصدار",
      en: "Rollback to Version",
    },
  },
];
