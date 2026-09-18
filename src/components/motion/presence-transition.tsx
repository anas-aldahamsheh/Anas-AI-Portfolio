"use client";

import React from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { fadeInVariants } from "@/modules/motion/domain/motion-tokens";
import { useMotion } from "@/modules/motion/presentation/motion-provider";
import { cn } from "@/lib/utils";

export interface PresenceTransitionProps extends HTMLMotionProps<"div"> {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PresenceTransition({
  isVisible,
  children,
  className,
  ...props
}: PresenceTransitionProps) {
  const { isReducedMotion, shouldAnimate } = useMotion();

  if (!shouldAnimate) {
    return isVisible ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={fadeInVariants}
          custom={isReducedMotion}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn("w-full", className)}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
