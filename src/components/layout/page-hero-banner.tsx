"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PageHeroBannerProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  enableTypewriter?: boolean;
}

/**
 * PageHeroBanner
 * Reusable hero header matching the exact interactive mouse radiance,
 * typewriter text streaming with glowing cursor, and ambient Aurora glow
 * of the approved Overview page across all public pages.
 */
export function PageHeroBanner({
  badge,
  title,
  subtitle,
  actions,
  meta,
  children,
  className,
  enableTypewriter = true,
}: PageHeroBannerProps) {
  const bannerRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    bannerRef.current.style.setProperty("--mouse-x", `${x}px`);
    bannerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const isTitleString = typeof title === "string";
  const isSubString = typeof subtitle === "string";
  const rawTitle = isTitleString ? (title as string) : "";
  const rawSub = isSubString ? (subtitle as string) : "";

  const isTestEnv =
    typeof process !== "undefined" && process.env.NODE_ENV === "test";

  const [mounted, setMounted] = useState(false);
  const [titleText, setTitleText] = useState(isTestEnv ? rawTitle : "");
  const [subText, setSubText] = useState(isTestEnv ? rawSub : "");
  const [cursorPhase, setCursorPhase] = useState<"title" | "sub" | "none">(
    isTestEnv ? "none" : "title"
  );
  const [isTitleDone, setIsTitleDone] = useState(isTestEnv);

  useEffect(() => {
    setMounted(true);
    if (isTestEnv || !enableTypewriter || !isTitleString) {
      setTitleText(rawTitle);
      setSubText(rawSub);
      setIsTitleDone(true);
      setCursorPhase("none");
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    setTitleText("");
    setSubText("");
    setIsTitleDone(false);
    setCursorPhase("title");

    const streamTitle = (idx: number) => {
      if (isCancelled) return;
      if (idx <= rawTitle.length) {
        setTitleText(rawTitle.slice(0, idx));
        if (idx < rawTitle.length) {
          const delay = 35 + Math.floor(Math.random() * 15);
          timeoutId = setTimeout(() => streamTitle(idx + 1), delay);
        } else {
          setIsTitleDone(true);
          if (isSubString && rawSub.length > 0) {
            timeoutId = setTimeout(() => {
              if (isCancelled) return;
              setCursorPhase("sub");
              streamSub(1);
            }, 180);
          } else {
            timeoutId = setTimeout(() => {
              if (isCancelled) return;
              setCursorPhase("none");
            }, 800);
          }
        }
      }
    };

    const streamSub = (idx: number) => {
      if (isCancelled) return;
      if (idx <= rawSub.length) {
        setSubText(rawSub.slice(0, idx));
        if (idx < rawSub.length) {
          const delay = 16 + Math.floor(Math.random() * 10);
          timeoutId = setTimeout(() => streamSub(idx + 1), delay);
        } else {
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            setCursorPhase("none");
          }, 1000);
        }
      }
    };

    timeoutId = setTimeout(() => streamTitle(1), 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [rawTitle, rawSub, enableTypewriter, isTitleString, isSubString, isTestEnv]);

  return (
    <section
      ref={bannerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group/hero relative w-full overflow-hidden border-b border-[#E5EAF2] bg-white transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#07101F]",
        className
      )}
      style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
    >
      {/* Interactive Mouse Spotlight Glow - Light Mode */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100 dark:hidden"
        style={{
          background:
            "radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.24), rgba(168, 85, 247, 0.18), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Interactive Mouse Spotlight Glow - Dark Mode */}
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100 dark:block"
        style={{
          background:
            "radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(14, 165, 233, 0.28), rgba(147, 51, 234, 0.24), transparent 70%)",
        }}
        aria-hidden="true"
      />

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
            {isTitleString ? (
              <div className="relative inline-block min-h-[1.2em]">
                <h1
                  aria-label={rawTitle}
                  className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF] leading-[1.18]"
                >
                  {mounted && enableTypewriter && !isTestEnv ? (
                    <span className="inline-flex items-baseline">
                      <span>{titleText}</span>
                      {cursorPhase === "title" && (
                        <span
                          className="ms-1.5 inline-block w-[3px] sm:w-[3.5px] rounded-full bg-gradient-to-b from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.7)] align-baseline"
                          style={{ height: "0.82em" }}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  ) : (
                    <span>{rawTitle}</span>
                  )}
                </h1>
                {isTitleDone && (
                  <div className="hero-name-shimmer-sweep pointer-events-none" aria-hidden="true" />
                )}
              </div>
            ) : (
              title
            )}

            {isSubString ? (
              <p
                aria-label={rawSub}
                className="font-manrope text-sm sm:text-base md:text-lg font-normal leading-relaxed text-[#6C7893] dark:text-[#9AA8C0] max-w-2xl min-h-[1.5em]"
              >
                {mounted && enableTypewriter && !isTestEnv ? (
                  <span className="inline-flex items-baseline flex-wrap">
                    <span>{subText}</span>
                    {cursorPhase === "sub" && (
                      <span
                        className="ms-1 inline-block w-[2.5px] rounded-full bg-gradient-to-b from-[#4F46E5] to-[#0891B2] dark:from-[#8B8CFF] dark:to-[#67E8F9] animate-pulse shadow-[0_0_8px_rgba(8,145,178,0.7)] align-baseline"
                        style={{ height: "0.8em" }}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                ) : (
                  <span>{rawSub}</span>
                )}
              </p>
            ) : (
              subtitle
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
