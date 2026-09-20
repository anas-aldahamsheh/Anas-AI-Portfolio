"use client";

import { useEffect, useState } from "react";
import { X, Award, Calendar, CheckCircle2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CertificateItem } from "../domain/types";

export interface CertificateDetailModalProps {
  certificate: CertificateItem | null;
  locale: string;
  onClose: () => void;
}

export function CertificateDetailModal({
  certificate,
  locale,
  onClose,
}: CertificateDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const isArabic = locale === "ar";

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (certificate) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  const title = isArabic ? certificate.title.ar : certificate.title.en;
  const issuer = isArabic ? certificate.issuer.ar : certificate.issuer.en;
  const description = isArabic ? certificate.description.ar : certificate.description.en;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                {isArabic ? "تفاصيل الشهادة والدورة" : "Certificate & Course Details"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label={isArabic ? "إغلاق" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Certificate Image Preview */}
          <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-850">
            {!imageError && certificate.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={certificate.imageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className="h-full w-full object-contain bg-neutral-950/20"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Award className="h-12 w-12 text-neutral-400" />
              </div>
            )}

            {certificate.imageUrl && !imageError && (
              <a
                href={certificate.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute end-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>{isArabic ? "فتح بالحجم الكامل" : "Open Full Image"}</span>
              </a>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {issuer}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{certificate.issueDate}</span>
              </span>
            </div>

            <h2 id="certificate-modal-title" className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-neutral-100">
              {title}
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              {isArabic ? "نظرة عامة ومحتوى الدورة" : "Course Overview & Content"}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {description}
            </p>
          </div>

          {/* Skills Covered */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                {isArabic ? "المهارات والتقنيات المكتسبة" : "Skills & Competencies Acquired"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-200/80 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            <span>{isArabic ? "إغلاق" : "Close"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
