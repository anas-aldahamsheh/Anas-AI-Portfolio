import type { Transition, Variants } from "motion/react";

/**
 * Motion System Design Tokens
 * Adheres strictly to docs/frontend/05_MOTION_SYSTEM.md:
 * - short, subtle, interruptible, state-driven, performant
 * - zero long entrance sequences, zero floating blobs
 * - full reduced-motion awareness
 */

export const MOTION_DURATIONS = {
  instant: 0,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

export const MOTION_EASINGS = {
  default: [0.16, 1, 0.3, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  linear: "linear" as const,
};

export interface MotionConfig {
  reducedMotion: boolean;
}

/**
 * Generates transition configuration based on reduced-motion preference.
 */
export function getTransition(
  duration: keyof typeof MOTION_DURATIONS = "normal",
  reducedMotion = false,
  delay = 0,
): Transition {
  if (reducedMotion) {
    return {
      duration: 0.01,
      delay: 0,
      ease: "linear",
    };
  }

  return {
    duration: MOTION_DURATIONS[duration],
    delay,
    ease: MOTION_EASINGS.default,
  };
}

/**
 * Reusable animation variants
 */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: (reducedMotion: boolean) => ({
    opacity: 1,
    transition: getTransition("normal", reducedMotion),
  }),
  exit: (reducedMotion: boolean) => ({
    opacity: 0,
    transition: getTransition("fast", reducedMotion),
  }),
} satisfies Variants;

export const slideUpVariants = {
  hidden: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 8,
  }),
  visible: (reducedMotion: boolean) => ({
    opacity: 1,
    y: 0,
    transition: getTransition("normal", reducedMotion),
  }),
  exit: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : -4,
    transition: getTransition("fast", reducedMotion),
  }),
} satisfies Variants;

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: (reducedMotion: boolean) => ({
    opacity: 1,
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.05,
      delayChildren: reducedMotion ? 0 : 0.02,
    },
  }),
} satisfies Variants;

export const staggerItemVariants = {
  hidden: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 6,
  }),
  visible: (reducedMotion: boolean) => ({
    opacity: 1,
    y: 0,
    transition: getTransition("normal", reducedMotion),
  }),
} satisfies Variants;
