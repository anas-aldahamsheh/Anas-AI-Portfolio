import type { ReactNode } from "react";
import type { MessageKey } from "@/i18n/messages";
import { cn } from "@/lib/utils";
import { EditableText } from "./editable";
import { HeroSpotlight } from "./hero-spotlight";
import { SplitText } from "./motion/reveal";

/** The aurora backdrop shared by the home hero and every page hero (the site's signature). */
export function AuroraBackdrop({ intensity = "page" }: { intensity?: "home" | "page" }) {
  const home = intensity === "home";
  return (
    <>
      <HeroSpotlight />
      <div
        aria-hidden="true"
        className={cn(
          "hero-aurora-left pointer-events-none absolute -start-20 -top-24 rounded-full bg-gradient-to-br from-[#BAE6FD]/80 via-[#E0F2FE]/65 to-transparent blur-[100px] dark:from-[#0284c7]/25 dark:via-[#0369a1]/15 dark:to-transparent",
          home ? "h-[520px] w-[640px]" : "h-[480px] w-[580px]",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "hero-aurora-right pointer-events-none absolute -end-20 -top-20 rounded-full bg-gradient-to-bl from-[#DDD6FE]/85 via-[#EDE9FE]/65 to-transparent blur-[110px] dark:from-[#7c3aed]/25 dark:via-[#6d28d9]/15 dark:to-transparent",
          home ? "h-[540px] w-[660px]" : "h-[500px] w-[600px]",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "hero-aurora-center pointer-events-none absolute inset-x-0 top-1/4 mx-auto rounded-full bg-gradient-to-r from-[#BAE6FD]/40 to-[#DDD6FE]/40 blur-[120px] dark:from-[#0284c7]/15 dark:to-[#7c3aed]/15",
          home ? "h-[350px] w-[500px]" : "h-[320px] w-[460px]",
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EBF6FE]/75 via-transparent to-[#F3EEFE]/75 dark:from-[#0B1728]/60 dark:via-transparent dark:to-[#150E2A]/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white dark:to-[#07101F]"
      />
    </>
  );
}

export function PageHero({
  title,
  titleKey,
  subtitle,
  subtitleKey,
  eyebrow,
  actions,
  children,
  className,
}: {
  title: string;
  titleKey?: MessageKey;
  subtitle?: string;
  subtitleKey?: MessageKey;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const heading = <SplitText text={title} baseDelay={80} />;
  return (
    <section
      className={cn(
        "grain relative w-full overflow-hidden border-b border-[#E5EAF2] bg-white dark:border-white/[0.08] dark:bg-[#07101F]",
        className,
      )}
    >
      <AuroraBackdrop />
      <div className="relative z-10 mx-auto max-w-[1420px] px-4 py-12 text-start sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="max-w-3xl space-y-4">
          {eyebrow ? <div data-reveal="fade">{eyebrow}</div> : null}
          <h1 className="font-display relative text-3xl leading-[1.15] font-bold tracking-tight text-[#173B6C] sm:text-4xl md:text-5xl dark:text-[#F4F7FF]">
            {titleKey ? <EditableText k={titleKey}>{heading}</EditableText> : heading}
            <span
              className="hero-name-shimmer-sweep"
              style={{ ["--shimmer-delay" as string]: "700ms" }}
              aria-hidden="true"
            />
          </h1>
          {subtitle ? (
            <p
              data-reveal="blur"
              style={{ ["--reveal-delay" as string]: "260ms" }}
              className="font-ui max-w-2xl text-sm leading-relaxed font-normal text-[#637089] sm:text-base md:text-lg dark:text-[#9AA8C0]"
            >
              {subtitleKey ? <EditableText k={subtitleKey}>{subtitle}</EditableText> : subtitle}
            </p>
          ) : null}
          {actions ? (
            <div
              data-reveal="up"
              style={{ ["--reveal-delay" as string]: "380ms" }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              {actions}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
