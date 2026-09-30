"use client";

import { animate, useInView, useMotionValue, useTransform, m } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts from 0 to `value` when scrolled into view (the final number is server-rendered). */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const count = useMotionValue(value);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    count.set(0);
    const controls = animate(count, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, count]);

  return (
    <m.span ref={ref} className={className}>
      {rounded}
    </m.span>
  );
}
