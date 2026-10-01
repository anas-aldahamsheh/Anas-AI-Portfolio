import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Light/dark brand wordmark. It scales with the screen so the header row (logo, language,
 * theme, menu) fits even a 320px phone without pushing the menu button off screen.
 * `sizes` keeps the downloaded variant close to the displayed width.
 */
const WIDTH =
  "h-auto w-[150px] min-[360px]:w-[180px] min-[390px]:w-[210px] sm:w-[236px] lg:w-[262px]";
const SIZES =
  "(min-width: 1024px) 262px, (min-width: 640px) 236px, (min-width: 390px) 210px, 180px";

export function BrandLogo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("relative flex min-w-0 items-center", className)}>
      <Image
        src="/images/logo.png"
        alt={name}
        width={2012}
        height={307}
        sizes={SIZES}
        className={cn(WIDTH, "max-w-full object-contain dark:hidden")}
        priority
      />
      <Image
        src="/images/logo-dark.png"
        alt=""
        aria-hidden="true"
        width={2012}
        height={307}
        sizes={SIZES}
        className={cn(WIDTH, "hidden max-w-full object-contain dark:block")}
        loading="eager"
      />
    </span>
  );
}
