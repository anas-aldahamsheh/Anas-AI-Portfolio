import type { Metadata } from "next";
import Link from "next/link";
import { User, Download, Mail, Terminal, Cpu, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn delay={0.05}>
        <div className="space-y-3 text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <User className="h-3.5 w-3.5" />
            <span>{isAr ? "نبذة عني" : "About Me"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
            {isAr ? "أنس الدحامشة" : "Anas Al Dahamsheh"}
          </h1>
          <p className="text-base font-semibold text-neutral-700 sm:text-lg dark:text-neutral-300">
            {isAr
              ? "مهندس ذكاء اصطناعي وبرمجيات شغوف بالأنظمة الإنتاجية عالية الاعتمادية"
              : "AI & Software Engineer focused on reliable, production-grade intelligence"}
          </p>
        </div>
      </FadeIn>

      {/* Main Narrative */}
      <FadeIn delay={0.1}>
        <div className="mt-8 space-y-4 text-xs leading-relaxed text-neutral-600 sm:text-sm sm:leading-7 dark:text-neutral-400">
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
      </FadeIn>

      {/* Engineering Pillars */}
      <div className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {isAr ? "النهج والمبادئ الهندسية" : "Core Engineering Principles"}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {pillar.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Box */}
      <FadeIn delay={0.2}>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50 p-6 sm:flex-row dark:border-neutral-800 dark:bg-neutral-900/40">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {isAr ? "مهتم بالتعرف أكثر على أعمالي؟" : "Interested in working together?"}
            </h3>
            <p className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
              {isAr
                ? "استعرض المشاريع أو حمّل السيرة الذاتية أو تواصل معي مباشرة."
                : "Explore case studies, download my resume, or get in touch directly."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${supportedLocale}/cv`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                <span>{isAr ? "السيرة الذاتية" : "Resume"}</span>
              </Button>
            </Link>
            <Link href={`/${supportedLocale}/contact`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{isAr ? "تواصل معي" : "Contact"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
