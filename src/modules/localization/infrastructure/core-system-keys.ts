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
    | "admin"
    | "jobfit"
    | "lab"
    | "eval"
    | "content";
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
    key: "nav.experience",
    category: "navigation",
    description: "Navigation link to professional experience",
    translations: {
      ar: "الخبرات",
      en: "Experience",
    },
  },
  {
    key: "nav.about",
    category: "navigation",
    description: "Navigation link to about section",
    translations: {
      ar: "عن أنس",
      en: "About",
    },
  },
  {
    key: "nav.contact",
    category: "navigation",
    description: "Navigation link to contact section",
    translations: {
      ar: "تواصل معي",
      en: "Contact",
    },
  },
  {
    key: "nav.ask_about_anas",
    category: "navigation",
    description: "Navigation link to Ask About Anas AI Assistant",
    translations: {
      ar: "اسأل عن أنس",
      en: "Ask About Anas",
    },
  },
  {
    key: "nav.technical_demos",
    category: "navigation",
    description: "Navigation link to technical demos",
    translations: {
      ar: "تجارب تقنية",
      en: "Technical Demos",
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
      ar: "أنس الدحامشة | مهندس ذكاء اصطناعي وبرمجيات",
      en: "Anas Al Dahamsheh | AI & Software Engineer",
    },
  },
  {
    key: "home.subtitle",
    category: "home",
    description: "Main subtitle of the portfolio platform",
    translations: {
      ar: "أبني أنظمة ذكاء اصطناعي إنتاجية، مسارات تقييم واختبار النماذج، أدوات الأتمتة، وتطبيقات الويب القابلة للتوسع.",
      en: "I build production-grade AI systems, evaluation pipelines, automation tools, and scalable web applications.",
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

  // Portfolio AI Chat (F031) - Recruiter Focus
  {
    key: "chat.trigger.label",
    category: "chat",
    description: "Floating chat trigger button label",
    translations: {
      ar: "اسأل عن أنس",
      en: "Ask About Anas",
    },
  },
  {
    key: "chat.trigger.aria",
    category: "chat",
    description: "Accessible ARIA label for chat trigger",
    translations: {
      ar: "فتح نافذة اسأل عن أنس",
      en: "Open Ask About Anas assistant",
    },
  },
  {
    key: "chat.title",
    category: "chat",
    description: "Main header for the AI chat panel",
    translations: {
      ar: "اسأل عن أنس",
      en: "Ask About Anas",
    },
  },
  {
    key: "chat.subtitle",
    category: "chat",
    description: "Subtitle for the AI chat panel",
    translations: {
      ar: "مساعد تفاعلي موجه لمسؤولي التوظيف والمهندسين لاستكشاف خبرات ومشاريع أنس وملاءمته للأدوار التقنية.",
      en: "Recruiter & engineering assistant to explore Anas's background, production projects, and role suitability.",
    },
  },
  {
    key: "chat.placeholder",
    category: "chat",
    description: "Chat input field placeholder",
    translations: {
      ar: "اسأل عن مهارات أنس، مشاريعه، أو ملاءمته لدور هندسي...",
      en: "Ask about Anas's skills, projects, or role suitability...",
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
      ar: "اسأل عن أنس الدحامشة",
      en: "Ask About Anas Al Dahamsheh",
    },
  },
  {
    key: "chat.empty.subtitle",
    category: "chat",
    description: "Empty chat state subtitle",
    translations: {
      ar: "مساعد توظيف تفاعلي يجيب عن مهارات وخبرات ومشاريع أنس الهندسية استناداً إلى أدلة موثقة.",
      en: "An interactive recruiter assistant providing evidence-grounded answers about Anas's skills, production projects, and engineering experience.",
    },
  },
  {
    key: "chat.suggested.skills",
    category: "chat",
    description: "Suggested prompt chip: Skills",
    translations: {
      ar: "ما هي أقوى مهارات أنس في هندسة الذكاء الاصطناعي؟",
      en: "What are Anas's strongest AI engineering skills?",
    },
  },
  {
    key: "chat.suggested.projects",
    category: "chat",
    description: "Suggested prompt chip: Projects",
    translations: {
      ar: "ما هي المشاريع والأنظمة الإنتاجية التي بناها أنس؟",
      en: "What production AI systems has Anas built?",
    },
  },
  {
    key: "chat.suggested.experience",
    category: "chat",
    description: "Suggested prompt chip: Experience",
    translations: {
      ar: "لخص لي خبرات أنس ومؤهلاته لمسؤولي التوظيف",
      en: "Summarize Anas's qualifications for an AI Engineer role",
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

  // RAG Debug View (F036)
  {
    key: "chat.debug.button",
    category: "chat",
    description: "Affordance button to open RAG telemetry trace on assistant message",
    translations: {
      ar: "تتبع RAG",
      en: "RAG Trace",
    },
  },
  {
    key: "chat.debug.title",
    category: "chat",
    description: "Header title for RAG Debug View modal",
    translations: {
      ar: "بيانات خط معالجة RAG",
      en: "RAG Pipeline Telemetry",
    },
  },
  {
    key: "chat.debug.subtitle",
    category: "chat",
    description: "Header subtitle for RAG Debug View modal",
    translations: {
      ar: "فحص أزمنة المراحل، توجيه القصد، والأدلة الموثقة بشفافية هندسية.",
      en: "Inspect stage latencies, routing intent, and verified evidence.",
    },
  },
  {
    key: "chat.debug.stages",
    category: "chat",
    description: "Section header for pipeline waterfall stages",
    translations: {
      ar: "مراحل المعالجة وزمن الاستجابة",
      en: "Pipeline Stages & Latency",
    },
  },
  {
    key: "chat.debug.routing",
    category: "chat",
    description: "Stage name: Query routing",
    translations: {
      ar: "توجيه القصد",
      en: "Intent & Routing",
    },
  },
  {
    key: "chat.debug.rewrite",
    category: "chat",
    description: "Stage name: Query rewriting",
    translations: {
      ar: "إعادة صياغة الاستعلام",
      en: "Query Rewriting",
    },
  },
  {
    key: "chat.debug.retrieval",
    category: "chat",
    description: "Stage name: Hybrid retrieval",
    translations: {
      ar: "الاسترجاع الهجين",
      en: "Hybrid Retrieval",
    },
  },
  {
    key: "chat.debug.reranking",
    category: "chat",
    description: "Stage name: Cross-encoder rerank",
    translations: {
      ar: "إعادة الترتيب بالمرمز",
      en: "Cross-Encoder Rerank",
    },
  },
  {
    key: "chat.debug.context",
    category: "chat",
    description: "Stage name: Context packing",
    translations: {
      ar: "تجهيز وتنسيق السياق",
      en: "Context Budgeting",
    },
  },
  {
    key: "chat.debug.generation",
    category: "chat",
    description: "Stage name: Grounded generation",
    translations: {
      ar: "التوليد المسند بالأدلة",
      en: "Grounded Generation",
    },
  },
  {
    key: "chat.debug.latency",
    category: "chat",
    description: "Metric label: Total latency",
    translations: {
      ar: "إجمالي زمن الاستجابة",
      en: "Total Latency",
    },
  },
  {
    key: "chat.debug.sources",
    category: "chat",
    description: "Section header for retrieved context sources",
    translations: {
      ar: "المصادر والأدلة المفحوصة",
      en: "Inspected Sources & Evidence",
    },
  },
  {
    key: "chat.debug.tokens",
    category: "chat",
    description: "Metric label: Estimated context tokens",
    translations: {
      ar: "رموز السياق التقديرية",
      en: "Context Tokens",
    },
  },
  {
    key: "chat.debug.valid",
    category: "chat",
    description: "Metric label: Citation validation status",
    translations: {
      ar: "حالة توثيق الاستشهادات",
      en: "Citation Grounding Status",
    },
  },
  {
    key: "chat.debug.valid.grounded",
    category: "chat",
    description: "Grounded status badge: verified",
    translations: {
      ar: "موثق ومسند بالكامل",
      en: "Verified Grounded",
    },
  },
  {
    key: "chat.debug.valid.insufficient",
    category: "chat",
    description: "Grounded status badge: insufficient evidence",
    translations: {
      ar: "أدلة غير كافية",
      en: "Insufficient Evidence",
    },
  },
  {
    key: "chat.debug.model",
    category: "chat",
    description: "Metric label: Model and provider",
    translations: {
      ar: "النموذج ومزود الخدمة",
      en: "Model & Provider",
    },
  },
  {
    key: "chat.debug.route_id",
    category: "chat",
    description: "Metric label: Route identifier",
    translations: {
      ar: "المسار المعتمد",
      en: "Resolved Route",
    },
  },
  {
    key: "chat.debug.safety_notice",
    category: "chat",
    description: "Safety guarantee notice for transparency mode",
    translations: {
      ar: "نمط الشفافية الهندسية. التعليمات التأسيسية، سلاسل التفكير الداخلية، والمفاتيح السرية محمية بالكامل.",
      en: "Engineering transparency mode. System prompts, internal reasoning, and secret credentials are strictly protected.",
    },
  },
  {
    key: "chat.debug.close",
    category: "chat",
    description: "Close button for RAG debug view modal",
    translations: {
      ar: "إغلاق التتبع",
      en: "Close Trace",
    },
  },

  // Job Fit Analyzer (F034)
  {
    key: "jobfit.title",
    category: "jobfit",
    description: "Title of Job Fit Analyzer page",
    translations: {
      ar: "محلل التوافق الوظيفي المدعوم بالأدلة",
      en: "Job Fit Analyzer",
    },
  },
  {
    key: "jobfit.subtitle",
    category: "jobfit",
    description: "Subtitle of Job Fit Analyzer page",
    translations: {
      ar: "مطابقة متطلبات أي دور هندسي مباشرة مع الأدلة الموثقة ومشاريع المحفظة الحقيقية.",
      en: "Map any role requirements directly to verified engineering evidence, projects, and architectural decisions.",
    },
  },
  {
    key: "jobfit.privacy_badge",
    category: "jobfit",
    description: "Privacy reassurance badge",
    translations: {
      ar: "معالجة فورية مشفرة في الذاكرة (بدون حفظ النص)",
      en: "In-Memory Confidential Analysis (Zero persistence)",
    },
  },
  {
    key: "jobfit.input.label",
    category: "jobfit",
    description: "Label for job description textarea",
    translations: {
      ar: "نص الوصف الوظيفي المستهدف",
      en: "Target Job Description (JD)",
    },
  },
  {
    key: "jobfit.input.placeholder",
    category: "jobfit",
    description: "Placeholder for job description textarea",
    translations: {
      ar: "الصق الوصف الوظيفي الكامل، المتطلبات التقنية، أو مواصفات المنصب هنا...",
      en: "Paste complete job description, technical requirements, or role specification...",
    },
  },
  {
    key: "jobfit.input.sample_label",
    category: "jobfit",
    description: "Label for sample JD quick buttons",
    translations: {
      ar: "أمثلة سريعة:",
      en: "Quick sample JDs:",
    },
  },
  {
    key: "jobfit.input.sample_1",
    category: "jobfit",
    description: "Sample JD button 1",
    translations: {
      ar: "مهندس بنية منصات الذكاء الاصطناعي (AI Architect)",
      en: "AI Platform Architect",
    },
  },
  {
    key: "jobfit.input.sample_2",
    category: "jobfit",
    description: "Sample JD button 2",
    translations: {
      ar: "مهندس برمجيات أول شامل (Staff Full-Stack)",
      en: "Staff Full-Stack Engineer",
    },
  },
  {
    key: "jobfit.input.char_count",
    category: "jobfit",
    description: "Character count unit label",
    translations: {
      ar: "حرف",
      en: "chars",
    },
  },
  {
    key: "jobfit.action.analyze",
    category: "jobfit",
    description: "Button to execute job fit analysis",
    translations: {
      ar: "تحليل التوافق الوظيفي",
      en: "Analyze Job Alignment",
    },
  },
  {
    key: "jobfit.action.analyzing",
    category: "jobfit",
    description: "Analyzing state button text",
    translations: {
      ar: "جاري تحليل المتطلبات ومطابقة الأدلة...",
      en: "Analyzing Requirements & Evidence...",
    },
  },
  {
    key: "jobfit.action.clear",
    category: "jobfit",
    description: "Clear button text",
    translations: {
      ar: "إعادة تعيين",
      en: "Clear",
    },
  },
  {
    key: "jobfit.action.copy_report",
    category: "jobfit",
    description: "Button to copy summary report",
    translations: {
      ar: "نسخ تقرير المطابقة",
      en: "Copy Analysis Report",
    },
  },
  {
    key: "jobfit.action.copied",
    category: "jobfit",
    description: "Copied confirmation text",
    translations: {
      ar: "تم نسخ التقرير!",
      en: "Report Copied!",
    },
  },
  {
    key: "jobfit.status.supported",
    category: "jobfit",
    description: "Evidence status: Supported",
    translations: {
      ar: "مدعوم بالأدلة",
      en: "Supported",
    },
  },
  {
    key: "jobfit.status.partially_supported",
    category: "jobfit",
    description: "Evidence status: Partially Supported",
    translations: {
      ar: "مدعوم جزئياً",
      en: "Partially Supported",
    },
  },
  {
    key: "jobfit.status.not_found",
    category: "jobfit",
    description: "Evidence status: Not Found",
    translations: {
      ar: "غير موثق في المحفظة",
      en: "Not Found",
    },
  },
  {
    key: "jobfit.summary.match_score",
    category: "jobfit",
    description: "Match score headline",
    translations: {
      ar: "مؤشر التوافق الإجمالي",
      en: "Overall Alignment",
    },
  },
  {
    key: "jobfit.summary.total",
    category: "jobfit",
    description: "Total requirements evaluated",
    translations: {
      ar: "إجمالي المتطلبات",
      en: "Total Requirements",
    },
  },
  {
    key: "jobfit.summary.strengths",
    category: "jobfit",
    description: "Strengths section header",
    translations: {
      ar: "أبرز نقاط التوافق المعمارية",
      en: "Key Architectural Strengths",
    },
  },
  {
    key: "jobfit.summary.considerations",
    category: "jobfit",
    description: "Considerations section header",
    translations: {
      ar: "الملاحظات ومجالات التدقيق",
      en: "Gaps & Considerations",
    },
  },
  {
    key: "jobfit.filter.all",
    category: "jobfit",
    description: "Filter all requirements",
    translations: {
      ar: "الكل",
      en: "All",
    },
  },
  {
    key: "jobfit.filter.supported",
    category: "jobfit",
    description: "Filter supported requirements",
    translations: {
      ar: "مدعومة",
      en: "Supported",
    },
  },
  {
    key: "jobfit.filter.partially_supported",
    category: "jobfit",
    description: "Filter partially supported requirements",
    translations: {
      ar: "مدعومة جزئياً",
      en: "Partially Supported",
    },
  },
  {
    key: "jobfit.filter.not_found",
    category: "jobfit",
    description: "Filter not found requirements",
    translations: {
      ar: "غير موثقة",
      en: "Not Found",
    },
  },
  {
    key: "jobfit.citation.sources",
    category: "jobfit",
    description: "Verified evidence heading",
    translations: {
      ar: "الأدلة والمصادر الموثقة:",
      en: "Verified Evidence Sources:",
    },
  },
  {
    key: "jobfit.uncertainty.label",
    category: "jobfit",
    description: "Uncertainty note label",
    translations: {
      ar: "ملاحظة دقة:",
      en: "Precision Note:",
    },
  },
  {
    key: "jobfit.empty.title",
    category: "jobfit",
    description: "Empty state title",
    translations: {
      ar: "جاهز للتحليل الفوري",
      en: "Ready for Evidence-Bound Analysis",
    },
  },
  {
    key: "jobfit.empty.desc",
    category: "jobfit",
    description: "Empty state description",
    translations: {
      ar: "الصق وصفاً وظيفياً أو اختر أحد النماذج أعلاه لرؤية مطابقة المتطلبات بنداً ببند مع الأدلة الحقيقية.",
      en: "Paste a job description or choose a sample above to inspect verified evidence matching requirement by requirement.",
    },
  },
  {
    key: "jobfit.disclaimer",
    category: "jobfit",
    description: "Strict evidence disclaimer",
    translations: {
      ar: "تحليل موضوعي مقيد بالأدلة الموثقة فقط. لا يتم افتراض شهادات أو أدوات أو سنوات خبرة غير مسجلة صراحة.",
      en: "Objective analysis strictly bound to verified portfolio evidence. Never fabricates certifications, tools, or undocumented years of experience.",
    },
  },
  // AI Lab
  {
    key: "lab.title",
    category: "lab",
    description: "AI Lab main title",
    translations: {
      ar: "مختبر هندسة الذكاء الاصطناعي",
      en: "AI Engineering Lab",
    },
  },
  {
    key: "lab.subtitle",
    category: "lab",
    description: "AI Lab subtitle",
    translations: {
      ar: "عروض تفاعلية حية لمعمارية استرجاع RAG، والبحث المتجهي، وإعادة الترتيب بالمرمز المتقاطع، والاستخراج المهيكل.",
      en: "Interactive demonstrations of production RAG, vector search, cross-encoder reranking, and deterministic extraction.",
    },
  },
  {
    key: "lab.badge",
    category: "lab",
    description: "AI Lab authenticity badge",
    translations: {
      ar: "تنفيذ حقيقي • بلا بيانات وهمية",
      en: "Real Execution • Zero Mockups",
    },
  },
  {
    key: "lab.params.title",
    category: "lab",
    description: "Parameters section title",
    translations: {
      ar: "إعدادات ومعاملات التجربة",
      en: "Demo Configuration & Parameters",
    },
  },
  {
    key: "lab.params.query",
    category: "lab",
    description: "Evaluation query input label",
    translations: {
      ar: "استعلام الفحص / المدخلات:",
      en: "Evaluation Query / Prompt:",
    },
  },
  {
    key: "lab.params.topK",
    category: "lab",
    description: "Top K results slider label",
    translations: {
      ar: "أعلى النتائج المسترجعة (Top-K):",
      en: "Top Candidates (Top-K):",
    },
  },
  {
    key: "lab.params.denseWeight",
    category: "lab",
    description: "Dense weight slider label",
    translations: {
      ar: "وزن المتجهات الكثيفة (Dense / Vector):",
      en: "Dense Weight (Vector):",
    },
  },
  {
    key: "lab.params.candidateCount",
    category: "lab",
    description: "Candidate count label",
    translations: {
      ar: "حجم مجمع المرشحين:",
      en: "Candidate Pool Size:",
    },
  },
  {
    key: "lab.params.topN",
    category: "lab",
    description: "Top N reranked output label",
    translations: {
      ar: "عدد نتائج إعادة الترتيب (Top-N):",
      en: "Rerank Top-N Output:",
    },
  },
  {
    key: "lab.params.threshold",
    category: "lab",
    description: "Relevance threshold label",
    translations: {
      ar: "حد أدنى لدرجة الصلة:",
      en: "Relevance Threshold:",
    },
  },
  {
    key: "lab.params.schemaType",
    category: "lab",
    description: "Target extraction schema label",
    translations: {
      ar: "مخطط الاستخراج المستهدف:",
      en: "Extraction Target Schema:",
    },
  },
  {
    key: "lab.params.claim",
    category: "lab",
    description: "Factual claim input label",
    translations: {
      ar: "الادعاء المراد فحصه وتوثيقه:",
      en: "Factual Claim to Verify:",
    },
  },
  {
    key: "lab.params.text",
    category: "lab",
    description: "Input context text label",
    translations: {
      ar: "النص المدخل للتحليل:",
      en: "Input Context Text:",
    },
  },
  {
    key: "lab.run.button",
    category: "lab",
    description: "Run demo button text",
    translations: {
      ar: "تشغيل الخوارزمية الحية",
      en: "Execute Real Algorithm",
    },
  },
  {
    key: "lab.run.running",
    category: "lab",
    description: "Run demo running text",
    translations: {
      ar: "جاري التنفيذ الحقيقي...",
      en: "Executing Real Pipeline...",
    },
  },
  {
    key: "lab.telemetry.title",
    category: "lab",
    description: "Telemetry section heading",
    translations: {
      ar: "بيانات القياس الحية (Telemetry)",
      en: "Live Execution Telemetry",
    },
  },
  {
    key: "lab.telemetry.latency",
    category: "lab",
    description: "Latency metric label",
    translations: {
      ar: "زمن الاستجابة:",
      en: "Latency:",
    },
  },
  {
    key: "lab.telemetry.real",
    category: "lab",
    description: "Authentic execution metric label",
    translations: {
      ar: "تنفيذ خوارزمي حقيقي:",
      en: "Authentic Execution:",
    },
  },
  {
    key: "lab.telemetry.tokens",
    category: "lab",
    description: "Tokens used metric label",
    translations: {
      ar: "الرموز المستخدمة:",
      en: "Tokens Used:",
    },
  },
  {
    key: "lab.results.title",
    category: "lab",
    description: "Live results section title",
    translations: {
      ar: "النتائج الحية وتتبع المعالجة",
      en: "Live Output & Pipeline Trace",
    },
  },
  {
    key: "lab.results.raw",
    category: "lab",
    description: "Raw JSON tab label",
    translations: {
      ar: "مخرجات JSON الصافية",
      en: "Raw Output JSON",
    },
  },
  {
    key: "lab.results.visual",
    category: "lab",
    description: "Visual analysis tab label",
    translations: {
      ar: "التحليل البصري التفاعلي",
      en: "Interactive Visual Analysis",
    },
  },
  {
    key: "lab.nav.link",
    category: "lab",
    description: "AI Lab navigation link",
    translations: {
      ar: "مختبر الذكاء",
      en: "AI Lab",
    },
  },
  {
    key: "lab.error.failed",
    category: "lab",
    description: "Execution failed error message",
    translations: {
      ar: "تعذر تنفيذ التجربة. يرجى التحقق من المدخلات.",
      en: "Failed to execute demonstration. Please check your inputs.",
    },
  },
  {
    key: "lab.error.retry",
    category: "lab",
    description: "Retry execution button",
    translations: {
      ar: "إعادة المحاولة",
      en: "Retry Execution",
    },
  },

  // AI Evaluation Dashboard (F037)
  {
    key: "eval.title",
    category: "eval",
    description: "Evaluation dashboard header title",
    translations: {
      ar: "لوحة تقييم الجودة الهندسية",
      en: "AI Quality Evaluation Dashboard",
    },
  },
  {
    key: "eval.subtitle",
    category: "eval",
    description: "Evaluation dashboard header subtitle",
    translations: {
      ar: "مقاييس جودة الاسترجاع والتوليد المقاسة فعلياً مع ضمانات الإسناد وتكافؤ اللغات.",
      en: "Measured retrieval and generation quality benchmarks with strict grounding and bilingual parity guarantees.",
    },
  },
  {
    key: "eval.nav.link",
    category: "eval",
    description: "Evaluation dashboard navigation link",
    translations: {
      ar: "تقييم الجودة",
      en: "Evaluation",
    },
  },
  {
    key: "eval.tab.metrics",
    category: "eval",
    description: "Tab: Aggregate quality metrics",
    translations: {
      ar: "المقاييس الشاملة",
      en: "Aggregate Metrics",
    },
  },
  {
    key: "eval.tab.methodology",
    category: "eval",
    description: "Tab: Methodology and golden datasets",
    translations: {
      ar: "المنهجية ومجموعات الاختبار",
      en: "Methodology & Datasets",
    },
  },
  {
    key: "eval.tab.benchmarks",
    category: "eval",
    description: "Tab: Measured benchmark runs and ablation comparisons",
    translations: {
      ar: "مقارنات النماذج والتجارب",
      en: "Benchmark Runs",
    },
  },
  {
    key: "eval.metric.target",
    category: "eval",
    description: "Target threshold label",
    translations: {
      ar: "الحد الأدنى المطلوب",
      en: "Target Threshold",
    },
  },
  {
    key: "eval.metric.passed",
    category: "eval",
    description: "Status badge: passed",
    translations: {
      ar: "محققة بنجاح",
      en: "Passed",
    },
  },
  {
    key: "eval.metric.warning",
    category: "eval",
    description: "Status badge: warning",
    translations: {
      ar: "قريبة من الحد",
      en: "Warning",
    },
  },
  {
    key: "eval.metric.failed",
    category: "eval",
    description: "Status badge: failed",
    translations: {
      ar: "غير محققة",
      en: "Failed",
    },
  },
  {
    key: "eval.parity.title",
    category: "eval",
    description: "Bilingual parity section title",
    translations: {
      ar: "تكافؤ الجودة بين العربية والإنجليزية",
      en: "Arabic / English Language Parity",
    },
  },
  {
    key: "eval.parity.desc",
    category: "eval",
    description: "Bilingual parity description",
    translations: {
      ar: "يتم تقييم الاستفسارات باللغة العربية بنفس المعايير الصارمة للغة الإنجليزية لضمان عدم وجود تراجع غير معلن.",
      en: "Arabic queries are evaluated with identical rigor to English cases, ensuring zero silent quality degradation.",
    },
  },
  {
    key: "eval.parity.balanced",
    category: "eval",
    description: "Status badge: balanced language parity",
    translations: {
      ar: "تكافؤ متوازن",
      en: "Balanced Parity",
    },
  },
  {
    key: "eval.pledge.title",
    category: "eval",
    description: "Measured values pledge title",
    translations: {
      ar: "تعهد الشفافية والبيانات المقاسة",
      en: "Measured Values Pledge",
    },
  },
  {
    key: "eval.pledge.desc",
    category: "eval",
    description: "Measured values pledge description",
    translations: {
      ar: "جميع النسب المعروضة ناتجة عن تقييم حقيقي على مجموعات اختبار موثقة، ولا يتم استخدام أي أرقام مفبركة.",
      en: "All displayed percentages are derived from ground-truth test runs on verified portfolio datasets. Zero invented metrics.",
    },
  },
  {
    key: "eval.admin.title",
    category: "eval",
    description: "Admin evaluation control center title",
    translations: {
      ar: "مركز إدارة وتقييم جودة النماذج",
      en: "AI Evaluation Control Center",
    },
  },
  {
    key: "eval.admin.compare.title",
    category: "eval",
    description: "Regression comparison section title",
    translations: {
      ar: "فحص انحدار الجودة ومقارنة الجولات",
      en: "Quality Regression Comparison",
    },
  },
  {
    key: "eval.admin.compare.no_regression",
    category: "eval",
    description: "Regression badge: no regression detected",
    translations: {
      ar: "لا يوجد انحدار ملحوظ (جاهز للاعتماد)",
      en: "No Critical Regression Detected",
    },
  },
  {
    key: "eval.admin.compare.has_regression",
    category: "eval",
    description: "Regression badge: regression detected",
    translations: {
      ar: "تم رصد انحدار في بعض المقاييس",
      en: "Regression Detected in Candidate",
    },
  },
  // AI Evaluation Runner (F038)
  {
    key: "eval.runner.title",
    category: "eval",
    description: "Runner card title",
    translations: {
      ar: "تشغيل حزمة تقييم الذكاء الاصطناعي وبوابة الانحدار",
      en: "AI Evaluation Runner & Regression Gate",
    },
  },
  {
    key: "eval.runner.desc",
    category: "eval",
    description: "Runner card description",
    translations: {
      ar: "تنفيذ اختبارات معيارية مؤتمتة تقيس دقة الاسترجاع والتوليد وحاجز الأمان قبل نشر النماذج.",
      en: "Execute automated benchmark test suites evaluating retrieval, generation, and safety gates.",
    },
  },
  {
    key: "eval.runner.trigger",
    category: "eval",
    description: "Trigger evaluation button",
    translations: {
      ar: "بدء فحص الحزمة والمعايير",
      en: "Run Benchmark Suite",
    },
  },
  {
    key: "eval.runner.running",
    category: "eval",
    description: "Running evaluation progress state",
    translations: {
      ar: "جارٍ تشغيل التقييم والفحص...",
      en: "Running Benchmark Suite...",
    },
  },
  {
    key: "eval.runner.mode.label",
    category: "eval",
    description: "Evaluation mode selector label",
    translations: {
      ar: "نطاق التقييم:",
      en: "Evaluation Mode:",
    },
  },
  {
    key: "eval.runner.mode.full",
    category: "eval",
    description: "Full mode option",
    translations: {
      ar: "شامل (استرجاع + توليد + أمان)",
      en: "Full Suite (Retrieval + Generation + Safety)",
    },
  },
  {
    key: "eval.runner.mode.retrieval",
    category: "eval",
    description: "Retrieval only mode option",
    translations: {
      ar: "الاسترجاع فقط (Recall@5, Precision@5, MRR)",
      en: "Retrieval Only (Recall@5, Precision@5, MRR)",
    },
  },
  {
    key: "eval.runner.mode.generation",
    category: "eval",
    description: "Generation only mode option",
    translations: {
      ar: "التوليد والأمان (الأمانة والاستشهادات)",
      en: "Generation & Safety (Faithfulness & Citations)",
    },
  },
  {
    key: "eval.runner.gate.title",
    category: "eval",
    description: "Gate result card title",
    translations: {
      ar: "قرار بوابة الاعتماد (Release Gate Decision)",
      en: "Release Gate Decision",
    },
  },
  {
    key: "eval.runner.gate.passed",
    category: "eval",
    description: "Gate passed status badge",
    translations: {
      ar: "اجتاز بنجاح (جاهز للاعتماد)",
      en: "GATE PASSED (Ready for Production)",
    },
  },
  {
    key: "eval.runner.gate.warning",
    category: "eval",
    description: "Gate warning status badge",
    translations: {
      ar: "تحذير أداء (يتطلب مراجعة)",
      en: "GATE WARNING (Review Regressions)",
    },
  },
  {
    key: "eval.runner.gate.blocked",
    category: "eval",
    description: "Gate blocked status badge",
    translations: {
      ar: "محظور (انحدار في الأمان أو الأمانة)",
      en: "GATE BLOCKED (Grounding / Safety Regressed)",
    },
  },
  {
    key: "eval.runner.recent_results",
    category: "eval",
    description: "Recent case results table heading",
    translations: {
      ar: "نتائج الحالات المفصلة",
      en: "Detailed Case Results",
    },
  },
  // Admin Content Center (F039)
  {
    key: "admin.content.title",
    category: "content",
    description: "Content center page heading",
    translations: {
      ar: "مركز إدارة المحتوى والأقسام",
      en: "Admin Content Center",
    },
  },
  {
    key: "admin.content.desc",
    category: "content",
    description: "Content center description",
    translations: {
      ar: "إدارة الصفحات، بناء الأقسام التركيبية، ومتابعة جودة النشر والتحديثات ثنائية اللغة.",
      en: "Manage portfolio pages, composable sections, and bilingual publishing workflow.",
    },
  },
  {
    key: "admin.content.pages_tab",
    category: "content",
    description: "Pages tab label",
    translations: {
      ar: "إدارة الصفحات",
      en: "Pages Management",
    },
  },
  {
    key: "admin.content.sections_tab",
    category: "content",
    description: "Sections tab label",
    translations: {
      ar: "بناء الأقسام",
      en: "Sections Builder",
    },
  },
  {
    key: "admin.content.publish_tab",
    category: "content",
    description: "Publishing tab label",
    translations: {
      ar: "طابور النشر والمراجعة",
      en: "Publishing Queue",
    },
  },
];
