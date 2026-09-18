"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/modules/theme/presentation/theme-toggle";
import { LanguageSelect } from "@/modules/localization/presentation/language-select";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PresenceTransition } from "@/components/motion";
import type { NavigationItem } from "../domain/types";
import { NavIcon } from "./nav-icon";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  locale: string;
  items: NavigationItem[];
  brandTitle?: string;
}

export function Navbar({ locale, items, brandTitle }: NavbarProps) {
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

  const resolvedBrandTitle = brandTitle || t("home.title");

  return (
    <>
      {/* WCAG 2.2 AA Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:text-neutral-50 focus:shadow-md focus:ring-2 focus:ring-neutral-400 focus:outline-none dark:focus:bg-neutral-100 dark:focus:text-neutral-900"
      >
        {locale === "ar" ? "الانتقال إلى المحتوى الرئيسي" : "Skip to main content"}
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Link */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-semibold tracking-tight text-neutral-900 transition-colors hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
          >
            <span className="max-w-[200px] truncate text-sm font-bold sm:max-w-none sm:text-base">
              {resolvedBrandTitle}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main Navigation"}
            className="hidden items-center gap-1 md:flex lg:gap-2"
          >
            {items.map((item) => {
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
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm",
                    active
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
                  )}
                >
                  <NavIcon name={item.iconKey} className="h-4 w-4 opacity-70" />
                  <span>{label}</span>
                  {item.badge && (
                    <Badge variant="secondary" size="sm" className="ms-1 px-1.5 py-0 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector, Theme Toggle, Mobile Menu Trigger */}
          <div className="flex items-center gap-2">
            <LanguageSelect currentLocale={locale} />
            <ThemeToggle locale={locale} />

            {/* Mobile Menu Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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

        {/* Mobile Navigation Drawer */}
        <PresenceTransition isVisible={isMobileMenuOpen}>
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label={locale === "ar" ? "قائمة التنقل للهواتف" : "Mobile navigation menu"}
            className="border-b border-neutral-200 bg-white px-4 py-4 shadow-lg md:hidden dark:border-neutral-800 dark:bg-neutral-950"
          >
            <nav className="flex flex-col gap-1">
              {items.map((item) => {
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
                      "flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <NavIcon name={item.iconKey} className="h-4 w-4 opacity-70" />
                      <span>{label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" size="sm" className="px-1.5 py-0 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </PresenceTransition>
      </header>
    </>
  );
}
