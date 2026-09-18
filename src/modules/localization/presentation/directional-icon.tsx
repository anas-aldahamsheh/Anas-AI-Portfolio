import React from "react";
import { getIconDirectionClass, isDirectionalIcon } from "../domain/direction";

interface DirectionalIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Direction-Aware Icon component.
 * Automatically mirrors directional icons (chevrons, back/forward arrows) in RTL layouts,
 * while leaving universal icons (external links, play, search) untouched.
 */
export function DirectionalIcon({
  name,
  className = "",
  size = 16,
  children,
  ...props
}: DirectionalIconProps) {
  const mirrorClass = getIconDirectionClass(name);
  const combinedClassName = `${mirrorClass} ${className}`.trim();

  // If children SVG paths are passed, render them inside the wrapper SVG
  if (children) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={combinedClassName}
        data-directional={isDirectionalIcon(name) ? "true" : "false"}
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  }

  // Pre-configured standard SVGs for common icons
  switch (name.toLowerCase()) {
    case "chevron-right":
    case "chevron-end":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={combinedClassName}
          data-directional="true"
          aria-hidden="true"
          {...props}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );

    case "chevron-left":
    case "chevron-start":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={combinedClassName}
          data-directional="true"
          aria-hidden="true"
          {...props}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );

    case "arrow-right":
    case "arrow-end":
    case "forward":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={combinedClassName}
          data-directional="true"
          aria-hidden="true"
          {...props}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );

    case "arrow-left":
    case "arrow-start":
    case "back":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={combinedClassName}
          data-directional="true"
          aria-hidden="true"
          {...props}
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );

    case "external-link":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={combinedClassName}
          data-directional="false"
          aria-hidden="true"
          {...props}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={combinedClassName}
          data-directional={isDirectionalIcon(name) ? "true" : "false"}
          aria-hidden="true"
          {...props}
        />
      );
  }
}
