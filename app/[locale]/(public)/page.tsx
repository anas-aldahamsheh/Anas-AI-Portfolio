import { GuestReassuranceBadge } from "@/modules/auth/presentation/guest-reassurance-badge";

interface PublicPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicHomePage({ params }: PublicPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const publicFeatures = [
    {
      id: "projects",
      title: isArabic ? "المشاريع ودراسات الحالة" : "Projects & Deep Dives",
      description: isArabic
        ? "استعراض كامل المشاريع المعمارية والبرمجية مع دراسات تفصيلية موثقة."
        : "Explore full software engineering and AI projects with comprehensive case studies.",
    },
    {
      id: "cv",
      title: isArabic ? "السيرة الذاتية الرسمية" : "CV & Professional Resume",
      description: isArabic
        ? "معاينة مباشرة في المتصفح وإمكانية تنزيل نسخة PDF المعتمدة بنقرة واحدة."
        : "Live in-browser preview and instant one-click verified PDF download.",
    },
    {
      id: "ai-assistant",
      title: isArabic ? "المساعد الذكي المدعوم بالـ RAG" : "Interactive Grounded AI Assistant",
      description: isArabic
        ? "محادثة حية تستند إلى بيانات المحفظة المثبتة للإجابة عن الخبرات والمهارات."
        : "Conversational portfolio AI grounded in verified facts, code, and career history.",
    },
    {
      id: "job-fit",
      title: isArabic ? "محلل المواءمة الوظيفية (ATS)" : "Job Fit & ATS Match Analyzer",
      description: isArabic
        ? "تحليل فوري لوصف الوظيفة ومطابقته بدقة مع الخبرات والإنجازات."
        : "Instant job description analysis matching roles against skills, projects, and impact.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-12 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full max-w-4xl space-y-8">
        <header className="space-y-3 text-center sm:text-start">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-neutral-50">
            {isArabic ? "منصة المحفظة الذكية" : "AI Engineering Portfolio Platform"}
          </h1>
          <p className="text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
            {isArabic
              ? "نظام متكامل ومفتوح للزوار ومسؤولي التوظيف لاستكشاف كافة المهارات والأعمال فوراً."
              : "A production-ready platform designed for recruiters and engineering leaders with immediate open access."}
          </p>
        </header>

        {/* Guest Reassurance Banner */}
        <GuestReassuranceBadge locale={locale} />

        {/* Core Guest Capabilities Grid */}
        <section
          aria-label={isArabic ? "قدرات وصول الزوار" : "Guest Capabilities"}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {isArabic ? "الخدمات المتاحة فوراً كزائر:" : "Instantly Available Guest Features:"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {publicFeatures.map((feature) => (
              <div
                key={feature.id}
                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
              >
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
