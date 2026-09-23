"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/modules/theme/presentation/theme-toggle";
import { LanguageSelect } from "@/modules/localization/presentation/language-select";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { Button } from "@/components/ui/button";
import { PresenceTransition } from "@/components/motion";
import type { NavigationItem } from "../domain/types";
import { cn } from "@/lib/utils";
import type { SocialProfile } from "@/modules/social/domain/types";
import { UserNav } from "@/modules/auth/presentation/user-nav";
import { BrandLogo } from "./brand-logo";

export interface NavbarProps {
  locale: string;
  items: NavigationItem[];
  brandTitle?: string | undefined;
  githubProfile?: SocialProfile | undefined;
  linkedinProfile?: SocialProfile | undefined;
  currentUser?: {
    id: string;
    email: string;
    name?: string | null | undefined;
    image?: string | null | undefined;
    role?: string | undefined;
  } | null | undefined;
}

export function Navbar({
  locale,
  items,
  brandTitle,
  currentUser,
}: NavbarProps) {
  const pathname = usePathname();
  const { t } = useLocalization();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Reset mobile menu on route change without effect cascade
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const getLocalizedHref = (item: NavigationItem): string => {
    if (item.destinationType === "external") {
      return item.target;
    }
    const cleanTarget = item.target.startsWith("/") ? item.target : `/${item.target}`;
    return `/${locale}${cleanTarget === "/" ? "" : cleanTarget}`;
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.destinationType === "external") return false;
    const href = getLocalizedHref(item);
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  };

  const resolvedBrandTitle = brandTitle || (locale === "ar" ? "أنس الدحامشة" : "Anas Al Dahamsheh");

  // Keep public destinations strictly matched to the approved navigation items
  const publicNavItems = items.filter((item) => item.id !== "nav-admin" && item.isVisible);

  return (
    <>
      {/* WCAG 2.2 AA Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:text-neutral-50 focus:shadow-md focus:ring-2 focus:ring-[#2F6FED] focus:outline-none dark:focus:bg-white dark:focus:text-neutral-900"
      >
        {locale === "ar" ? "الانتقال إلى المحتوى الرئيسي" : "Skip to main content"}
      </a>

      {/* 
        ==================================================
        FULL-WIDTH HEADER (Edge-to-Edge)
        Width: 100% full width, height: 64px (h-16), border-b
        Left: Brand | Center: Navigation | Right: [ AR ] [ Theme Toggle ] [ Sign In ]
        ==================================================
      */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/85 backdrop-blur-md transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#07101F]/85">
        <div className="mx-auto flex h-16 max-w-[1420px] items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* LEFT: Brand Identity */}
          <Link
            href={`/${locale}`}
            className="flex items-center transition-opacity hover:opacity-85 text-start shrink-0"
            aria-label={`${resolvedBrandTitle} - ${locale === "ar" ? "مهندس ذكاء اصطناعي" : "AI Engineer"}`}
          >
            <BrandLogo className="h-8 sm:h-9 lg:h-10 w-auto" />
          </Link>

          {/* CENTER: Navigation Links */}
          <nav
            aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main Navigation"}
            className="hidden items-center gap-1 md:flex lg:gap-1.5"
          >
            {publicNavItems.map((item) => {
              const active = isItemActive(item);
              const label = t(item.labelKey);

              return (
                <Link
                  key={item.id}
                  href={getLocalizedHref(item)}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3.5 py-1.5 text-xs lg:text-[13px] font-medium transition-all duration-200 rounded-full flex items-center gap-1",
                    active
                      ? "bg-[#EEF5FF] text-[#1E40AF] font-semibold dark:bg-indigo-950/70 dark:text-indigo-200 dark:border dark:border-indigo-500/30 dark:shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      : "text-[#6C7893] hover:text-[#173B6C] hover:bg-neutral-100/70 dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC] dark:hover:bg-white/[0.06]",
                  )}
                >
                  <span>{label}</span>
                  {item.badge && (
                    <span className="ms-1 px-1.5 py-0 text-[10px] rounded-full bg-neutral-100 text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 
            RIGHT: Control Cluster
            Exact desktop order: [ AR ] -> [ Theme Toggle Icon ] -> [ Sign In ]
            AR -> Theme: ~6-10px
            Theme -> Sign In: ~8-12px
          */}
          <div className="flex items-center gap-2">
            {/* 1. Language Toggle (AR / EN) */}
            <LanguageSelect
              currentLocale={locale}
              className="h-9 w-9 rounded-full border border-neutral-200/80 bg-white/80 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
            />

            {/* 2. Theme Toggle Icon (Moon in Light Mode / Sun in Dark Mode) */}
            <ThemeToggle
              locale={locale}
              className="h-9 w-9 rounded-full border border-[#E4EAF3] bg-white/80 text-neutral-700 shadow-2xs hover:bg-neutral-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
            />

            {/* 3. Sign In Button / Authenticated User Dropdown */}
            <div className="ms-0.5 hidden md:block">
              <UserNav locale={locale} initialUser={currentUser} />
            </div>

            {/* Mobile Menu Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full md:hidden text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/[0.08]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={
                isMobileMenuOpen
                  ? locale === "ar"
                    ? "إغلاق القائمة"
                    : "Close menu"
                  : locale === "ar"
                    ? "فتح القائمة"
                    : "Open menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        <PresenceTransition isVisible={isMobileMenuOpen}>
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label={locale === "ar" ? "قائمة التنقل للهواتف" : "Mobile navigation menu"}
            className="w-full border-t border-neutral-200/80 bg-white/95 px-4 py-4 shadow-xl backdrop-blur-md md:hidden dark:border-white/[0.08] dark:bg-[#07101F]/95"
          >
            <div className="mx-auto max-w-[1420px]">
              <nav className="flex flex-col gap-1.5 text-start">
                {publicNavItems.map((item) => {
                  const active = isItemActive(item);
                  const label = t(item.labelKey);

                  return (
                    <Link
                      key={item.id}
                      href={getLocalizedHref(item)}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#EEF5FF] text-[#1E40AF] font-semibold dark:bg-indigo-950/70 dark:text-indigo-200"
                          : "text-[#6C7893] hover:bg-neutral-100/80 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F8FC]",
                      )}
                    >
                      <span>{label}</span>
                      {item.badge && (
                        <span className="ms-1 px-1.5 py-0 text-[10px] rounded-full bg-neutral-100 text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="mt-2 border-t border-neutral-100 pt-3 dark:border-white/[0.08]">
                  <UserNav locale={locale} initialUser={currentUser} className="w-full justify-center" />
                </div>
              </nav>
            </div>
          </div>
        </PresenceTransition>
      </header>
    </>
  );
}
