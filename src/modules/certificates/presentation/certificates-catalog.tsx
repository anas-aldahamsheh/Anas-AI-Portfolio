"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { CertificateCard } from "./certificate-card";
import { CertificateDetailModal } from "./certificate-detail-modal";
import type { CertificateItem } from "../domain/types";

export interface CertificatesCatalogProps {
  certificates: CertificateItem[];
  locale: string;
}

export function CertificatesCatalog({ certificates, locale }: CertificatesCatalogProps) {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const isArabic = locale === "ar";

  if (!certificates || certificates.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
        <Award className="h-10 w-10 text-neutral-400 mb-3" />
        <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
          {isArabic ? "لا توجد شهادات متاحة حالياً" : "No certificates available yet"}
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          {isArabic
            ? "سيتم إضافة الشهادات والدورات المعتمدة قريباً."
            : "Verified courses and certificates will be added soon."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {certificates.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            locale={locale}
            onSelect={(selected) => setSelectedCert(selected)}
          />
        ))}
      </div>

      {/* Modal View */}
      <CertificateDetailModal
        certificate={selectedCert}
        locale={locale}
        onClose={() => setSelectedCert(null)}
      />
    </>
  );
}
