"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@/modules/motion/domain/motion-tokens";
import { useMotion } from "@/modules/motion/presentation/motion-provider";
import { cn } from "@/lib/utils";

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className, ...props }: StaggerContainerProps) {
  const { isReducedMotion, shouldAnimate } = useMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      custom={isReducedMotion}
      initial="hidden"
      animate="visible"
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  const { isReducedMotion, shouldAnimate } = useMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      custom={isReducedMotion}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
