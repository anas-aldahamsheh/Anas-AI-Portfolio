import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        aria-invalid={hasError ? "true" : undefined}
        className={cn(
          "flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-900 shadow-xs transition-colors",
          "placeholder:text-neutral-500",
          "focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:ring-neutral-300",
          hasError &&
            "border-destructive focus-visible:ring-destructive dark:border-destructive dark:focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
