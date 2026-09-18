import React from "react";
import { FolderSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800",
        className,
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-neutral-100 p-3 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {icon || <FolderSearch className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
