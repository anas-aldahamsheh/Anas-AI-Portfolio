"use client";

import { m, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

/** Vertical timeline whose accent line "draws" itself as the visitor scrolls through it. */
export function TimelineRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden="true"
        className="absolute start-[15px] top-2 bottom-2 w-px bg-[#E5EAF2] sm:start-[19px] dark:bg-white/[0.08]"
      />
      <m.div
        aria-hidden="true"
        className="absolute start-[15px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[#06B6D4] via-[#2F6FED] to-[#8B5CF6] sm:start-[19px]"
        style={{ scaleY }}
      />
      {children}
    </div>
  );
}
