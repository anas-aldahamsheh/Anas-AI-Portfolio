import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("relative flex items-center shrink-0", className)}>
      <Image
        src="/images/logo.png"
        alt="Anas Al Dahamsheh — AI Engineer"
        width={2045}
        height={298}
        priority
        className="h-full w-auto max-h-full object-contain transition-all duration-300 dark:brightness-105 dark:drop-shadow-[0_0_10px_rgba(0,194,255,0.25)]"
      />
      {/* Accessible text for screen readers and automated test assertions */}
      <span className="sr-only">Anas Al Dahamsheh</span>
    </div>
  );
}
