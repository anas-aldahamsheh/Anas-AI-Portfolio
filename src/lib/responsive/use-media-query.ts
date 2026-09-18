"use client";

import { useSyncExternalStore, useCallback } from "react";
import { MEDIA_QUERIES } from "./breakpoints";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const media = window.matchMedia(query);
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onStoreChange);
        return () => media.removeEventListener("change", onStoreChange);
      } else {
        media.addListener(onStoreChange);
        return () => media.removeListener(onStoreChange);
      }
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile(): boolean {
  return useMediaQuery(MEDIA_QUERIES.mobile);
}

export function useIsTablet(): boolean {
  return useMediaQuery(MEDIA_QUERIES.tablet);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(MEDIA_QUERIES.desktop);
}
