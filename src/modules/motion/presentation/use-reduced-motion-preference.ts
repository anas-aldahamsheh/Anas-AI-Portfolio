"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  if (!mediaQuery || !mediaQuery.addEventListener) {
    return () => {};
  }

  mediaQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook to detect whether the user prefers reduced motion.
 * Uses useSyncExternalStore for hydration-safe, React 19 compliant reactivity.
 */
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
