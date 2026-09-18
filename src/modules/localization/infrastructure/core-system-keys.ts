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
    | "social"
    | "admin";
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

  // Project Deep Dive (F018)
  {
    key: "project.detail.overview",
    category: "projects",
    description: "Overview section header",
    translations: {
      ar: "نظرة عامة",
      en: "Overview",
    },
  },
  {
    key: "project.detail.problem",
    category: "projects",
    description: "Problem statement section header",
    translations: {
      ar: "المشكلة والسياق العام",
      en: "Problem & Context",
    },
  },
  {
    key: "project.detail.constraints",
    category: "projects",
    description: "Engineering constraints section header",
    translations: {
      ar: "القيود والمتطلبات الهندسية",
      en: "Engineering Constraints",
    },
  },
  {
    key: "project.detail.solution",
    category: "projects",
    description: "Solution architecture section header",
    translations: {
      ar: "الحل والمعالجة",
      en: "Solution & Strategy",
    },
  },
  {
    key: "project.detail.architecture",
    category: "projects",
    description: "System architecture section header",
    translations: {
      ar: "البنية المعمارية والأنماط",
      en: "System Architecture & Patterns",
    },
  },
  {
    key: "project.detail.implementation",
    category: "projects",
    description: "Implementation details section header",
    translations: {
      ar: "تفاصيل التنفيذ والتقنيات",
      en: "Implementation Details",
    },
  },
  {
    key: "project.detail.tech_stack",
    category: "projects",
    description: "Tech stack section title",
    translations: {
      ar: "التقنيات والأدوات المستخدمة",
      en: "Technologies & Tech Stack",
    },
  },
  {
    key: "project.detail.scope_badge",
    category: "projects",
    description: "AI scoped retrieval badge text",
    translations: {
      ar: "نطاق استرجاع مخصص: براهين المشروع فقط",
      en: "Scoped Retrieval: Project Evidence Only",
    },
  },
  {
    key: "project.detail.challenges",
    category: "projects",
    description: "Challenges and mitigations section header",
    translations: {
      ar: "أبرز التحديات والمعالجات",
      en: "Key Challenges & Mitigations",
    },
  },
  {
    key: "project.detail.tradeoffs",
    category: "projects",
    description: "Decisions and tradeoffs section header",
    translations: {
      ar: "القرارات المعمارية والمفاضلات",
      en: "Decisions & Trade-offs",
    },
  },
  {
    key: "project.detail.results",
    category: "projects",
    description: "Impact and results section header",
    translations: {
      ar: "الأثر والنتائج القابلة للقياس",
      en: "Impact & Measurable Results",
    },
  },
  {
    key: "project.detail.ask_ai",
    category: "projects",
    description: "Ask AI about this project card title",
    translations: {
      ar: "اسأل الذكاء الاصطناعي عن هذا المشروع",
      en: "Ask AI About This Project",
    },
  },
  {
    key: "project.detail.ask_ai_desc",
    category: "projects",
    description: "Ask AI about this project explanation",
    translations: {
      ar: "اطرح أسئلة برمجية ومعمارية موثقة ومستندة حصريًا إلى براهين هذا المشروع.",
      en: "Ask verified architectural, code, or design questions grounded specifically in this project's evidence.",
    },
  },
  {
    key: "project.detail.ask_ai_cta",
    category: "projects",
    description: "Launch AI conversation button label",
    translations: {
      ar: "بدء محادثة ذكية عن المشروع",
      en: "Launch AI Project Query",
    },
  },
  {
    key: "project.detail.back_to_projects",
    category: "projects",
    description: "Back to projects catalog link",
    translations: {
      ar: "العودة إلى المشاريع",
      en: "Back to Projects",
    },
  },
  {
    key: "project.detail.related_projects",
    category: "projects",
    description: "Related projects section title",
    translations: {
      ar: "مشاريع ذات صلة",
      en: "Related Projects",
    },
  },
  {
    key: "project.detail.not_found_title",
    category: "projects",
    description: "Project not found heading",
    translations: {
      ar: "المشروع غير موجود",
      en: "Project Not Found",
    },
  },
  {
    key: "project.detail.not_found_desc",
    category: "projects",
    description: "Project not found description",
    translations: {
      ar: "المشروع المطلوب غير موجود أو تمت أرشفته.",
      en: "The requested project could not be found or has been archived.",
    },
  },

  // AI Provider & Model Registry (F019)
  {
    key: "admin.ai.registry.title",
    category: "admin",
    description: "AI Provider & Model Registry title",
    translations: {
      ar: "سجل مزودي ونماذج الذكاء الاصطناعي",
      en: "AI Provider & Model Registry",
    },
  },
  {
    key: "admin.ai.registry.subtitle",
    category: "admin",
    description: "AI Provider & Model Registry description",
    translations: {
      ar: "إدارة مزودي ونماذج الذكاء الاصطناعي وتعيين الأدوار والسياسات التشغيلية بشكل ديناميكي دون الحاجة لإعادة النشر.",
      en: "Configure and manage AI providers, models, active capability assignments, and runtime policies without requiring redeployment.",
    },
  },
  {
    key: "admin.ai.tabs.assignments",
    category: "admin",
    description: "Capability assignments tab label",
    translations: {
      ar: "تعيينات القدرات النشطة",
      en: "Capability Assignments",
    },
  },
  {
    key: "admin.ai.tabs.providers",
    category: "admin",
    description: "Providers tab label",
    translations: {
      ar: "المزودون السحابيون والداخليون",
      en: "AI Providers",
    },
  },
  {
    key: "admin.ai.tabs.models",
    category: "admin",
    description: "Models tab label",
    translations: {
      ar: "النماذج المسجلة والفحص",
      en: "Models & Verification",
    },
  },
  {
    key: "admin.ai.tabs.policy",
    category: "admin",
    description: "Runtime policy tab label",
    translations: {
      ar: "السياسة التشغيلية والمهل",
      en: "Runtime Policy",
    },
  },
  {
    key: "admin.ai.capabilities.generation",
    category: "admin",
    description: "Generation capability label",
    translations: {
      ar: "توليد المحادثة والإجابات",
      en: "Conversational Generation",
    },
  },
  {
    key: "admin.ai.capabilities.embedding",
    category: "admin",
    description: "Embedding capability label",
    translations: {
      ar: "التضمين الشعاعي (Dense Vector)",
      en: "Multilingual Embedding",
    },
  },
  {
    key: "admin.ai.capabilities.reranking",
    category: "admin",
    description: "Reranking capability label",
    translations: {
      ar: "إعادة الترتيب العصبي (Cross-Encoder)",
      en: "Neural Reranking",
    },
  },
  {
    key: "admin.ai.capabilities.router",
    category: "admin",
    description: "Router capability label",
    translations: {
      ar: "توجيه النوايا والاستعلامات",
      en: "Query Intent Router",
    },
  },
  {
    key: "admin.ai.capabilities.rewrite",
    category: "admin",
    description: "Rewrite capability label",
    translations: {
      ar: "إعادة صياغة وتوسيع الاستعلام",
      en: "Query Rewriter",
    },
  },
  {
    key: "admin.ai.capabilities.evaluator",
    category: "admin",
    description: "Evaluator capability label",
    translations: {
      ar: "التقييم وضمان السلامة",
      en: "Evaluation & Safety Guard",
    },
  },
  {
    key: "admin.ai.test.button",
    category: "admin",
    description: "Test capability button text",
    translations: {
      ar: "فحص القدرة",
      en: "Test Capability",
    },
  },
  {
    key: "admin.ai.test.running",
    category: "admin",
    description: "Test running state text",
    translations: {
      ar: "جارٍ الفحص...",
      en: "Testing...",
    },
  },
  {
    key: "admin.ai.test.success",
    category: "admin",
    description: "Test success state text",
    translations: {
      ar: "سليم ومطابق",
      en: "Healthy",
    },
  },
  {
    key: "admin.ai.test.failed",
    category: "admin",
    description: "Test failed state text",
    translations: {
      ar: "فشل التحقق",
      en: "Check Failed",
    },
  },
  {
    key: "admin.prompts.title",
    category: "admin",
    description: "Prompt registry page title",
    translations: {
      ar: "سجل التوجيهات الذكية (Prompts)",
      en: "AI Prompt Registry",
    },
  },
  {
    key: "admin.prompts.subtitle",
    category: "admin",
    description: "Prompt registry page subtitle",
    translations: {
      ar: "إدارة قوالب وتوجيهات الذكاء الاصطناعي مع دعم الإصدارات والاسترجاع الآمن.",
      en: "Manage, version, test, and rollback production AI prompts safely.",
    },
  },
  {
    key: "admin.prompts.current_version",
    category: "admin",
    description: "Active version badge",
    translations: {
      ar: "الإصدار النشط: v{version}",
      en: "Active: v{version}",
    },
  },
  {
    key: "admin.prompts.total_versions",
    category: "admin",
    description: "Total versions count",
    translations: {
      ar: "{count} إصدارات",
      en: "{count} versions",
    },
  },
  {
    key: "admin.prompts.tab.current",
    category: "admin",
    description: "Tab for viewing current version",
    translations: {
      ar: "الإصدار الحالي",
      en: "Current Version",
    },
  },
  {
    key: "admin.prompts.tab.history",
    category: "admin",
    description: "Tab for version history",
    translations: {
      ar: "سجل الإصدارات",
      en: "Version History",
    },
  },
  {
    key: "admin.prompts.tab.new_version",
    category: "admin",
    description: "Tab for drafting new version",
    translations: {
      ar: "إصدار جديد",
      en: "New Version",
    },
  },
  {
    key: "admin.prompts.tab.compare",
    category: "admin",
    description: "Tab for comparing versions",
    translations: {
      ar: "مقارنة الإصدارات",
      en: "Compare",
    },
  },
  {
    key: "admin.prompts.tab.test",
    category: "admin",
    description: "Tab for testing template rendering",
    translations: {
      ar: "اختبار القالب",
      en: "Template Tester",
    },
  },
  {
    key: "admin.prompts.rollback_button",
    category: "admin",
    description: "Rollback button text",
    translations: {
      ar: "استرجاع وتفعيل هذا الإصدار",
      en: "Rollback to this version",
    },
  },
  {
    key: "admin.prompts.publish_immediate",
    category: "admin",
    description: "Checkbox for immediate activation",
    translations: {
      ar: "تفعيل هذا الإصدار فوراً (Make Active)",
      en: "Make active immediately",
    },
  },
  {
    key: "admin.prompts.save_version",
    category: "admin",
    description: "Save version button",
    translations: {
      ar: "حفظ الإصدار",
      en: "Save Version",
    },
  },
  {
    key: "admin.prompts.changelog_label",
    category: "admin",
    description: "Changelog field label",
    translations: {
      ar: "ملخص التعديلات (Changelog)",
      en: "Changelog",
    },
  },
  {
    key: "admin.prompts.system_prompt_label",
    category: "admin",
    description: "System prompt field label",
    translations: {
      ar: "توجيه النظام (System Prompt)",
      en: "System Prompt",
    },
  },
  {
    key: "admin.prompts.user_template_label",
    category: "admin",
    description: "User template field label",
    translations: {
      ar: "قالب المستخدم (User Template)",
      en: "User Template",
    },
  },
  {
    key: "admin.prompts.variables_label",
    category: "admin",
    description: "Variables section label",
    translations: {
      ar: "المتغيرات المطلوبة:",
      en: "Required Variables:",
    },
  },
  {
    key: "admin.prompts.test_run",
    category: "admin",
    description: "Run template test button",
    translations: {
      ar: "معاينة التوليد",
      en: "Preview Render",
    },
  },
  // RAG & Knowledge Pipeline
  {
    key: "admin.rag.title",
    category: "admin",
    description: "RAG Ingestion title",
    translations: {
      ar: "منظومة الاسترجاع المعزز (RAG Pipeline)",
      en: "RAG Knowledge Pipeline",
    },
  },
  {
    key: "admin.rag.description",
    category: "admin",
    description: "RAG Ingestion description",
    translations: {
      ar: "إدارة الفهرسة واستخراج البيانات وتضمين المعارف المتجهية للمحفظة.",
      en: "Manage knowledge extraction, semantic chunking, and vector index synchronization.",
    },
  },
  {
    key: "admin.rag.active_version",
    category: "admin",
    description: "Active index version tag label",
    translations: {
      ar: "إصدار الفهرس النشط",
      en: "Active Index Version",
    },
  },
  {
    key: "admin.rag.embedding_model",
    category: "admin",
    description: "Embedding model label",
    translations: {
      ar: "نموذج التضمين المتجهي",
      en: "Embedding Model",
    },
  },
  {
    key: "admin.rag.total_docs",
    category: "admin",
    description: "Total indexed documents count label",
    translations: {
      ar: "إجمالي الوثائق المفهرسة",
      en: "Indexed Documents",
    },
  },
  {
    key: "admin.rag.total_chunks",
    category: "admin",
    description: "Total indexed chunks count label",
    translations: {
      ar: "إجمالي المقاطع الدلالية (Chunks)",
      en: "Indexed Chunks",
    },
  },
  {
    key: "admin.rag.ingest_button",
    category: "admin",
    description: "Trigger ingestion button",
    translations: {
      ar: "بدء مزامنة الفهرس (Ingest All)",
      en: "Trigger Ingestion Sync",
    },
  },
  {
    key: "admin.rag.force_reindex",
    category: "admin",
    description: "Force reindex checkbox",
    translations: {
      ar: "إعادة بناء كاملة بدون تخطي (Force Reindex)",
      en: "Force full reindex (bypass hash cache)",
    },
  },
  {
    key: "admin.rag.config_chunk_size",
    category: "admin",
    description: "Chunk size config label",
    translations: {
      ar: "حجم المقطع المستهدف (Chunk Size)",
      en: "Target Chunk Size (Tokens)",
    },
  },
  {
    key: "admin.rag.config_chunk_overlap",
    category: "admin",
    description: "Chunk overlap config label",
    translations: {
      ar: "تداخل المقاطع (Chunk Overlap)",
      en: "Chunk Overlap (Tokens)",
    },
  },
  {
    key: "admin.rag.config_top_k",
    category: "admin",
    description: "Retrieval Top K label",
    translations: {
      ar: "عدد النتائج المسترجعة (Top K)",
      en: "Retrieval Candidates (Top K)",
    },
  },
  {
    key: "admin.rag.config_save",
    category: "admin",
    description: "Save RAG config button",
    translations: {
      ar: "حفظ إعدادات RAG",
      en: "Save RAG Configuration",
    },
  },

  // Portfolio AI Chat (F031)
  {
    key: "chat.trigger.label",
    category: "chat",
    description: "Floating chat trigger button label",
    translations: {
      ar: "محادثة المساعد الذكي",
      en: "Chat with Portfolio AI",
    },
  },
  {
    key: "chat.trigger.aria",
    category: "chat",
    description: "Accessible ARIA label for chat trigger",
    translations: {
      ar: "فتح نافذة المحادثة مع الذكاء الاصطناعي",
      en: "Open AI conversation drawer",
    },
  },
  {
    key: "chat.title",
    category: "chat",
    description: "Main header for the AI chat panel",
    translations: {
      ar: "المساعد الذكي لملف الأعمال",
      en: "Portfolio AI Assistant",
    },
  },
  {
    key: "chat.subtitle",
    category: "chat",
    description: "Subtitle for the AI chat panel",
    translations: {
      ar: "إجابات موثقة بالأدلة والاستشهادات عن مشاريع وخبرات أنس",
      en: "Evidence-grounded answers citing Anas's verified projects & skills",
    },
  },
  {
    key: "chat.placeholder",
    category: "chat",
    description: "Chat input field placeholder",
    translations: {
      ar: "اسأل عن المشاريع، المهارات، أو المعمارية...",
      en: "Ask about projects, architecture, or skills...",
    },
  },
  {
    key: "chat.send",
    category: "chat",
    description: "Send button label",
    translations: {
      ar: "إرسال",
      en: "Send",
    },
  },
  {
    key: "chat.close",
    category: "chat",
    description: "Close chat dialog label",
    translations: {
      ar: "إغلاق المحادثة",
      en: "Close chat",
    },
  },
  {
    key: "chat.clear",
    category: "chat",
    description: "Clear chat history label",
    translations: {
      ar: "محادثة جديدة",
      en: "New Chat",
    },
  },
  {
    key: "chat.mode.general",
    category: "chat",
    description: "Conversation Mode: General",
    translations: {
      ar: "عام",
      en: "General",
    },
  },
  {
    key: "chat.mode.recruiter",
    category: "chat",
    description: "Conversation Mode: Recruiter",
    translations: {
      ar: "مسؤولي التوظيف",
      en: "Recruiter",
    },
  },
  {
    key: "chat.mode.technical",
    category: "chat",
    description: "Conversation Mode: Technical",
    translations: {
      ar: "تقني معمق",
      en: "Technical",
    },
  },
  {
    key: "chat.citations.title",
    category: "chat",
    description: "Title for citations popover/card",
    translations: {
      ar: "المصادر والاستشهادات الموثقة",
      en: "Verified Evidence & Citations",
    },
  },
  {
    key: "chat.citations.badge",
    category: "chat",
    description: "Label on citation pill",
    translations: {
      ar: "مصدر",
      en: "Source",
    },
  },
  {
    key: "chat.citations.open",
    category: "chat",
    description: "Link to view verified source",
    translations: {
      ar: "عرض المصدر",
      en: "View Source",
    },
  },
  {
    key: "chat.citations.section",
    category: "chat",
    description: "Section label in citation card",
    translations: {
      ar: "القسم",
      en: "Section",
    },
  },
  {
    key: "chat.error.general",
    category: "chat",
    description: "General chat error state message",
    translations: {
      ar: "حدث خطأ أثناء معالجة استفسارك. يرجى المحاولة مرة أخرى.",
      en: "An error occurred while processing your question. Please try again.",
    },
  },
  {
    key: "chat.retry",
    category: "chat",
    description: "Retry action button",
    translations: {
      ar: "إعادة المحاولة",
      en: "Retry",
    },
  },
  {
    key: "chat.empty.title",
    category: "chat",
    description: "Empty chat state title",
    translations: {
      ar: "كيف يمكنني مساعدتك اليوم؟",
      en: "How can I help you today?",
    },
  },
  {
    key: "chat.empty.subtitle",
    category: "chat",
    description: "Empty chat state subtitle",
    translations: {
      ar: "اختر موضوعاً مقترحاً أو اكتب سؤالك للاطلاع على الأدلة الموثقة في ملف الأعمال.",
      en: "Pick a suggested topic or ask a question to explore verified portfolio evidence.",
    },
  },
  {
    key: "chat.suggested.skills",
    category: "chat",
    description: "Suggested prompt chip: Skills",
    translations: {
      ar: "ما هي أبرز مهارات أنس في الذكاء الاصطناعي؟",
      en: "What are Anas's primary AI & ML engineering skills?",
    },
  },
  {
    key: "chat.suggested.projects",
    category: "chat",
    description: "Suggested prompt chip: Projects",
    translations: {
      ar: "حدثني عن المعمارية التقنية لمشاريع أنس",
      en: "Tell me about the technical architecture of Anas's key projects",
    },
  },
  {
    key: "chat.suggested.experience",
    category: "chat",
    description: "Suggested prompt chip: Experience",
    translations: {
      ar: "ملخص خبرات وإنجازات أنس المهنية",
      en: "Summarize Anas's professional engineering track record",
    },
  },
  {
    key: "chat.insufficientEvidence",
    category: "chat",
    description: "Insufficient evidence notification in chat",
    translations: {
      ar: "لا تحتوي قاعدة معارف ملف الأعمال على معلومات موثقة كافية للإجابة على هذا الاستفسار.",
      en: "The portfolio knowledge base does not contain verified information to answer this inquiry.",
    },
  },
  {
    key: "chat.disclaimer",
    category: "chat",
    description: "Grounding disclaimer below chat input",
    translations: {
      ar: "يجيب المساعد حصرياً استناداً إلى الأدلة الموثقة في ملف أعمال أنس.",
      en: "Answers strictly grounded in Anas's verified portfolio evidence.",
    },
  },
  {
    key: "chat.scope.badge",
    category: "chat",
    description: "Scoped retrieval badge indicator",
    translations: {
      ar: "نطاق محدد: أدلة المشروع فقط",
      en: "Project Evidence Scoped",
    },
  },
  {
    key: "chat.scope.exit",
    category: "chat",
    description: "Button to exit project-scoped retrieval and return to global portfolio",
    translations: {
      ar: "إلغاء الحصر",
      en: "Exit Scope",
    },
  },
  {
    key: "chat.scope.all_portfolio",
    category: "chat",
    description: "Notification indicating search has returned to full portfolio",
    translations: {
      ar: "تمت العودة للبحث في كامل ملف الأعمال",
      en: "Returned to full portfolio search",
    },
  },
  {
    key: "chat.scope.prompt.architecture",
    category: "chat",
    description: "Project scoped suggested prompt: Architecture & trade-offs",
    translations: {
      ar: "ما هي المفاضلات والقرارات المعمارية في هذا المشروع؟",
      en: "What architectural decisions and trade-offs were made?",
    },
  },
  {
    key: "chat.scope.prompt.performance",
    category: "chat",
    description: "Project scoped suggested prompt: Performance & latency",
    translations: {
      ar: "كيف تم التعامل مع قيود الأداء وزمن الاستجابة؟",
      en: "How were performance and latency constraints addressed?",
    },
  },
  {
    key: "chat.scope.prompt.data_flow",
    category: "chat",
    description: "Project scoped suggested prompt: Data flow & reliability",
    translations: {
      ar: "اشرح بنية تدفق البيانات وآليات الموثوقية.",
      en: "Explain the end-to-end data pipeline and reliability mechanisms.",
    },
  },
];
