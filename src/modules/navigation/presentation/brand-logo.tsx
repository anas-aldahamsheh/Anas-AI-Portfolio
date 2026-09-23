import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("relative flex items-center shrink-0", className)}>
      {/* Light mode brand logo */}
      <Image
        src="/images/logo.png"
        alt="Anas Al Dahamsheh — AI Engineer"
        width={2037}
        height={579}
        priority
        className="h-full w-auto max-h-full object-contain transition-all duration-300 dark:hidden"
      />
      {/* Dark mode brand logo with luminous white typography */}
      <Image
        src="/images/logo-dark.png"
        alt="Anas Al Dahamsheh — AI Engineer"
        width={2037}
        height={579}
        priority
        className="hidden h-full w-auto max-h-full object-contain transition-all duration-300 dark:block dark:drop-shadow-[0_0_12px_rgba(0,163,255,0.2)]"
      />
      {/* Accessible text for screen readers and automated test assertions */}
      <span className="sr-only">Anas Al Dahamsheh</span>
    </div>
  );
}
