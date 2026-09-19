import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowRight, CheckCircle2, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface ExperienceItem {
  id: string;
  role: { en: string; ar: string };
  company: { en: string; ar: string };
  period: { en: string; ar: string };
  location: { en: string; ar: string };
  summary: { en: string; ar: string };
  achievements: { en: string[]; ar: string[] };
  technologies: string[];
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "exp-1",
    role: {
      en: "AI Engineer & Technical Systems Architect",
      ar: "مهندس ذكاء اصطناعي ومعماري أنظمة برمجية",
    },
    company: {
      en: "Autonomous Systems & AI Engineering Projects",
      ar: "مشاريع أنظمة الذكاء الاصطناعي وهندسة البرمجيات",
    },
    period: {
      en: "2024 — Present",
      ar: "2024 — حتى الآن",
    },
    location: {
      en: "Amman, Jordan (Remote / Hybrid)",
      ar: "عمان، الأردن (عن بُعد / هجين)",
    },
    summary: {
      en: "Architected and delivered end-to-end production AI platforms, hybrid RAG retrieval pipelines, edge policy consensus systems, and automated evaluation workflows.",
      ar: "هندسة وتطوير منصات ذكاء اصطناعي إنتاجية، مسارات استرجاع هجينة (RAG)، بوابات حافة موزعة، ومسارات تقييم واختبار النماذج اللغوية.",
    },
    achievements: {
      en: [
        "Engineered autonomous multimodal RAG pipeline combining BGE-M3 dense embeddings and BM25 lexical search, achieving 99.4% citation accuracy and 180ms P95 latency.",
        "Constructed embedded Rust edge policy consensus daemon with Ed25519 token verification, maintaining sub-3ms P99 latency under 50,000 requests/second.",
        "Built real-time bidirectional neural speech stream utilizing WebRTC and low-latency chunked audio inference, reducing conversational lag to 125ms.",
        "Implemented deterministic benchmark evaluation suite testing retrieval recall, grounding fidelity, and bilingual consistency across Arabic and English.",
      ],
      ar: [
        "تصميم محرك RAG هجين يدمج التضمين الشعاعي والفهرسة المعجمية محققاً دقة اقتباس 99.4% وزمن استجابة 180ms.",
        "تطوير خادم حافة بلغة Rust للتحقق المشفر من الصلاحيات بزمن استجابة P99 يقل عن 3ms تحت ضغط 50,000 طلب/ثانية.",
        "بناء مسار تدفق صوتي عصبي ثنائي الاتجاه عبر WebRTC، مقلصاً زمن التأخر للمحادثة الحية إلى 125ms.",
        "تنفيذ حزمة تقييم معياري قطعية لقياس دقة الاسترجاع، الربط بالحقائق، والاتساق اللغوي ثنائي الاتجاه.",
      ],
    },
    technologies: [
      "TypeScript",
      "Next.js",
      "Python",
      "Rust",
      "Qdrant",
      "PostgreSQL",
      "FastAPI",
      "WebRTC",
      "Docker",
    ],
  },
  {
    id: "exp-2",
    role: {
      en: "Full-Stack Software Engineer",
      ar: "مهندس برمجيات وتطبيقات سحابية",
    },
    company: {
      en: "Modern Web & Enterprise Applications",
      ar: "تطبيقات الويب السحابية والمشاريع المؤسسية",
    },
    period: {
      en: "2022 — 2024",
      ar: "2022 — 2024",
    },
    location: {
      en: "Amman, Jordan",
      ar: "عمان، الأردن",
    },
    summary: {
      en: "Developed scalable web applications, REST/GraphQL microservices, and fully accessible bilingual enterprise interfaces.",
      ar: "تطوير تطبيقات ويب سحابية عالية القابلية للتوسع، خدمات مصغرة، وواجهات مؤسسية تدعم اللغتين العربية والإنجليزية بمعايير قياسية.",
    },
    achievements: {
      en: [
        "Engineered zero-runtime-overhead bilingual design systems strictly compliant with WCAG 2.2 AA accessibility standards across both light and dark themes.",
        "Optimized database queries and connection pooling in PostgreSQL, cutting median API response latency by 45%.",
        "Automated CI/CD deployment pipelines, automated integration testing with Vitest and Playwright, and secure secret management.",
      ],
      ar: [
        "بناء أنظمة تصميم ثنائية اللغة متوافقة تماماً مع معايير إمكانية الوصول WCAG 2.2 AA في الوضعين الليلي والنهاري.",
        "تحسين استعلامات قواعد البيانات وإدارة الاتصالات في PostgreSQL، مخفضاً متوسط زمن استجابة الـ API بنسبة 45%.",
        "أتمتة مسارات النشر السحابي (CI/CD)، الفحوصات الآلية بـ Vitest و Playwright، وإدارة التشفير للأسرار.",
      ],
    },
    technologies: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "TailwindCSS",
      "Redis",
      "Git",
      "REST APIs",
    ],
  },
];

