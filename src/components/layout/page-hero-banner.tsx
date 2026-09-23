import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeroBannerProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * PageHeroBanner
 * Reusable hero header matching the ambient Aurora glow and typography
 * of the approved Overview page, providing seamless design consistency.
 */
export function PageHeroBanner({
  badge,
  title,
  subtitle,
  actions,
  meta,
  children,
  className,
}: PageHeroBannerProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-b border-[#E5EAF2] bg-white transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#07101F]",
        className
      )}
    >
      {/* Living Aurora Glow Aura on Left */}
      <div
        className="hero-aurora-left pointer-events-none absolute -top-24 -start-20 h-[480px] w-[580px] rounded-full bg-gradient-to-br from-[#BAE6FD]/80 via-[#E0F2FE]/65 to-transparent blur-[100px] dark:from-[#0284c7]/25 dark:via-[#0369a1]/15 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Living Aurora Glow Aura on Right */}
      <div
        className="hero-aurora-right pointer-events-none absolute -top-20 -end-20 h-[500px] w-[600px] rounded-full bg-gradient-to-bl from-[#DDD6FE]/85 via-[#EDE9FE]/65 to-transparent blur-[110px] dark:from-[#7c3aed]/25 dark:via-[#6d28d9]/15 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Soft Ambient Floating Center Orb */}
      <div
        className="hero-aurora-center pointer-events-none absolute top-1/4 start-1/2 -translate-x-1/2 h-[320px] w-[460px] rounded-full bg-gradient-to-r from-[#BAE6FD]/35 to-[#DDD6FE]/35 blur-[120px] dark:from-[#0284c7]/12 dark:to-[#7c3aed]/12"
        aria-hidden="true"
      />

      {/* Base horizontal wash from soft cyan to transparent center to soft lavender */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EBF6FE]/75 via-transparent to-[#F3EEFE]/75 dark:from-[#0B1728]/60 dark:via-transparent dark:to-[#150E2A]/60"
        aria-hidden="true"
      />

      {/* Soft bottom fade so hero seamlessly blends into the rest of the page */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-b from-transparent to-white dark:to-[#07101F]"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16 text-start">
        <div className="max-w-3xl space-y-4">
          {badge && <div className="inline-block">{badge}</div>}

          <div className="space-y-2">
            {typeof title === "string" ? (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF] leading-[1.18]">
                {title}
              </h1>
            ) : (
              title
            )}

            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg font-normal leading-relaxed text-[#6C7893] dark:text-[#9AA8C0] max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {meta && <div className="pt-1">{meta}</div>}

          {actions && <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div>}

          {children}
        </div>
      </div>
    </section>
  );
}
