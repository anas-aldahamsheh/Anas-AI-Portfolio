"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following glow for hero sections. Pointer events are coalesced into one update per
 * animation frame; touch devices and reduced-motion visitors skip it entirely.
 */
export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const host = layer?.parentElement;
    if (!layer || !host) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          layer.style.setProperty("--mx", `${x}px`);
          layer.style.setProperty("--my", `${y}px`);
          layer.style.opacity = "1";
        });
      }
    };
    const onLeave = () => {
      layer.style.opacity = "0";
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 [background:radial-gradient(650px_circle_at_var(--mx,50%)_var(--my,50%),rgba(56,189,248,0.22),rgba(168,85,247,0.16),transparent_70%)] dark:[background:radial-gradient(650px_circle_at_var(--mx,50%)_var(--my,50%),rgba(14,165,233,0.26),rgba(147,51,234,0.22),transparent_70%)]"
    />
  );
}
