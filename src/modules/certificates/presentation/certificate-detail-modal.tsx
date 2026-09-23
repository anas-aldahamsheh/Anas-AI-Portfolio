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
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#0B1528] animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E5EAF2] px-6 py-4 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xs font-semibold text-[#6C7893] uppercase tracking-wider dark:text-[#9AA8C0]">
                {isArabic ? "تفاصيل الشهادة والدورة" : "Certificate & Course Details"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#6C7893] hover:bg-[#EEF5FF] hover:text-[#173B6C] transition-colors dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-[#F4F7FF]"
            aria-label={isArabic ? "إغلاق" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Certificate Image Preview */}
          <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-[#E5EAF2] bg-[#F4F8FF] dark:border-white/[0.08] dark:bg-neutral-850">
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
                <Award className="h-12 w-12 text-[#6C7893] dark:text-[#9AA8C0]" />
              </div>
            )}

            {certificate.imageUrl && !imageError && (
              <a
                href={certificate.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute end-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>{isArabic ? "فتح بالحجم الكامل" : "Open Full Image"}</span>
              </a>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
                {issuer}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#6C7893] dark:text-[#9AA8C0]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{certificate.issueDate}</span>
              </span>
            </div>

            <h2 id="certificate-modal-title" className="text-xl font-bold text-[#173B6C] sm:text-2xl dark:text-[#F4F7FF]">
              {title}
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#6C7893] uppercase tracking-wider dark:text-[#9AA8C0]">
              {isArabic ? "نظرة عامة ومحتوى الدورة" : "Course Overview & Content"}
            </h3>
            <p className="text-sm leading-relaxed text-[#4A5568] dark:text-[#CBD5E1]">
              {description}
            </p>
          </div>

          {/* Skills Covered */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#6C7893] uppercase tracking-wider dark:text-[#9AA8C0]">
                {isArabic ? "المهارات والتقنيات المكتسبة" : "Skills & Competencies Acquired"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-medium text-[#1E40AF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6FED] dark:text-indigo-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#E5EAF2] bg-[#F8FAFF] px-6 py-4 dark:border-white/[0.08] dark:bg-[#07101F]/80">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full border border-[#D0E2FF] bg-white px-5 py-2 text-xs font-semibold text-[#173B6C] shadow-2xs hover:bg-[#EEF5FF] hover:text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200"
          >
            <span>{isArabic ? "إغلاق" : "Close"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
