import type { Metadata } from "next";
import Link from "next/link";
import { Download, Mail, Terminal, Cpu, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "عن أنس الدحامشة | مهندس ذكاء اصطناعي" : "About Anas Al Dahamsheh | AI Engineer",
    description: isAr
      ? "تعرف على الخلفية الأكاديمية والمهنية لأنس الدحامشة ونهجه في بناء وتطوير أنظمة الذكاء الاصطناعي الإنتاجية."
      : "Learn about Anas Al Dahamsheh's computer engineering foundation, focus on production AI systems, and engineering philosophy.",
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "ar" ? "ar" : "en") as SupportedLocale;
  const isAr = supportedLocale === "ar";

  const pillars = [
    {
      icon: Cpu,
      title: isAr ? "أساس هندسي متين" : "Computer Engineering Foundation",
      description: isAr
        ? "فهم عميق لبنية المعالجات، إدارة الذاكرة، والتواصل الشبكي منخفض المستوى، مما يمكنني من تصميم حلول ذكاء اصطناعي برمجية سريعة ومنضبطة الموارد."
        : "Rooted in computer architecture, memory management, and network protocols, enabling me to design lean, latency-critical AI services.",
    },
    {
      icon: Sparkles,
      title: isAr ? "التركيز على بيئات الإنتاج" : "Production AI & Grounding",
      description: isAr
        ? "أهتم بتجاوز مرحلة النماذج الأولية إلى أنظمة إنتاجية حقيقية خالية من الهلوسة، تستند إلى براهين واضحة ومسارات استرجاع (RAG) موثقة بدقة."
        : "Moving beyond prototypes to deterministic, production-hardened systems with verifiable citations, hybrid retrieval, and zero hallucination tolerance.",
    },
    {
      icon: Shield,
      title: isAr ? "التقييم المعياري الدقيق" : "Rigorous LLM Evaluation",
      description: isAr
        ? "الذكاء الاصطناعي الجيد هو ما يمكن قياسه بدقة. أبني مسارات تقييم قطعية تضمن اتساق الإجابات وملاءمتها للمهام المحددة تحت كافة السيناريوهات."
        : "Quality is what you can measure. I build deterministic benchmark suites, telemetry probes, and automated rubrics to validate retrieval recall and grounding.",
    },
    {
      icon: Terminal,
      title: isAr ? "تطوير شامل وسريع" : "Full-Stack System Delivery",
      description: isAr
        ? "من خدمات الـ Backend والنماذج اللغوية، وصولاً إلى واجهات الويب الحديثة (Next.js/TypeScript) الملتزمة بأعلى معايير إمكانية الوصول والتوافق ثنائي اللغة."
        : "From high-concurrency async backends and vector indexing to responsive, accessible, bilingual web interfaces built with modern TypeScript and Next.js.",
    },
  ];

  return (
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={isAr ? "أنس الدحامشة" : "Anas Al Dahamsheh"}
        subtitle={
          isAr
            ? "مهندس ذكاء اصطناعي وبرمجيات شغوف بالأنظمة الإنتاجية عالية الاعتمادية"
            : "AI & Software Engineer focused on reliable, production-grade intelligence"
        }
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        {/* Main Narrative Card */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="space-y-4 text-xs leading-relaxed text-[#6C7893] sm:text-sm sm:leading-7 dark:text-[#9AA8C0]">
              <p>
                {isAr
                  ? "أنا مهندس برمجيات وذكاء اصطناعي بخلفية في هندسة الحاسوب. أركز جهودي على الجسر الفاصل بين أحدث أبحاث نماذج الذكاء الاصطناعي وبين تحويلها إلى أنظمة برمجية متكاملة، آمنة، وعالية الأداء تعمل بكفاءة على أرض الواقع."
                  : "I am an AI & Software Engineer with a Computer Engineering foundation. My primary focus is bridging the gap between cutting-edge AI research and building reliable, latency-bounded, and cost-efficient production software."}
              </p>
              <p>
                {isAr
                  ? "خلال عملي على الأنظمة المعتمدة على النماذج اللغوية الكبيرة (LLMs)، لاحظت أن التحدي الحقيقي ليس مجرد استدعاء واجهات الـ API، بل في ضمان ربط الإجابات بالحقائق (Grounding)، منع الهلوسة، تقليص أزمنة الاستجابة، وبناء مسارات تقييم قطعية تضمن الجودة قبل النشر إلى المستخدمين."
                  : "In building LLM applications and agentic workflows, I believe the real engineering challenge is not making API calls — it is ensuring strict evidence grounding, eliminating hallucinations, minimizing retrieval latency, and building reproducible evaluation suites that prove system reliability."}
              </p>
              <p>
                {isAr
                  ? "أؤمن بأن الكود الممتاز هو الكود البسيط، الموثق، والمختبر جيداً. سواء كنت أصمم محرك استرجاع هجين (Hybrid RAG)، أو أبني خادم حافة عالي الأداء بلغة Rust، أو أطور واجهات تفاعلية متجاوبة ثنائية اللغة، فإن هدفي الدائم هو تقديم حلول برمجية مستدامة تضيف قيمة مباشرة للأعمال."
                  : "I value simplicity, clean architecture, and rigorous testing. Whether engineering a hybrid dense/sparse RAG pipeline, writing low-latency edge daemons in Rust, or crafting accessible bilingual interfaces, my goal is to deliver durable engineering solutions that solve concrete business challenges."}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Engineering Pillars */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#173B6C] sm:text-2xl dark:text-[#F4F7FF]">
              {isAr ? "النهج والمبادئ الهندسية" : "Core Engineering Principles"}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D0E2FF] hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="mt-3.5 text-xs leading-relaxed text-[#6C7893] sm:text-sm dark:text-[#9AA8C0]">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Box */}
        <FadeIn delay={0.2}>
          <div className="relative mt-12 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-[#D0E2FF] bg-gradient-to-br from-[#EEF5FF] via-white to-[#F0F5FF] p-6 shadow-sm sm:flex-row sm:p-8 dark:border-white/[0.1] dark:from-white/[0.04] dark:via-white/[0.02] dark:to-white/[0.04]">
            <div>
              <h3 className="text-lg font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                {isAr ? "مهتم بالتعرف أكثر على أعمالي؟" : "Interested in working together?"}
              </h3>
              <p className="mt-1 text-xs text-[#6C7893] sm:text-sm dark:text-[#9AA8C0]">
                {isAr
                  ? "استعرض المشاريع أو حمّل السيرة الذاتية أو تواصل معي مباشرة."
                  : "Explore case studies, download my resume, or get in touch directly."}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link href={`/${supportedLocale}/cv`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border border-[#D0E2FF] bg-white px-4 py-2.5 text-xs font-semibold text-[#2F6FED] shadow-2xs hover:bg-[#EEF5FF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200"
                >
                  <Download className="h-4 w-4" />
                  <span>{isAr ? "السيرة الذاتية" : "Resume"}</span>
                </Button>
              </Link>
              <Link href={`/${supportedLocale}/contact`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-2 rounded-full bg-[#173B6C] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1E4B8A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  <Mail className="h-4 w-4" />
                  <span>{isAr ? "تواصل معي" : "Contact"}</span>
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
