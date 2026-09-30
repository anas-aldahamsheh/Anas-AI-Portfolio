import type { ReactNode } from "react";

/**
 * Link to the CV file route. A plain anchor on purpose: it's a file download handled by a route
 * handler, not a page, so client-side navigation and prefetching must not touch it.
 */
export function CvLink({
  inline = false,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const href = inline ? "/api/cv?inline=1" : "/api/cv";
  return (
    <a
      href={href}
      className={className}
      {...(inline ? { target: "_blank", rel: "noopener noreferrer" } : { download: true })}
    >
      {children}
    </a>
  );
}
