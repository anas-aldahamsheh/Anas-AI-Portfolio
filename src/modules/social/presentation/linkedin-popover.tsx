"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Check, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { EditableRegion } from "@/modules/admin/presentation";
import type { SocialProfile } from "../domain/types";
import { BASELINE_LINKEDIN_PROFILE } from "../domain/types";
import { SocialIcon } from "./social-icon";

export interface LinkedInPopoverProps {
  profile?: SocialProfile | undefined;
  locale?: string | undefined;
  className?: string | undefined;
}

export function LinkedInPopover({
  profile = BASELINE_LINKEDIN_PROFILE,
  locale,
  className,
}: LinkedInPopoverProps) {
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => {
    setIsOpen((prev) => !prev);
  };

  const closePopover = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Handle ESC key and click-outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopover();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closePopover();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closePopover]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profile.url);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const title = t("social.linkedin.title") || "LinkedIn Profile";
  const description =
    t("social.linkedin.description") ||
    profile.description ||
    "Connect on LinkedIn for AI leadership & engineering collaborations";
  const canonicalUrlLabel = t("social.canonical_url") || "Canonical URL:";
  const copyLabel = isCopied ? t("social.copied") || "Copied!" : t("social.copy_url") || "Copy URL";
  const openLabel = t("social.open_profile") || "Open Profile";

  return (
    <div className={`relative inline-block ${className || ""}`}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="outline"
        size="icon"
        onClick={togglePopover}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={title}
        className="h-8 w-8 rounded-full text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
      >
        <SocialIcon name="linkedin" className="h-4 w-4" />
      </Button>

      {/* Popover Surface */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="animate-in fade-in zoom-in-95 absolute end-0 top-full z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-5 shadow-xl backdrop-blur-md duration-150 sm:w-96 dark:border-neutral-800 dark:bg-neutral-900/98"
        >
          <EditableRegion
            editableRef={{
              entityType: "system_setting",
              entityId: profile.id,
              fieldOrBlockId: "linkedin_profile",
              locale: locale === "en" ? "en" : "ar",
              title: "LinkedIn Profile Settings",
              initialData: {
                url: profile.url,
                handle: profile.handle,
                displayName: profile.displayName,
              },
            }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                    <SocialIcon name="linkedin" className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {profile.displayName}
                    </h3>
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="px-1.5 py-0 font-mono text-[10px]"
                    >
                      @{profile.handle}
                    </Badge>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePopover}
                  aria-label="Close popover"
                  className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-start text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                {description}
              </p>

              {/* Canonical URL Container (Forced LTR for URLs) */}
              <div className="space-y-1 text-start">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {canonicalUrlLabel}
                </span>
                <div
                  dir="ltr"
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 font-mono text-xs break-all text-neutral-800 select-all dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                >
                  {profile.url}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant={isCopied ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5 text-xs"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copyLabel}</span>
                </Button>

                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                    <span>{openLabel}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>

              {/* Live screen reader announcement */}
              <div aria-live="polite" className="sr-only">
                {isCopied ? "LinkedIn URL copied to clipboard" : ""}
              </div>
            </div>
          </EditableRegion>
        </div>
      )}
    </div>
  );
}
