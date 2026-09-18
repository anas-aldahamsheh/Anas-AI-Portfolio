import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "border-transparent bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 shadow-xs",
    secondary:
      "border-transparent bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
    outline: "text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800",
    success:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    destructive: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-0.5 text-xs font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border transition-colors focus:ring-2 focus:ring-neutral-900 focus:outline-none dark:focus:ring-neutral-300",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
