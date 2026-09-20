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
  Cpu,
  ShieldCheck,
  Layers,
  Globe,
  Terminal,
  Database,
  Rocket,
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
  type CvBoxItem,
  DEFAULT_CV_BOXES,
} from "../domain/cv";
import { CvAdminControls } from "./cv-admin-controls";
import { CvDocumentViewer } from "./cv-document-viewer";

export interface CvViewerProps {
  cv: PublishedCv;
  versions?: CvVersion[] | undefined;
  locale?: string | undefined;
  boxes?: CvBoxItem[] | undefined;
}

function getBoxIcon(name?: string) {
  switch (name) {
    case "sparkles":
      return Sparkles;
    case "code":
      return Code2;
    case "briefcase":
      return Briefcase;
    case "graduation":
      return GraduationCap;
    case "cpu":
      return Cpu;
    case "shield":
      return ShieldCheck;
    case "layers":
      return Layers;
    case "globe":
      return Globe;
    case "terminal":
      return Terminal;
    case "database":
      return Database;
    case "rocket":
      return Rocket;
    default:
      return Sparkles;
  }
}

export function CvViewer({ cv, versions = [], locale, boxes }: CvViewerProps) {
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

        {/* Dynamic CV Profile & Competency Boxes (Full Admin Control) */}
        {(() => {
          const activeBoxes = (boxes && boxes.length > 0 ? boxes : DEFAULT_CV_BOXES)
            .slice()
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

          if (activeBoxes.length === 0) return null;

          // Split profile boxes (full top width) vs other boxes (grid)
          const profileBoxes = activeBoxes.filter((b) => b.type === "profile");
          const otherBoxes = activeBoxes.filter((b) => b.type !== "profile");

          return (
            <div className="mt-8 space-y-6">
              {/* Profile / Executive Boxes */}
              {profileBoxes.map((box) => (
                <div
                  key={box.id}
                  className="rounded-xl border border-neutral-200/80 bg-white/70 p-6 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-900/60"
                >
                  <div className="flex items-center gap-2.5">
                    {box.icon && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {(() => {
                          const IconComp = getBoxIcon(box.icon);
                          return <IconComp className="h-4 w-4" />;
                        })()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {box.title}
                      </h2>
                      {box.subtitle && (
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          {box.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {box.description && (
                    <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {box.description}
                    </p>
                  )}

                  {/* Contact / Links Row */}
                  {(box.email || box.phone || box.showAiChat || box.linkUrl) && (
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                      {box.email && (
                        <a
                          href={`mailto:${box.email}`}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                          <Mail className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{box.email}</span>
                        </a>
                      )}
                      {box.email && (box.phone || box.showAiChat || box.linkUrl) && (
                        <span className="opacity-30">•</span>
                      )}

                      {box.phone && (
                        <a
                          href={`tel:${box.phone.replace(/\s+/g, "")}`}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                          <Phone className="h-3.5 w-3.5 text-neutral-500" />
                          <span dir="ltr">{box.phone}</span>
                        </a>
                      )}
                      {box.phone && (box.showAiChat || box.linkUrl) && (
                        <span className="opacity-30">•</span>
                      )}

                      {box.showAiChat && (
                        <Link
                          href={`/${locale}/chat`}
                          className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{isAr ? "اسأل عن أنس عبر المساعد" : "Ask About Anas via AI"}</span>
                        </Link>
                      )}

                      {box.linkUrl && (
                        <Link
                          href={box.linkUrl.startsWith("/") ? `/${locale}${box.linkUrl}` : box.linkUrl}
                          className="inline-flex items-center gap-1.5 font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
                        >
                          <span>{box.linkLabel || box.linkUrl}</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Grid of Competency, Education, Experience, & Custom Boxes */}
              {otherBoxes.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {otherBoxes.map((box) => {
                    const IconComp = getBoxIcon(box.icon);
                    const colClass =
                      box.colSpan === 3
                        ? "sm:col-span-2 lg:col-span-3"
                        : box.colSpan === 2
                        ? "sm:col-span-2 lg:col-span-2"
                        : "col-span-1";

                    return (
                      <div
                        key={box.id}
                        className={`rounded-xl border border-neutral-200/80 bg-white/50 p-5 text-start dark:border-neutral-800/80 dark:bg-neutral-900/40 ${colClass}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                              <IconComp className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {box.title}
                            </h3>
                          </div>
                          {box.linkUrl && (
                            <Link
                              href={box.linkUrl.startsWith("/") ? `/${locale}${box.linkUrl}` : box.linkUrl}
                              className="shrink-0 text-xs font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
                            >
                              {box.linkLabel || (isAr ? "المزيد ←" : "More →")}
                            </Link>
                          )}
                        </div>

                        {box.subtitle && (
                          <p className="mt-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {box.subtitle}
                          </p>
                        )}

                        {box.description && (
                          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            {box.description}
                          </p>
                        )}

                        {box.items && box.items.length > 0 && (
                          <ul className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            {box.items.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Verified Document Section */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 sm:text-base dark:text-neutral-100">
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
      </FadeIn>
    </div>
  );
}
