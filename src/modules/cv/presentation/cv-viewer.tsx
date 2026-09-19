"use client";

import Link from "next/link";
import {
  Download,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Sparkles,
  Code2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EditableRegion } from "@/modules/admin/presentation";
import { formatFileSize, type PublishedCv, type CvVersion } from "../domain/cv";
import { CvFallbackCard } from "./cv-fallback-card";
import { CvAdminControls } from "./cv-admin-controls";

export interface CvViewerProps {
  cv: PublishedCv;
  versions?: CvVersion[] | undefined;
  locale?: string | undefined;
}

export function CvViewer({ cv, versions = [], locale }: CvViewerProps) {
  const { t } = useLocalization();
  const isAr = locale === "ar";

  const downloadUrl = "/api/cv/download?download=1";
  const viewUrl = "/api/cv/download";

  const formattedDate = cv.publishedAt
    ? new Date(cv.publishedAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn delay={0.05}>
        {/* Header and Actions */}
        <EditableRegion
          editableRef={{
            entityType: "page",
            entityId: "cv",
            fieldOrBlockId: "header",
            locale: isAr ? "ar" : "en",
            title: "CV Page Header",
            initialData: {
              title: t("cv.title") || (isAr ? "السيرة الذاتية المهنية" : "Curriculum Vitae"),
              subtitle:
                t("cv.subtitle") ||
                (isAr
                  ? "ملخص السيرة الذاتية وتحميل أحدث نسخة معتمدة لمهندس الذكاء الاصطناعي والبرمجيات."
                  : "Executive summary and official resume for AI & Software Engineering."),
            },
          }}
        >
          <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end dark:border-neutral-800">
            <div className="space-y-2 text-start">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                  {t("cv.title") || (isAr ? "السيرة الذاتية المهنية" : "Curriculum Vitae")}
                </h1>
                <Badge variant="secondary" size="sm">
                  {t("cv.version_label", { version: String(cv.versionNumber) }) ||
                    `v${cv.versionNumber}`}
                </Badge>
              </div>

              <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
                {t("cv.subtitle") ||
                  (isAr
                    ? "ملخص السيرة الذاتية وتحميل أحدث نسخة معتمدة لمهندس الذكاء الاصطناعي والبرمجيات."
                    : "Executive summary and official resume for AI & Software Engineering.")}
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {formattedDate && (
                  <span>
                    {t("cv.published_date", { date: formattedDate }) ||
                      (isAr ? `تاريخ النشر: ${formattedDate}` : `Published: ${formattedDate}`)}
                  </span>
                )}
                <span>•</span>
                <span>
                  {t("cv.filesize_label", { size: formatFileSize(cv.fileSize) }) ||
                    (isAr
                      ? `الحجم: ${formatFileSize(cv.fileSize)}`
                      : `Size: ${formatFileSize(cv.fileSize)}`)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex shrink-0 items-center gap-2.5">
              <Link href={downloadUrl}>
                <Button variant="primary" size="md" className="gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>{t("cv.download") || (isAr ? "تحميل PDF" : "Download PDF")}</span>
                </Button>
              </Link>

              <Link href={viewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" className="gap-2">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {t("cv.open_fullscreen") || (isAr ? "فتح كنافذة مستقلة" : "Open New Tab")}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </EditableRegion>

        {/* Admin Controls (visible only when admin edit mode is ON) */}
        <CvAdminControls currentCv={cv} versions={versions} />

        {/* Structured Recruiter Executive Summary (Instant scanning without PDF delay) */}
        <div className="mt-8 space-y-6">
          {/* Executive Overview */}
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 p-6 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-900/60">
            <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {isAr ? "الملف التنفيذي | Executive Profile" : "Executive Profile"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {isAr
                ? "مهندس ذكاء اصطناعي وبرمجيات حاصل على درجة البكالوريوس في هندسة الحاسوب. متخصص في بناء أنظمة الاسترجاع المعزز بالتوليد (RAG)، مسارات تقييم النماذج اللغوية (LLM Evaluation)، الوكلاء الأذكياء، وتطبيقات الويب المتكاملة عالية الأداء والموثوقية."
                : "AI & Software Engineer with a B.S. in Computer Engineering. Experienced in architecting production RAG systems, LLM evaluation pipelines, autonomous agent workflows, and scalable full-stack web applications with rigorous benchmarking and sub-second latency."}
            </p>

            {/* Quick Contact Line */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
              <a
                href="mailto:anashusam268@gmail.com"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <Mail className="h-3.5 w-3.5 text-neutral-500" />
                <span>anashusam268@gmail.com</span>
              </a>
              <span className="opacity-30">•</span>
              <a
                href="tel:+962789495167"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <Phone className="h-3.5 w-3.5 text-neutral-500" />
                <span dir="ltr">+962 789 495 167</span>
              </a>
              <span className="opacity-30">•</span>
              <Link
                href={`/${locale}/chat`}
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAr ? "اسأل عن أنس عبر المساعد" : "Ask About Anas via AI"}</span>
              </Link>
            </div>
          </div>

          {/* Key Competency Pillars */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-neutral-200/80 bg-white/50 p-5 dark:border-neutral-800/80 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {isAr ? "الذكاء الاصطناعي و RAG" : "AI & RAG Engineering"}
                </h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Hybrid Search (Dense + BM25)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Qdrant Cloud & pgvector</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Cross-Encoder Reranking & Citations</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white/50 p-5 dark:border-neutral-800/80 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  <Code2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {isAr ? "التقييم والاختبار المعياري" : "LLM Evaluation & Quality"}
                </h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Deterministic Benchmark Suites</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Grounding & Hallucination Defense</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Automated Testing with Vitest</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white/50 p-5 dark:border-neutral-800/80 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {isAr ? "تطبيقات الويب السحابية" : "Full-Stack Architecture"}
                </h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Next.js 15 App Router & React 19</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>TypeScript & Server Actions</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>PostgreSQL (Neon), Better Auth, WCAG 2.2</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Education & Experience Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200/80 bg-white/50 p-5 text-start dark:border-neutral-800/80 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <GraduationCap className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                <h3 className="text-sm font-bold">{isAr ? "التعليم الأكاديمي" : "Education"}</h3>
              </div>
              <div className="mt-2 text-xs">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {isAr ? "بكالوريوس هندسة الحاسوب" : "B.S. in Computer Engineering"}
                </p>
                <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                  {isAr
                    ? "التركيز على النظم المدمجة، الخوارزميات، وهندسة البرمجيات"
                    : "Focused on computer systems, software architecture, and algorithms"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white/50 p-5 text-start dark:border-neutral-800/80 dark:bg-neutral-900/40">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <Briefcase className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                <h3 className="text-sm font-bold">
                  {isAr ? "المسار المهني" : "Experience Timeline"}
                </h3>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {isAr ? "مهندس أنظمة الذكاء الاصطناعي" : "AI & Software Systems Engineer"}
                  </p>
                  <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                    {isAr
                      ? "مشاريع إنتاجية، مسارات RAG، تقييم النماذج"
                      : "Production systems, RAG pipelines, evaluations"}
                  </p>
                </div>
                <Link
                  href={`/${locale}/experience`}
                  className="shrink-0 text-xs font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
                >
                  {isAr ? "التفاصيل كاملة ←" : "Full Timeline →"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Document Section */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 sm:text-base dark:text-neutral-100">
                {isAr ? "المستند الرسمي المعتمد (PDF)" : "Official Verified PDF Document"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href={downloadUrl}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  <span>{isAr ? "تنزيل" : "Download"}</span>
                </Button>
              </Link>
              <Link href={viewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{isAr ? "نافذة جديدة" : "Open"}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Embedded PDF Viewer */}
          <div className="hidden w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-xs md:block dark:border-neutral-800 dark:bg-neutral-900">
            <object
              data={viewUrl}
              type="application/pdf"
              aria-label={t("cv.title") || "Curriculum Vitae PDF"}
              className="h-[750px] w-full"
            >
              {/* Fallback if browser PDF plugin is disabled or unavailable */}
              <div className="p-8">
                <CvFallbackCard cv={cv} />
              </div>
            </object>
          </div>

          {/* Mobile Fallback Card (prevents tiny unusable iframe trapping) */}
          <div className="block md:hidden">
            <CvFallbackCard cv={cv} />
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
