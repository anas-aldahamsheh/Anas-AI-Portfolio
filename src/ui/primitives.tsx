import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The site's card surface (glassy white / translucent dark), shared by every page. */
export const cardSurface =
  "rounded-2xl border border-[#E5EAF2] bg-white/85 shadow-xs backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300 hover:border-[#D0E2FF] hover:shadow-[0_18px_40px_-24px_rgba(23,59,108,0.35)] dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15] dark:hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}) {
  return <Tag className={cn(cardSurface, className)}>{children}</Tag>;
}

export function IconBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D0E2FF] bg-[#EEF5FF] text-[#2F6FED] shadow-2xs dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-indigo-300",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-3 py-1 text-xs font-medium text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-indigo-300">
      {icon}
      {children}
    </span>
  );
}

export function SectionTitle({
  icon,
  children,
  id,
  action,
}: {
  icon?: ReactNode;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon ? <IconBadge>{icon}</IconBadge> : null}
        <h2
          id={id}
          className="text-lg font-bold tracking-tight text-[#173B6C] sm:text-xl dark:text-[#F4F7FF]"
        >
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function TechChips({
  items,
  className,
  limit,
}: {
  items: string[];
  className?: string;
  limit?: number;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  const rest = limit ? items.length - shown.length : 0;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((item) => (
        <li
          key={item}
          className="rounded-full border border-[#E5EAF2] bg-[#F8FAFF] px-2.5 py-1 text-[11px] font-semibold text-[#173B6C] transition-colors duration-200 hover:border-[#D0E2FF] hover:bg-[#EEF5FF] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#CBD5E1] dark:hover:border-indigo-400/30"
        >
          {item}
        </li>
      ))}
      {rest > 0 ? (
        <li className="rounded-full px-2 py-1 text-[11px] font-semibold text-[#637089] dark:text-[#9AA8C0]">
          +{rest}
        </li>
      ) : null}
    </ul>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D0E2FF] bg-[#F8FAFF]/60 px-6 py-14 text-center text-sm text-[#637089] dark:border-white/[0.1] dark:bg-white/[0.02] dark:text-[#9AA8C0]">
      {children}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1420px] px-4 sm:px-6 lg:px-10", className)}>
      {children}
    </div>
  );
}
