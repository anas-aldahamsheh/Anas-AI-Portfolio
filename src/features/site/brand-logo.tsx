import Image from "next/image";
import { cn } from "@/lib/utils";

/** Light/dark brand wordmark. `sizes` keeps the downloaded variant ~260px wide, not 2000px. */
export function BrandLogo({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn("relative flex h-8 w-auto shrink-0 items-center sm:h-9 lg:h-10", className)}
    >
      <Image
        src="/images/logo.png"
        alt={name}
        width={2012}
        height={307}
        sizes="(min-width: 1024px) 262px, (min-width: 640px) 236px, 210px"
        className="h-full w-auto object-contain dark:hidden"
        priority
      />
      <Image
        src="/images/logo-dark.png"
        alt=""
        aria-hidden="true"
        width={2012}
        height={307}
        sizes="(min-width: 1024px) 262px, (min-width: 640px) 236px, 210px"
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  );
}
