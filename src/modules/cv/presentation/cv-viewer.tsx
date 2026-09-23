"use client";

import Link from "next/link";
import {
  Download,
  ExternalLink,
  Mail,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn delay={0.05}>
        {/* Header and Actions */}
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
          <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end dark:border-neutral-800">
            <div className="space-y-2 text-start">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#173B6C] sm:text-3xl dark:text-neutral-100">
                  {t("cv.title") || (isAr ? "نبذة والسيرة الذاتية" : "About & Resume")}
                </h1>
                <Badge variant="secondary" size="sm">
                  {t("cv.version_label", { version: String(cv.versionNumber) }) ||
                    `v${cv.versionNumber}`}
                </Badge>
              </div>

              <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
                {t("cv.subtitle") ||
                  (isAr
                    ? "الخلفية المهنية وفلسفة هندسة البرمجيات والنسخة المعتمدة من السيرة الذاتية."
                    : "Executive background, engineering philosophy, and verified resume for AI & Software Engineering.")}
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

        {/* About Me Narrative Section (Copy of Image 4, fully editable by admin) */}
        <div className="mt-8 space-y-4 rounded-2xl border border-neutral-200/80 bg-white/70 p-6 text-start shadow-2xs sm:p-8 dark:border-neutral-800/80 dark:bg-neutral-900/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <User className="h-3.5 w-3.5" />
              <span>{activeAbout.badge || (isAr ? "نبذة عني" : "About Me")}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#173B6C] sm:text-3xl dark:text-neutral-100">
              {activeAbout.name}
            </h2>
            <p className="text-sm font-semibold text-neutral-700 sm:text-base dark:text-neutral-300">
              {activeAbout.headline}
            </p>
          </div>

          <div className="mt-6 space-y-4 text-xs leading-relaxed text-neutral-600 sm:text-sm sm:leading-7 dark:text-neutral-400">
            {activeAbout.paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* Verified Document Section with Custom Canvas PDF Viewer */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-bold tracking-tight text-[#173B6C] sm:text-base dark:text-neutral-100">
                {isAr ? "المستند الرسمي المعتمد (PDF)" : "Official Verified PDF Document"}
              </h2>
            </div>
          </div>

          {/* Custom PDF Canvas Viewer: No native browser toolbar, zero wasted margin, multi-page controls */}
          <div className="w-full">
            <CvDocumentViewer
              fileUrl={viewUrl}
              fileName={cv.fileName}
              locale={locale}
            />
          </div>
        </div>

        {/* Bottom CTA Banner (Image 2: Below the CV document viewer) */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white/70 p-6 sm:flex-row dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="text-start">
            <h3 className="text-base font-bold text-[#173B6C] dark:text-neutral-100">
              {isAr ? "مهتم بالتعرف أكثر على أعمالي أو العمل معاً؟" : "Interested in working together?"}
            </h3>
            <p className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
              {isAr
                ? "استعرض دراسات الحالة، حمّل السيرة الذاتية، أو تواصل معي مباشرة."
                : "Explore case studies, download my resume, or get in touch directly."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link href={downloadUrl}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                <span>{isAr ? "السيرة الذاتية" : "Resume"}</span>
              </Button>
            </Link>
            <Link href={`/${locale}/contact`}>
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