interface ExperiencePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "الخبرة والمسيرة المهنية | أنس الدحامشة"
      : "Experience & Track Record | Anas Al Dahamsheh",
    description: isAr
      ? "استعرض المسيرة المهنية والإنجازات التقنية لأنس الدحامشة كمهندس ذكاء اصطناعي وبرمجيات."
      : "Explore Anas Al Dahamsheh's engineering track record, responsibilities, technical decisions, and verifiable achievements.",
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "ar" ? "ar" : "en") as SupportedLocale;
  const isAr = supportedLocale === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn delay={0.05}>
        <div className="space-y-3 text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{isAr ? "المسيرة المهنية" : "Career Track Record"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
            {isAr ? "الخبرة والإنجازات الهندسية" : "Engineering Experience"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
            {isAr
              ? "سجل موثق من الإنجاز العملي في هندسة أنظمة الذكاء الاصطناعي، خطوط أنابيب RAG، والبرمجيات عالية الأداء والاعتمادية."
              : "A focused track record of building production AI systems, evaluation pipelines, and high-performance, resilient software."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/${supportedLocale}/cv`}>
              <Button variant="primary" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span>{isAr ? "تحميل السيرة الذاتية (PDF)" : "Download Resume (PDF)"}</span>
              </Button>
            </Link>
            <Link href={`/${supportedLocale}/contact`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                <span>{isAr ? "تواصل معي" : "Get in Touch"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Experience Timeline */}
      <div className="mt-12 space-y-10">
        <StaggerContainer className="space-y-8">
          {EXPERIENCES.map((exp) => (
            <StaggerItem key={exp.id}>
              <div className="relative rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700">
                {/* Header row */}
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {isAr ? exp.role.ar : exp.role.en}
                    </h2>
                    <p className="text-xs font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                      {isAr ? exp.company.ar : exp.company.en} •{" "}
                      {isAr ? exp.location.ar : exp.location.en}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs font-medium">
                    {isAr ? exp.period.ar : exp.period.en}
                  </Badge>
                </div>

                {/* Summary */}
                <p className="mt-3 text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-300">
                  {isAr ? exp.summary.ar : exp.summary.en}
                </p>

                {/* Measurable Achievements */}
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    {isAr ? "أبرز الإنجازات والنتائج" : "Key Outcomes & Impact"}
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {(isAr ? exp.achievements.ar : exp.achievements.en).map((achievement, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-neutral-700 dark:text-neutral-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Pills */}
                <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-neutral-200/80 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* CTA Footer */}
      <FadeIn delay={0.2}>
        <div className="mt-14 rounded-xl border border-neutral-200/80 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {isAr
              ? "هل تبحث عن مهندس ذكاء اصطناعي لفريقك؟"
              : "Looking for an AI Engineer to join your team?"}
          </h3>
          <p className="mt-1 text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
            {isAr
              ? "يسعدني مناقشة كيف يمكن لخبراتي في أنظمة RAG، نماذج اللغات الكبيرة، وهندسة البرمجيات أن تضيف قيمة حقيقية لمشاريعكم."
              : "I'd be glad to discuss how my expertise in RAG architectures, LLM evaluation, and full-stack systems can deliver value to your engineering team."}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href={`/${supportedLocale}/contact`}>
              <Button variant="primary" size="sm" className="gap-2">
                <span>{isAr ? "تواصل معي الآن" : "Let's Connect"}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href={`/${supportedLocale}/projects`}>
              <Button variant="outline" size="sm">
                <span>{isAr ? "استكشف المشاريع" : "View Projects"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
