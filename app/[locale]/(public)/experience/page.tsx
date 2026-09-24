import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, Mail } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
import { EditableText } from "@/modules/admin/presentation";
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
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <PageHeroBanner
        title={isAr ? "الخبرة والإنجازات الهندسية" : "Engineering Experience"}
        titleKey="experience.hero.title"
        subtitle={
          isAr
            ? "سجل موثق من الإنجاز العملي في هندسة أنظمة الذكاء الاصطناعي، خطوط أنابيب RAG، والبرمجيات عالية الأداء والاعتمادية."
            : "A focused track record of building production AI systems, evaluation pipelines, and high-performance, resilient software."
        }
        subtitleKey="experience.hero.subtitle"
        actions={
          <>
            <Link
              href={`/${supportedLocale}/cv`}
              className="btn-action-primary"
            >
              <Download className="h-4 w-4" />
              <EditableText
                textKey="experience.actions.cv"
                fallback={isAr ? "تحميل السيرة الذاتية (PDF)" : "Download Resume (PDF)"}
              />
            </Link>
            <Link
              href={`/${supportedLocale}/contact`}
              className="btn-action-secondary"
            >
              <Mail className="h-4 w-4" />
              <EditableText
                textKey="experience.actions.contact"
                fallback={isAr ? "تواصل معي" : "Get in Touch"}
              />
            </Link>
          </>
        }
      />

      {/* Main Experience Timeline Container */}
      <div className="mx-auto w-full max-w-[1420px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <div className="space-y-10">
          <StaggerContainer className="space-y-8">
            {EXPERIENCES.map((exp) => (
              <StaggerItem key={exp.id}>
                <div className="relative rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-xs backdrop-blur-md transition-all hover:border-[#D0E2FF] hover:shadow-md sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]">
                  {/* Header row */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
                        <EditableText
                          textKey={`experience.${exp.id}.role`}
                          fallback={isAr ? exp.role.ar : exp.role.en}
                        />
                      </h2>
                      <p className="text-xs font-semibold text-[#2F6FED] sm:text-sm dark:text-indigo-400">
                        {isAr ? exp.company.ar : exp.company.en} •{" "}
                        {isAr ? exp.location.ar : exp.location.en}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3.5 py-1 text-xs font-semibold text-[#1E40AF] dark:border-indigo-500/30 dark:bg-indigo-950/70 dark:text-indigo-200">
                      {isAr ? exp.period.ar : exp.period.en}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#6C7893] dark:text-[#9AA8C0]">
                    <EditableText
                      textKey={`experience.${exp.id}.summary`}
                      fallback={isAr ? exp.summary.ar : exp.summary.en}
                      multiline
                    />
                  </p>

                  {/* Measurable Achievements */}
                  <div className="mt-5 space-y-2.5">
                    <h3 className="text-xs font-bold tracking-wider text-[#173B6C]/80 uppercase dark:text-indigo-300/90">
                      <EditableText
                        textKey="experience.outcomes.title"
                        fallback={isAr ? "أبرز الإنجازات والنتائج" : "Key Outcomes & Impact"}
                      />
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm">
                      {(isAr ? exp.achievements.ar : exp.achievements.en).map((achievement, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-[#6C7893] dark:text-[#9AA8C0]"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6FED] dark:text-indigo-400" />
                          <span className="leading-relaxed">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#E5EAF2] pt-4 dark:border-white/[0.08]">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-[#E5EAF2] bg-[#F8FAFF] px-3 py-1 font-mono text-xs font-medium text-[#173B6C] transition-colors hover:border-[#D0E2FF] hover:text-[#2F6FED] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:border-indigo-500/40"
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

        {/* CTA Footer matching Overview Destination Card 5 */}
        <FadeIn delay={0.2}>
          <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#E5EAF2] bg-gradient-to-r from-[#F8FAFF] via-white to-[#F3EEFE]/50 p-6 sm:p-8 shadow-xs backdrop-blur-md transition-all hover:border-[#D0E2FF] hover:shadow-md sm:flex-row dark:border-white/[0.08] dark:bg-gradient-to-r dark:from-white/[0.03] dark:via-white/[0.01] dark:to-indigo-950/20">
            <div className="text-start space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                <EditableText
                  textKey="experience.cta.title"
                  fallback={
                    isAr
                      ? "هل تبحث عن مهندس ذكاء اصطناعي لفريقك؟"
                      : "Looking for an AI Engineer to join your team?"
                  }
                />
              </h3>
              <p className="text-xs sm:text-sm text-[#6C7893] dark:text-[#9AA8C0] max-w-xl">
                <EditableText
                  textKey="experience.cta.desc"
                  multiline
                  fallback={
                    isAr
                      ? "يسعدني مناقشة كيف يمكن لخبراتي في أنظمة RAG، نماذج اللغات الكبيرة، وهندسة البرمجيات أن تضيف قيمة حقيقية لمشاريعكم."
                      : "I'd be glad to discuss how my expertise in RAG architectures, LLM evaluation, and full-stack systems can deliver value to your engineering team."
                  }
                />
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/${supportedLocale}/projects`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-white text-[#173B6C] border border-[#E5EAF2] hover:bg-neutral-50 shadow-2xs dark:bg-white/[0.06] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.1]"
              >
                <EditableText
                  textKey="experience.cta.projects"
                  fallback={isAr ? "استكشف المشاريع" : "View Projects"}
                />
              </Link>
              <Link
                href={`/${supportedLocale}/contact`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#EEF5FF] text-[#2F6FED] border border-[#D0E2FF] hover:bg-[#E0EEFF] shadow-2xs hover:shadow-xs dark:bg-white/[0.04] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.08]"
              >
                <EditableText
                  textKey="experience.cta.contact"
                  fallback={isAr ? "تواصل معي الآن" : "Let's Connect"}
                />
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
