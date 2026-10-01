import type { ReactNode } from "react";
import type { MessageKey } from "@/i18n/messages";
import { cn } from "@/lib/utils";
import { EditableText } from "./editable";
import { HeroSpotlight } from "./hero-spotlight";
import { SplitText } from "./motion/reveal";

/**
 * The aurora backdrop shared by the home hero and every page hero (the site's signature).
 * The glows are radial gradients (see `.aurora-*` in globals.css) sized and placed to match the
 * original blurred shapes, so phones don't re-blur three large layers on every frame.
 */
const AURORA = {
  home: {
    left: { width: 920, height: 760, insetInlineStart: -220, top: -216 },
    right: { width: 940, height: 780, insetInlineEnd: -220, top: -200 },
    center: { width: 760, height: 520, top: "calc(25% - 85px)" },
  },
  page: {
    left: { width: 840, height: 700, insetInlineStart: -210, top: -206 },
    right: { width: 860, height: 720, insetInlineEnd: -210, top: -190 },
    center: { width: 700, height: 480, top: "calc(25% - 80px)" },
  },
} as const;

export function AuroraBackdrop({ intensity = "page" }: { intensity?: "home" | "page" }) {
  const size = AURORA[intensity];
  return (
    <>
      <HeroSpotlight />
      <div
        aria-hidden="true"
        className="hero-aurora-left aurora-left pointer-events-none absolute rounded-full"
        style={size.left}
      />
      <div
        aria-hidden="true"
        className="hero-aurora-right aurora-right pointer-events-none absolute rounded-full"
        style={size.right}
      />
      <div
        aria-hidden="true"
        className="hero-aurora-center aurora-center pointer-events-none absolute inset-x-0 mx-auto rounded-full"
        style={size.center}
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
      data-pause-offscreen=""
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
