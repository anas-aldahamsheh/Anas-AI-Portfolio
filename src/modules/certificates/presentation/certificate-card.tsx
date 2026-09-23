"use client";

import { useState } from "react";
import { Award, Eye, Calendar } from "lucide-react";
import type { CertificateItem } from "../domain/types";

export interface CertificateCardProps {
  certificate: CertificateItem;
  locale: string;
  onSelect: (cert: CertificateItem) => void;
}

export function CertificateCard({ certificate, locale, onSelect }: CertificateCardProps) {
  const [imageError, setImageError] = useState(false);
  const isArabic = locale === "ar";

  const title = isArabic ? certificate.title.ar : certificate.title.en;
  const issuer = isArabic ? certificate.issuer.ar : certificate.issuer.en;
  const description = isArabic ? certificate.description.ar : certificate.description.en;

  return (
    <div
      onClick={() => onSelect(certificate)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/85 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D0E2FF] hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(certificate);
        }
      }}
      aria-label={title}
    >
      {/* Certificate Image Preview Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-850">
        {!imageError && certificate.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={certificate.imageUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-200/50 to-neutral-300/30 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300">
              <Award className="h-6 w-6 opacity-80" aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Date overlay */}
        <div className="absolute end-3 bottom-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Calendar className="h-3 w-3" />
            <span>{certificate.issueDate}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-2.5 py-0.5 text-xs font-semibold text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
            {issuer}
          </span>
        </div>

        <h3 className="text-base font-bold tracking-tight text-[#173B6C] transition-colors group-hover:text-[#2F6FED] sm:text-lg dark:text-[#F4F7FF] dark:group-hover:text-indigo-300">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#6C7893] sm:text-sm dark:text-[#9AA8C0]">
          {description}
        </p>

        {/* Skills Tags */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {certificate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#D0E2FF]/80 bg-[#F4F8FF] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#1E40AF] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-indigo-200"
              >
                {skill}
              </span>
            ))}
            {certificate.skills.length > 4 && (
              <span className="text-[11px] font-medium text-[#6C7893] dark:text-[#9AA8C0]">
                +{certificate.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-[#E5EAF2] pt-3 dark:border-white/[0.06]">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173B6C] transition-colors group-hover:text-[#2F6FED] dark:text-[#F4F7FF] dark:group-hover:text-indigo-300">
            <Eye className="h-3.5 w-3.5" />
            <span>{isArabic ? "عرض تفاصيل الشهادة" : "View Details"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
