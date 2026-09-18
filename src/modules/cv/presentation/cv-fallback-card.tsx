"use client";

import Link from "next/link";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { formatFileSize, type PublishedCv } from "../domain/cv";

export interface CvFallbackCardProps {
  cv: PublishedCv;
  className?: string | undefined;
}

export function CvFallbackCard({ cv, className }: CvFallbackCardProps) {
  const { t } = useLocalization();

  const downloadUrl = `/api/cv/download?download=1`;
  const viewUrl = `/api/cv/download`;

  return (
    <Card
      className={className || "mx-auto w-full max-w-xl border-neutral-200 dark:border-neutral-800"}
    >
      <CardContent className="space-y-5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
          <FileText className="h-7 w-7" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {cv.fileName}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" size="sm">
              {t("cv.version_label", { version: String(cv.versionNumber) }) ||
                `v${cv.versionNumber}`}
            </Badge>
            <Badge variant="outline" size="sm">
              {formatFileSize(cv.fileSize)}
            </Badge>
          </div>
        </div>

        <p className="mx-auto max-w-md text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t("cv.fallback_notice") ||
            "If the PDF does not display automatically in your browser, you can download or open it directly."}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Link href={downloadUrl} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full gap-2 sm:w-auto">
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{t("cv.download") || "Download Resume (PDF)"}</span>
            </Button>
          </Link>

          <Link
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="md" className="w-full gap-2 sm:w-auto">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span>{t("cv.open_fullscreen") || "Open in New Window"}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
