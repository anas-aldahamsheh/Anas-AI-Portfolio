"use client";

import Link from "next/link";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import type { NavigationItem } from "../domain/types";
import { NavIcon } from "./nav-icon";
import {
  type SocialProfile,
  BASELINE_GITHUB_PROFILE,
  BASELINE_LINKEDIN_PROFILE,
} from "@/modules/social/domain/types";
import { GitHubPopover, LinkedInPopover } from "@/modules/social/presentation";

export interface FooterProps {
  locale: string;
  items: NavigationItem[];
  brandTitle?: string;
  githubProfile?: SocialProfile;
  linkedinProfile?: SocialProfile;
}

export function Footer({ locale, items, brandTitle, githubProfile, linkedinProfile }: FooterProps) {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();

  const getLocalizedHref = (item: NavigationItem): string => {
    if (item.destinationType === "external") {
      return item.target;
    }
    const cleanTarget = item.target.startsWith("/") ? item.target : `/${item.target}`;
    return `/${locale}${cleanTarget === "/" ? "" : cleanTarget}`;
  };

  const resolvedBrandTitle = brandTitle || t("home.title");

  // Separate navigation items for footer display
  const primaryNavItems = items.filter(
    (item) => item.target !== "/chat" && item.target !== "/job-fit",
  );
  const capabilityItems = items.filter(
    (item) => item.target === "/chat" || item.target === "/job-fit",
  );

  return (
    <footer className="w-full border-t border-neutral-200 bg-neutral-50 py-12 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission Column */}
          <div className="space-y-3 sm:col-span-2">
            <Link
              href={`/${locale}`}
              className="text-base font-bold text-neutral-900 transition-colors hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
            >
              {resolvedBrandTitle}
            </Link>
            <p className="max-w-md text-xs leading-relaxed text-neutral-500 sm:text-sm dark:text-neutral-400">
              {t("footer.built_with")}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <GitHubPopover profile={githubProfile || BASELINE_GITHUB_PROFILE} locale={locale} />
              <LinkedInPopover
                profile={linkedinProfile || BASELINE_LINKEDIN_PROFILE}
                locale={locale}
              />
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-900 uppercase dark:text-neutral-200">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {primaryNavItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={getLocalizedHref(item)}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    <NavIcon name={item.iconKey} className="h-3.5 w-3.5 opacity-60" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-900 uppercase dark:text-neutral-200">
              {t("footer.capabilities")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {capabilityItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={getLocalizedHref(item)}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    <NavIcon name={item.iconKey} className="h-3.5 w-3.5 opacity-60" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Rights & Metadata Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-200/80 pt-6 text-xs text-neutral-500 sm:flex-row dark:border-neutral-800/80 dark:text-neutral-400">
          <p>
            © {currentYear} {resolvedBrandTitle}. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>WCAG 2.2 AA</span>
            <span>•</span>
            <span>RTL / LTR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
