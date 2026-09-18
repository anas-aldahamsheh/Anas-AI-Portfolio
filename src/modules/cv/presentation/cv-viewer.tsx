"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
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

  const downloadUrl = "/api/cv/download?download=1";
  const viewUrl = "/api/cv/download";

  const formattedDate = cv.publishedAt
    ? new Date(cv.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn delay={0.05}>
        {/* Header and Actions */}
        <EditableRegion
          editableRef={{
            entityType: "page",
            entityId: "cv",
            fieldOrBlockId: "header",
            locale: locale === "en" ? "en" : "ar",
            title: "CV Page Header",
            initialData: {
              title: t("cv.title") || "Curriculum Vitae",
              subtitle: t("cv.subtitle") || "View and download the latest verified resume",
            },
          }}
        >
          <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end dark:border-neutral-800">
            <div className="space-y-2 text-start">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                  {t("cv.title") || "Curriculum Vitae"}
                </h1>
                <Badge variant="secondary" size="sm">
                  {t("cv.version_label", { version: String(cv.versionNumber) }) ||
                    `v${cv.versionNumber}`}
                </Badge>
              </div>

              <p className="max-w-2xl text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
                {t("cv.subtitle") ||
                  "View and download the latest verified resume for Software & AI Engineering."}
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {formattedDate && (
                  <span>
                    {t("cv.published_date", { date: formattedDate }) ||
                      `Published: ${formattedDate}`}
                  </span>
                )}
                <span>•</span>
                <span>
                  {t("cv.filesize_label", { size: formatFileSize(cv.fileSize) }) ||
                    `Size: ${formatFileSize(cv.fileSize)}`}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex shrink-0 items-center gap-2.5">
              <Link href={downloadUrl}>
                <Button variant="primary" size="md" className="gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>{t("cv.download") || "Download PDF"}</span>
                </Button>
              </Link>

              <Link href={viewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" className="gap-2">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {t("cv.open_fullscreen") || "Open New Tab"}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </EditableRegion>

        {/* Admin Controls (visible only when admin edit mode is ON) */}
        <CvAdminControls currentCv={cv} versions={versions} />

        {/* Responsive Document Viewer */}
        <div className="mt-8">
          {/* Desktop Embedded PDF Viewer */}
          <div className="hidden w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm md:block dark:border-neutral-800 dark:bg-neutral-900">
            <object
              data={viewUrl}
              type="application/pdf"
              aria-label={t("cv.title") || "Curriculum Vitae PDF"}
              className="h-[840px] w-full"
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
