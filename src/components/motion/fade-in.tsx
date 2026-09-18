"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { fadeInVariants } from "@/modules/motion/domain/motion-tokens";
import { useMotion } from "@/modules/motion/presentation/motion-provider";
import { cn } from "@/lib/utils";

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  const { isReducedMotion, shouldAnimate } = useMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeInVariants}
      custom={isReducedMotion}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: isReducedMotion ? 0 : delay }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
