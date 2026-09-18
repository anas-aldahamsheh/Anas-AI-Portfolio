"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useReducedMotionPreference } from "./use-reduced-motion-preference";

export type MotionIntensity = "none" | "reduced" | "normal";

export interface MotionContextValue {
  isReducedMotion: boolean;
  intensity: MotionIntensity;
  shouldAnimate: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  isReducedMotion: false,
  intensity: "normal",
  shouldAnimate: true,
});

export interface MotionProviderProps {
  children: React.ReactNode;
  overrideIntensity?: MotionIntensity;
}

export function MotionProvider({ children, overrideIntensity }: MotionProviderProps) {
  const systemReducedMotion = useReducedMotionPreference();

  const value = useMemo<MotionContextValue>(() => {
    const intensity: MotionIntensity =
      overrideIntensity || (systemReducedMotion ? "reduced" : "normal");
    const isReduced = intensity === "none" || intensity === "reduced" || systemReducedMotion;
    const shouldAnimate = intensity !== "none";

    return {
      isReducedMotion: isReduced,
      intensity,
      shouldAnimate,
    };
  }, [systemReducedMotion, overrideIntensity]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}
