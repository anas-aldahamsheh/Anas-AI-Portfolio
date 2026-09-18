import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  retryText?: React.ReactNode;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export function ErrorState({
  className,
  icon,
  title,
  description,
  retryText,
  onRetry,
  action,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/40 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20",
        className,
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        {icon || <AlertTriangle className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
      {onRetry && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryText || "Retry"}
          </Button>
        </div>
      )}
      {!onRetry && action && <div className="mt-5">{action}</div>}
    </div>
  );
}
