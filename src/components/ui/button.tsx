"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      startIcon,
      endIcon,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300 dark:focus-visible:ring-offset-neutral-950 cursor-pointer";

    const variantStyles = {
      primary:
        "bg-neutral-900 text-neutral-50 hover:bg-neutral-800 active:bg-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-100 shadow-xs",
      secondary:
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-600",
      outline:
        "border border-neutral-200 bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-100 shadow-xs",
      ghost:
        "hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-100",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-600 shadow-xs",
      link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100 p-0 h-auto font-normal",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-9 px-4 text-sm rounded-md gap-2",
      lg: "h-11 px-6 text-base rounded-md gap-2.5",
      icon: "h-9 w-9 p-0 rounded-md shrink-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== "link" && sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
        {!isLoading && startIcon && <span className="shrink-0">{startIcon}</span>}
        {children}
        {!isLoading && endIcon && <span className="shrink-0">{endIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
