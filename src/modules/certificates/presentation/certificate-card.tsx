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
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200/60 bg-white/80 text-neutral-600 shadow-xs dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300">
              <Award className="h-6 w-6 opacity-80" aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Date overlay */}
        <div className="absolute end-3 bottom-2.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
            <Calendar className="h-3 w-3" />
            <span>{certificate.issueDate}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5 text-xs font-medium text-primary">
          {issuer}
        </div>

        <h3 className="text-base font-bold tracking-tight text-[#173B6C] transition-colors group-hover:text-primary sm:text-lg dark:text-neutral-100">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-400">
          {description}
        </p>

        {/* Skills Tags */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {certificate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-neutral-200/80 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300"
              >
                {skill}
              </span>
            ))}
            {certificate.skills.length > 4 && (
              <span className="text-[11px] font-medium text-neutral-400">
                +{certificate.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-primary dark:text-neutral-100">
            <Eye className="h-3.5 w-3.5" />
            <span>{isArabic ? "عرض تفاصيل الشهادة" : "View Details"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
