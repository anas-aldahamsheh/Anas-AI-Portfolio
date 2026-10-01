"use client";

import { useEffect, type RefObject } from "react";

/**
 * Keeps a full-height mobile sheet above the on-screen keyboard. iOS overlays the keyboard on
 * the page instead of resizing it, so the sheet follows the *visual* viewport: its height and
 * bottom offset are written to CSS variables on the element (no React render per frame).
 */
export function useVisualViewport(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current;
    const viewport = window.visualViewport;
    if (!enabled || !element || !viewport) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bottom = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      element.style.setProperty("--vv-height", `${Math.round(viewport.height)}px`);
      element.style.setProperty("--vv-bottom", `${Math.round(bottom)}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      element.style.removeProperty("--vv-height");
      element.style.removeProperty("--vv-bottom");
    };
  }, [ref, enabled]);
}
