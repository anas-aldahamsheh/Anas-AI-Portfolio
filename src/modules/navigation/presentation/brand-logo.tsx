import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
}

/**
 * BrandLogo renders the horizontal lockup of Anas Al Dahamsheh — AI Engineer (logo2).
 * Supports seamless light and dark mode versions with full vector clarity,
 * zero layout shift, and accessible screen reader text.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("relative flex items-center shrink-0", className)}>
      {/* Light Mode Logo */}
      <Image
        src="/images/logo2-clean.png"
        alt="Anas Al Dahamsheh — AI Engineer"
        width={2122}
        height={301}
        priority
        className="h-full w-auto max-h-full object-contain dark:hidden"
      />
      {/* Dark Mode Logo */}
      <Image
        src="/images/logo2-clean-dark.png"
        alt="Anas Al Dahamsheh — AI Engineer"
        width={2122}
        height={301}
        priority
        className="hidden h-full w-auto max-h-full object-contain dark:inline-block"
      />
      {/* Accessible text for screen readers and automated test assertions */}
      <span className="sr-only">Anas Al Dahamsheh</span>
    </div>
  );
}
