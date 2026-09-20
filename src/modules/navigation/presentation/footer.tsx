"use client";

import Link from "next/link";
import { Phone, Sparkles } from "lucide-react";
import type { NavigationItem } from "../domain/types";
import type { SocialProfile } from "@/modules/social/domain/types";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";

export type DashboardLocale = "en" | "ar";

export interface FooterProps {
  locale?: string;
  items?: NavigationItem[];
  brandTitle?: string;
  githubProfile?: SocialProfile;
  linkedinProfile?: SocialProfile;
  copy?: {
    navRunCenter?: string;
    navResults?: string;
  };
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function Footer({ locale = "ar", items, brandTitle }: FooterProps) {
  const { t } = useLocalization();

  const getLocalizedHref = (item: NavigationItem): string => {
    if (item.destinationType === "external") {
      return item.target;
    }
    const cleanTarget = item.target.startsWith("/") ? item.target : `/${item.target}`;
    return `/${locale}${cleanTarget === "/" ? "" : cleanTarget}`;
  };

  const isArabic = locale === "ar";

  return (
    <footer className="border-border bg-card/95 text-card-foreground mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand & Personal Positioning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-md shadow-xs">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-foreground text-sm font-extrabold tracking-tight">
                  {brandTitle || (isArabic ? "أنس الدحامشة" : "Anas Aldahamsheh")}
                </h3>
                <p className="text-muted-foreground text-xs font-medium">
                  {isArabic ? "مهندس ذكاء اصطناعي وبرمجيات" : "AI & Full-Stack Software Engineer"}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {isArabic
                ? "مهندس برمجيات متخصص في بناء وتطوير حلول الذكاء الاصطناعي التوليدي، أنظمة RAG المتقدمة، وتطبيقات الويب الإنتاجية عالية الأداء والقابلة للتوسع."
                : "Specialized in architecting production-grade AI systems, advanced RAG architectures, and resilient, high-performance web platforms."}
            </p>
          </div>

          {/* Developer Contacts */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              {isArabic ? "بيانات التواصل المباشر" : "Contact Developer"}
            </h4>
            <div className="flex flex-col items-start gap-2.5 text-xs">
              {/* Phone */}
              <a
                href="tel:+962789495167"
                className="group text-foreground hover:text-primary inline-flex items-center gap-2.5 font-medium transition-colors"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex h-7 w-7 items-center justify-center rounded-md transition">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">
                  +962 789 495 167
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/anas-aldahamsheh"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-foreground hover:text-primary inline-flex items-center gap-2.5 font-medium transition-colors"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex h-7 w-7 items-center justify-center rounded-md transition">
                  <LinkedinIcon className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">
                  linkedin.com/in/anas-aldahamsheh
                </span>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/anas-aldahamsheh"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-foreground hover:text-primary inline-flex items-center gap-2.5 font-medium transition-colors"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex h-7 w-7 items-center justify-center rounded-md transition">
                  <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">
                  github.com/anas-aldahamsheh
                </span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              {isArabic ? "روابط سريعة" : "Navigation"}
            </h4>
            <div className="flex flex-col gap-2 text-xs font-medium">
              {items && items.length > 0 ? (
                items.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={getLocalizedHref(item)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(item.labelKey)}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href={`/${locale}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isArabic ? "نظرة عامة" : "Overview"}
                  </Link>
                  <Link
                    href={`/${locale}/cv`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isArabic ? "نبذة والسيرة الذاتية" : "About & Resume"}
                  </Link>
                  <Link
                    href={`/${locale}/experience`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isArabic ? "الخبرات العملية" : "Experience"}
                  </Link>
                  <Link
                    href={`/${locale}/projects`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isArabic ? "المشاريع ودراسات الحالة" : "Projects & Deep Dives"}
                  </Link>
                  <Link
                    href={`/${locale}/certificates`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isArabic ? "الدورات والشهادات" : "Certificates & Courses"}
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isArabic ? "تواصل معي" : "Contact"}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-border text-muted-foreground mt-8 border-t pt-5 text-center text-xs sm:text-start">
          <p>
            © 2026 <strong>Anas Aldahamsheh</strong>.{" "}
            {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
