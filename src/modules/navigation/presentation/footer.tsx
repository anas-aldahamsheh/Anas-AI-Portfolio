"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import type { NavigationItem } from "../domain/types";
import type { SocialProfile } from "@/modules/social/domain/types";
import { DEVELOPER_PROFILE } from "@/lib/config/developer-profile";

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

export function Footer({
  locale = "ar",
  brandTitle,
  githubProfile,
  linkedinProfile,
}: FooterProps) {
  const isArabic = locale === "ar";

  const resolvedGithubUrl = githubProfile?.url || DEVELOPER_PROFILE.github.url;
  const resolvedGithubDisplay = githubProfile?.handle
    ? `github.com/${githubProfile.handle}`
    : DEVELOPER_PROFILE.github.display;

  const resolvedLinkedinUrl = linkedinProfile?.url || DEVELOPER_PROFILE.linkedin.url;
  const resolvedLinkedinDisplay = linkedinProfile?.handle
    ? `linkedin.com/in/${linkedinProfile.handle}`
    : DEVELOPER_PROFILE.linkedin.display;

  const navLinks = [
    { href: `/${locale}`, label: isArabic ? "نظرة عامة" : "Overview" },
    { href: `/${locale}/cv`, label: isArabic ? "نبذة والسيرة الذاتية" : "About & Resume" },
    { href: `/${locale}/experience`, label: isArabic ? "الخبرات العملية" : "Experience" },
    { href: `/${locale}/projects`, label: isArabic ? "المشاريع" : "Projects" },
    { href: `/${locale}/certificates`, label: isArabic ? "الدورات والشهادات" : "Certificates" },
    { href: `/${locale}/contact`, label: isArabic ? "التواصل" : "Contact" },
  ];

  return (
    <footer className="mt-auto border-t border-[#E5EAF2] bg-transparent text-[#0B1530] transition-colors duration-300 dark:border-white/[0.08] dark:text-[#F6F8FC]">
      <div className="mx-auto max-w-[1420px] px-4 py-12 sm:px-6 md:py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 text-start">
          {/* COLUMN 1: Brand & Personal Positioning */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#0B1530] dark:text-[#F6F8FC]">
                {brandTitle || (isArabic ? DEVELOPER_PROFILE.fullName.ar : DEVELOPER_PROFILE.fullName.en)}
              </h3>
              <p className="text-xs font-semibold text-[#2F6FED] dark:text-indigo-400 mt-1">
                {isArabic ? DEVELOPER_PROFILE.headline.ar : DEVELOPER_PROFILE.headline.en}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-[#6C7893] dark:text-[#9AA8C0] max-w-sm">
              {isArabic
                ? "مهندس برمجيات متخصص في بناء وتطوير حلول الذكاء الاصطناعي التوليدي، أنظمة RAG المتقدمة، وتطبيقات الويب الإنتاجية عالية الأداء والقابلة للتوسع."
                : "Specialized in architecting production-grade AI systems, advanced RAG architectures, and resilient, high-performance web platforms."}
            </p>
          </div>

          {/* COLUMN 2: Contact Developer */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#0B1530] dark:text-[#F6F8FC]">
              {isArabic ? "بيانات التواصل المباشر" : "Contact Developer"}
            </h4>
            <div className="flex flex-col items-start gap-2.5 text-xs">
              {/* Phone */}
              <a
                href={DEVELOPER_PROFILE.phone.href}
                className="group text-[#6C7893] hover:text-[#2F6FED] inline-flex items-center gap-2.5 font-medium transition-colors dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-blue-50 group-hover:text-[#2F6FED] transition-colors dark:bg-white/[0.04] dark:text-neutral-300 dark:group-hover:bg-white/[0.08] dark:group-hover:text-white">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">
                  {DEVELOPER_PROFILE.phone.display}
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href={resolvedLinkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[#6C7893] hover:text-[#2F6FED] inline-flex items-center gap-2.5 font-medium transition-colors dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-blue-50 group-hover:text-[#2F6FED] transition-colors dark:bg-white/[0.04] dark:text-neutral-300 dark:group-hover:bg-white/[0.08] dark:group-hover:text-white">
                  <LinkedinIcon className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">
                  {resolvedLinkedinDisplay}
                </span>
              </a>

              {/* GitHub */}
              <a
                href={resolvedGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[#6C7893] hover:text-[#2F6FED] inline-flex items-center gap-2.5 font-medium transition-colors dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-blue-50 group-hover:text-[#2F6FED] transition-colors dark:bg-white/[0.04] dark:text-neutral-300 dark:group-hover:bg-white/[0.08] dark:group-hover:text-white">
                  <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">
                  {resolvedGithubDisplay}
                </span>
              </a>
            </div>
          </div>

          {/* COLUMN 3: Navigation */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#0B1530] dark:text-[#F6F8FC]">
              {isArabic ? "التنقل" : "Navigation"}
            </h4>
            <div className="flex flex-col gap-2 text-xs font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#6C7893] hover:text-[#2F6FED] transition-colors dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-[#E5EAF2] pt-6 text-center text-xs text-[#6C7893] sm:text-start dark:border-white/[0.08] dark:text-[#9AA8C0]">
          <p>
            © 2026 Anas Aldahamsheh. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
