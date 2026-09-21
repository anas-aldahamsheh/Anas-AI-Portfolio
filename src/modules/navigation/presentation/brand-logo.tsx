import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
}

/**
 * BrandLogo renders the custom cyan & electric blue gradient logo.
 * Features rich vibrant cyan/sapphire tones that shine across both
 * light and dark themes with zero layout shift and full accessibility.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("relative flex items-center shrink-0", className)}>
      <Image
        src="/images/logo-chatgpt.png"
        alt="Anas Al Dahamsheh — AI Engineer"
        width={1582}
        height={242}
        priority
        className="h-full w-auto max-h-full object-contain transition-all duration-300 dark:brightness-105 dark:drop-shadow-[0_0_12px_rgba(0,194,255,0.28)]"
      />
      {/* Accessible text for screen readers and automated test assertions */}
      <span className="sr-only">Anas Al Dahamsheh</span>
    </div>
  );
}
