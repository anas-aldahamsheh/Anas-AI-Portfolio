"use client";

import { AnimatePresence, m } from "motion/react";
import { Award, BadgeCheck, CalendarDays, ExternalLink, FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TiltCard } from "@/ui/tilt-card";

export interface CertificateData {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  description: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  file: string;
  skills: string[];
  featured: boolean;
}

interface Labels {
  verify: string;
  issued: string;
  id: string;
  skills: string;
  view: string;
  close: string;
  file: string;
}

function CertificateImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#FFF7E6] via-white to-[#EEF5FF] dark:from-amber-500/10 dark:via-[#0B1728] dark:to-indigo-500/10 ${className ?? ""}`}
      >
        <Award className="h-12 w-12 text-amber-500" aria-hidden="true" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function CertificateGallery({
  items,
  labels,
}: {
  items: CertificateData[];
  labels: Labels;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = items.find((c) => c.id === openId) ?? null;
  const isOpen = active !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Deep link: /certificates#slug opens that certificate (also when the hash changes later).
  useEffect(() => {
    const openFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const match = items.find((c) => c.slug === slug);
      if (match) setOpenId(match.id);
    };
    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [items]);

  // Modal behaviour: focus moves into the dialog, Tab stays inside it, Escape closes it, and
  // focus returns to the certificate that opened it.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const frame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-edit-list="certificate">
        {items.map((cert, index) => (
          <li
            key={cert.id}
            id={cert.slug}
            className="scroll-mt-24"
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: `${Math.min(index, 6) * 70}ms` }}
          >
            <TiltCard className="rounded-2xl" max={5}>
              <article
                data-edit-entry={cert.id}
                data-edit-collection="certificate"
                data-edit-label={cert.title}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/90 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-[#D0E2FF] hover:shadow-[0_24px_50px_-28px_rgba(23,59,108,0.45)] dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(cert.id)}
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-[#F8FAFF] dark:bg-[#0B1728]"
                  aria-label={`${labels.view}: ${cert.title}`}
                >
                  <m.div layoutId={`cert-${cert.id}`} className="h-full w-full">
                    <CertificateImage
                      src={cert.image}
                      alt={cert.title}
                      className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </m.div>
                  {cert.featured ? (
                    <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                      <BadgeCheck className="h-3 w-3" aria-hidden="true" />★
                    </span>
                  ) : null}
                </button>
                <div className="flex flex-1 flex-col gap-2 p-5 text-start">
                  <h3
                    className="line-clamp-2 font-bold text-[#173B6C] dark:text-[#F4F7FF]"
                    data-edit-field="title"
                    data-edit-id={cert.id}
                    data-edit-collection="certificate"
                  >
                    {cert.title}
                  </h3>
                  <p
                    className="text-sm font-semibold text-[#2F6FED] dark:text-indigo-300"
                    data-edit-field="issuer"
                    data-edit-id={cert.id}
                    data-edit-collection="certificate"
                  >
                    {cert.issuer}
                  </p>
                  {cert.issueDate ? (
                    <p className="flex items-center gap-1.5 text-xs text-[#637089] dark:text-[#9AA8C0]">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {labels.issued}: {cert.issueDate}
                    </p>
                  ) : null}
                  <div className="flex-1" />
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setOpenId(cert.id)}
                      className="rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1.5 text-xs font-semibold text-[#2F6FED] transition-colors hover:bg-[#E0EEFF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-200"
                    >
                      {labels.view}
                    </button>
                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[#637089] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        {labels.verify}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </TiltCard>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active ? (
          <m.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          >
            <m.button
              type="button"
              aria-label={labels.close}
              className="absolute inset-0 bg-slate-950/65"
              onClick={() => setOpenId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              className="relative z-10 grid max-h-[90dvh] max-h-[90vh] w-full max-w-4xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl md:grid-cols-[1.3fr_1fr] md:grid-rows-1 dark:bg-[#0B1728]"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <m.div
                layoutId={`cert-${active.id}`}
                className="relative flex min-h-48 items-center justify-center bg-[#F8FAFF] p-4 md:min-h-64 dark:bg-[#07101F]"
              >
                <CertificateImage
                  src={active.image}
                  alt={active.title}
                  className="max-h-[38dvh] w-full object-contain md:max-h-[70dvh]"
                />
              </m.div>
              <div className="space-y-4 overflow-y-auto p-6">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="absolute end-3 top-3 rounded-full bg-white/80 p-2 text-slate-600 shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                  aria-label={labels.close}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="space-y-1.5 pe-8">
                  <h2 className="text-xl font-bold text-[#173B6C] dark:text-[#F4F7FF]">
                    {active.title}
                  </h2>
                  <p className="text-sm font-semibold text-[#2F6FED] dark:text-indigo-300">
                    {active.issuer}
                  </p>
                </div>
                {active.description ? (
                  <p className="text-sm leading-relaxed text-[#637089] dark:text-[#9AA8C0]">
                    {active.description}
                  </p>
                ) : null}
                <dl className="space-y-2 text-xs">
                  {active.issueDate ? (
                    <div className="flex gap-2">
                      <dt className="font-bold text-[#173B6C] dark:text-[#E2E8F0]">
                        {labels.issued}:
                      </dt>
                      <dd className="text-[#637089] dark:text-[#9AA8C0]">{active.issueDate}</dd>
                    </div>
                  ) : null}
                  {active.credentialId ? (
                    <div className="flex gap-2">
                      <dt className="font-bold text-[#173B6C] dark:text-[#E2E8F0]">{labels.id}:</dt>
                      <dd className="font-mono text-[#637089] dark:text-[#9AA8C0]" dir="ltr">
                        {active.credentialId}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {active.skills.length ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold tracking-wider text-[#637089] uppercase dark:text-[#9AA8C0]">
                      {labels.skills}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {active.skills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-full border border-[#E5EAF2] bg-[#F8FAFF] px-2.5 py-1 text-[11px] font-semibold text-[#173B6C] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#CBD5E1]"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {active.credentialUrl ? (
                  <a
                    href={active.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-primary w-full"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {labels.verify}
                  </a>
                ) : null}
                {active.file ? (
                  <a
                    href={active.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-4 py-2.5 text-sm font-semibold text-[#2F6FED] transition-colors hover:bg-[#E0EEFF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-200 dark:hover:bg-white/[0.08]"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {labels.file}
                  </a>
                ) : null}
              </div>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
