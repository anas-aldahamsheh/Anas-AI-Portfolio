"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Mail,
  User,
  FileText,
  Eye,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { FadeIn } from "@/components/motion";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EditableRegion } from "@/modules/admin/presentation";
import {
  formatFileSize,
  type PublishedCv,
  type CvVersion,
  type CvAboutItem,
  DEFAULT_CV_ABOUT,
  type CvBoxItem,
} from "../domain/cv";
import { PageHeroBanner } from "@/components/layout/page-hero-banner";
import { CvAdminControls } from "./cv-admin-controls";
import { CvDocumentViewer } from "./cv-document-viewer";

export interface CvViewerProps {
  cv: PublishedCv;
  versions?: CvVersion[] | undefined;
  locale?: string | undefined;
  about?: CvAboutItem | undefined;
  boxes?: CvBoxItem[] | undefined;
}

export function CvViewer({
  cv,
  versions = [],
  locale,
  about,
}: CvViewerProps) {
  const { t } = useLocalization();
  const isAr = locale === "ar";
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const downloadUrl = "/api/cv/download?download=1";
  const viewUrl = "/api/cv/download";

  const activeAbout: CvAboutItem =
    about || DEFAULT_CV_ABOUT[isAr ? "ar" : "en"] || DEFAULT_CV_ABOUT.en;

  const formattedDate = cv.publishedAt
    ? new Date(cv.publishedAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="w-full">
      {/* Overview-Harmonized Aurora Hero Banner */}
      <EditableRegion
        editableRef={{
          entityType: "page",
          entityId: "cv",
          fieldOrBlockId: "header",
          locale: isAr ? "ar" : "en",
          title: "About & Resume Header",
          initialData: {
            title: t("cv.title") || (isAr ? "نبذة والسيرة الذاتية" : "About & Resume"),
            subtitle:
              t("cv.subtitle") ||
              (isAr
                ? "الخلفية المهنية وفلسفة هندسة البرمجيات والنسخة المعتمدة من السيرة الذاتية."
                : "Executive background, engineering philosophy, and verified resume for AI & Software Engineering."),
          },
        }}
      >
        <PageHeroBanner
          title={t("cv.title") || (isAr ? "نبذة والسيرة الذاتية" : "About & Resume")}
          subtitle={
            t("cv.subtitle") ||
            (isAr
              ? "الخلفية المهنية وفلسفة هندسة البرمجيات والنسخة المعتمدة من السيرة الذاتية."
              : "Executive background, engineering philosophy, and verified resume for AI & Software Engineering.")
          }
          meta={
            <div className="flex items-center gap-3 text-xs font-medium text-[#6C7893] dark:text-[#9AA8C0]">
              <span>{t("cv.version_label", { version: String(cv.versionNumber) }) || `v${cv.versionNumber}`}</span>
              {formattedDate && (
                <>
                  <span>•</span>
                  <span>
                    {t("cv.published_date", { date: formattedDate }) ||
                      (isAr ? `تاريخ النشر: ${formattedDate}` : `Published: ${formattedDate}`)}
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                {t("cv.filesize_label", { size: formatFileSize(cv.fileSize) }) ||
                  (isAr
                    ? `الحجم: ${formatFileSize(cv.fileSize)}`
                    : `Size: ${formatFileSize(cv.fileSize)}`)}
              </span>
            </div>
          }
          actions={
            <>
              <Link
                href={downloadUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#173B6C] text-white hover:bg-[#1E4B8A] shadow-xs hover:shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{t("cv.download") || (isAr ? "تحميل PDF" : "Download PDF")}</span>
              </Link>

              <Link
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#EEF5FF] text-[#2F6FED] border border-[#D0E2FF] hover:bg-[#E0EEFF] shadow-2xs hover:shadow-xs dark:bg-white/[0.04] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.08]"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>
                  {t("cv.open_fullscreen") || (isAr ? "فتح كنافذة مستقلة" : "Open New Tab")}
                </span>
              </Link>
            </>
          }
        />
      </EditableRegion>

      {/* Main Page Body Container */}
      <div className="mx-auto w-full max-w-[1420px] space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <FadeIn delay={0.05}>
          {/* Admin Controls (visible only when admin edit mode is ON) */}
          <CvAdminControls currentCv={cv} versions={versions} />

          {/* About Me Narrative Section (Glassmorphism card matching Overview) */}
          <div className="space-y-4 rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 text-start shadow-xs backdrop-blur-md transition-all hover:border-[#D0E2FF] hover:shadow-md sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-medium text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                <User className="h-3.5 w-3.5" />
                <span>{activeAbout.badge || (isAr ? "نبذة عني" : "About Me")}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#173B6C] sm:text-3xl dark:text-[#F4F7FF]">
                {activeAbout.name}
              </h2>
              <p className="text-sm font-semibold text-[#2F6FED] sm:text-base dark:text-indigo-400">
                {activeAbout.headline}
              </p>
            </div>

            <div className="mt-6 space-y-4 text-xs leading-relaxed text-[#6C7893] sm:text-sm sm:leading-7 dark:text-[#9AA8C0]">
              {activeAbout.paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Verified Document Section — On-demand Interactive Preview with Overview Theme */}
          <div className="mt-10">
            {!isPreviewOpen ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/85 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#D0E2FF] hover:shadow-lg sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]">
                {/* Subtle decorative glow */}
                <div
                  className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-[#BAE6FD]/20 blur-3xl dark:bg-cyan-500/10"
                  aria-hidden="true"
                />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
                          {isAr ? "المستند الرسمي المعتمد (PDF)" : "Official Verified PDF Document"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{isAr ? "نسخة رسمية معتمدة ومحدثة" : "Verified & Grounded Version"}</span>
                          </span>
                          <span className="text-[11px] font-medium text-[#6C7893] dark:text-[#9AA8C0]">
                            • {formatFileSize(cv.fileSize)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-[#6C7893] dark:text-[#9AA8C0]">
                      {isAr
                        ? "استعرض وقارن السيرة الذاتية الرسمية والمؤهلات الأكاديمية والمهنية داخل عارض تفاعلي مباشر بدقة عالية وزوم افتراضي 100%."
                        : "Review and inspect the official curriculum vitae in a high-fidelity interactive canvas viewer at exact 100% default zoom."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#173B6C] px-5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-300 hover:bg-[#1E4B8A] hover:shadow-md cursor-pointer dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>{isAr ? "معاينة واستعراض المستند" : "Preview Document"}</span>
                    </button>

                    <Link
                      href={downloadUrl}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-4 text-xs sm:text-sm font-semibold text-[#2F6FED] shadow-2xs transition-all duration-200 hover:bg-[#E0EEFF] cursor-pointer dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isAr ? "تحميل PDF" : "Download PDF"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
                        {isAr ? "المستند الرسمي المعتمد (PDF)" : "Official Verified PDF Document"}
                      </h2>
                      <p className="text-xs text-[#6C7893] dark:text-[#9AA8C0]">
                        {isAr ? "تكبير افتراضي بنسبة 100% مع تحكم كامل بالصفحات" : "100% natural zoom with full navigation controls"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-4 py-2 text-xs font-semibold text-[#6C7893] shadow-2xs hover:border-[#D0E2FF] hover:bg-[#EEF5FF] hover:text-[#173B6C] transition-all cursor-pointer dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#9AA8C0] dark:hover:text-[#F4F7FF]"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>{isAr ? "إغلاق المعاينة" : "Close Preview"}</span>
                  </button>
                </div>

                {/* Custom PDF Canvas Viewer with entrance animation */}
                <div className="w-full animate-in fade-in slide-in-from-top-4 duration-300">
                  <CvDocumentViewer
                    fileUrl={viewUrl}
                    fileName={cv.fileName}
                    locale={locale}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA Banner matching Overview Destination Card 5 */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#E5EAF2] bg-gradient-to-r from-[#F8FAFF] via-white to-[#F3EEFE]/50 p-6 sm:p-8 shadow-xs backdrop-blur-md transition-all hover:border-[#D0E2FF] hover:shadow-md sm:flex-row dark:border-white/[0.08] dark:bg-gradient-to-r dark:from-white/[0.03] dark:via-white/[0.01] dark:to-indigo-950/20">
            <div className="text-start space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                {isAr ? "مهتم بالتعرف أكثر على أعمالي أو العمل معاً؟" : "Interested in working together?"}
              </h3>
              <p className="text-xs sm:text-sm text-[#6C7893] dark:text-[#9AA8C0] max-w-xl">
                {isAr
                  ? "استعرض دراسات الحالة، حمّل السيرة الذاتية، أو تواصل معي مباشرة لمناقشة فرص التعاون."
                  : "Explore case studies, download my resume, or get in touch directly to discuss collaborations."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={downloadUrl}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-white text-[#173B6C] border border-[#E5EAF2] hover:bg-neutral-50 shadow-2xs dark:bg-white/[0.06] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.1]"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? "السيرة الذاتية" : "Resume"}</span>
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-[#EEF5FF] text-[#2F6FED] border border-[#D0E2FF] hover:bg-[#E0EEFF] shadow-2xs hover:shadow-xs dark:bg-white/[0.04] dark:text-neutral-200 dark:border-white/[0.1] dark:hover:bg-white/[0.08]"
              >
                <Mail className="h-4 w-4" />
                <span>{isAr ? "تواصل معي" : "Contact"}</span>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
