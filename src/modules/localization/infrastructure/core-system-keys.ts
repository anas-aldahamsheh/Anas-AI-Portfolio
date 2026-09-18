import type { SupportedLocale } from "../domain/locales";

export interface CoreSystemKeyDefinition {
  key: string;
  category:
    | "navigation"
    | "guest"
    | "actions"
    | "home"
    | "auth"
    | "common"
    | "chat"
    | "cv"
    | "projects"
    | "social";
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

  // Social Profiles & Popovers
  {
    key: "social.github.title",
    category: "social",
    description: "Title for GitHub popover",
    translations: {
      ar: "حساب GitHub البرمجي",
      en: "GitHub Profile",
    },
  },
  {
    key: "social.github.description",
    category: "social",
    description: "Description for GitHub popover",
    translations: {
      ar: "استكشف المستودعات والمشاريع المفتوحة المصدر والمساهمات البرمجية.",
      en: "Explore open-source repositories, agentic architectures, and code contributions.",
    },
  },
  {
    key: "social.linkedin.title",
    category: "social",
    description: "Title for LinkedIn popover",
    translations: {
      ar: "الملف المهني على LinkedIn",
      en: "LinkedIn Profile",
    },
  },
  {
    key: "social.linkedin.description",
    category: "social",
    description: "Description for LinkedIn popover",
    translations: {
      ar: "تواصل مهنيًا لمناقشة قيادة فرق الذكاء الاصطناعي وهندسة الأنظمة المتقدمة.",
      en: "Connect for professional collaborations, AI leadership, and enterprise engineering.",
    },
  },
  {
    key: "social.copy_url",
    category: "social",
    description: "Copy URL action label",
    translations: {
      ar: "نسخ الرابط",
      en: "Copy URL",
    },
  },
  {
    key: "social.copied",
    category: "social",
    description: "Copied feedback message",
    translations: {
      ar: "تم النسخ بنجاح!",
      en: "Copied to clipboard!",
    },
  },
  {
    key: "social.open_profile",
    category: "social",
    description: "Open profile action label",
    translations: {
      ar: "فتح الملف الشخصي",
      en: "Open Profile",
    },
  },
  {
    key: "social.canonical_url",
    category: "social",
    description: "Label for canonical URL display",
    translations: {
      ar: "الرابط الرسمي:",
      en: "Canonical URL:",
    },
  },

  // Project Catalog & Filtering (F017)
  {
    key: "projects.catalog.title",
    category: "projects",
    description: "Main title for the project catalog page",
    translations: {
      ar: "المشاريع والأنظمة الهندسية",
      en: "Engineering & AI Projects",
    },
  },
  {
    key: "projects.catalog.description",
    category: "projects",
    description: "Subtitle describing project showcase",
    translations: {
      ar: "منظومات إنتاجية، وهياكل وكيلة، ومساهمات مفتوحة المصدر تم بناؤها بمعايير موثوقية عالية.",
      en: "Production systems, agentic architectures, and open-source contributions built with high reliability.",
    },
  },
  {
    key: "projects.search.placeholder",
    category: "projects",
    description: "Search placeholder input for filtering projects",
    translations: {
      ar: "ابحث في المشاريع بالكلمة المفتاحية أو التقنية...",
      en: "Search projects by keyword, tech, or topic...",
    },
  },
  {
    key: "projects.filter.all_categories",
    category: "projects",
    description: "Label for selecting all domains/categories",
    translations: {
      ar: "جميع المجالات",
      en: "All Domains",
    },
  },
  {
    key: "projects.filter.all_tags",
    category: "projects",
    description: "Label for selecting all tech tags",
    translations: {
      ar: "جميع التقنيات",
      en: "All Technologies",
    },
  },
  {
    key: "projects.filter.featured_only",
    category: "projects",
    description: "Checkbox label for filtering featured projects only",
    translations: {
      ar: "المشاريع المميزة فقط",
      en: "Featured Only",
    },
  },
  {
    key: "projects.filter.category_label",
    category: "projects",
    description: "Filter dropdown label for categories",
    translations: {
      ar: "المجال",
      en: "Domain",
    },
  },
  {
    key: "projects.filter.tag_label",
    category: "projects",
    description: "Filter dropdown label for tags",
    translations: {
      ar: "التقنية",
      en: "Technology",
    },
  },
  {
    key: "projects.sort.label",
    category: "projects",
    description: "Sort selector label",
    translations: {
      ar: "الترتيب",
      en: "Sort By",
    },
  },
  {
    key: "projects.sort.order",
    category: "projects",
    description: "Sort option by recommended order",
    translations: {
      ar: "الترتيب الموصى به",
      en: "Recommended Order",
    },
  },
  {
    key: "projects.sort.latest",
    category: "projects",
    description: "Sort option by latest publication date",
    translations: {
      ar: "الأحدث تاريخًا",
      en: "Most Recent",
    },
  },
  {
    key: "projects.sort.title",
    category: "projects",
    description: "Sort option alphabetical by title",
    translations: {
      ar: "أبجديًا",
      en: "Alphabetical",
    },
  },
  {
    key: "projects.card.view_project",
    category: "projects",
    description: "Button label to open project deep dive",
    translations: {
      ar: "استعراض تفاصيل المشروع",
      en: "View Deep Dive",
    },
  },
  {
    key: "projects.card.source_code",
    category: "projects",
    description: "Link label for project repository code",
    translations: {
      ar: "الكود المصدري",
      en: "Source Code",
    },
  },
  {
    key: "projects.card.live_demo",
    category: "projects",
    description: "Link label for live project demo",
    translations: {
      ar: "تجربة حية",
      en: "Live Demo",
    },
  },
  {
    key: "projects.card.featured_badge",
    category: "projects",
    description: "Badge text for featured projects",
    translations: {
      ar: "مميز",
      en: "Featured",
    },
  },
  {
    key: "projects.empty.title",
    category: "projects",
    description: "Title when no projects match search/filters",
    translations: {
      ar: "لا توجد مشاريع تطابق خيارات البحث",
      en: "No projects match your filter criteria",
    },
  },
  {
    key: "projects.empty.description",
    category: "projects",
    description: "Description advising user how to reset project search",
    translations: {
      ar: "جرّب تغيير كلمات البحث أو اختيار مجال أو تقنية مختلفة.",
      en: "Try adjusting your search keywords, domain, or technology tags.",
    },
  },
  {
    key: "projects.empty.reset",
    category: "projects",
    description: "Button label to reset all active filters",
    translations: {
      ar: "إعادة ضبط الفلاتر",
      en: "Reset Filters",
    },
  },
  {
    key: "projects.count",
    category: "projects",
    description: "Results count summary message",
    translations: {
      ar: "تم العثور على {count} مشروع",
      en: "{count} projects found",
    },
  },
];
