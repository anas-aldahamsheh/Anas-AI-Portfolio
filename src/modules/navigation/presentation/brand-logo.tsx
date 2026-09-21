"use client";

import React from "react";

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * BrandLogo renders the official Anas Al Dahamsheh - AI Engineer SVG mark.
 * Perfectly calibrated with responsive viewBox, crisp vector geometry,
 * and adaptive light/dark theme fills.
 */
export function BrandLogo({ className = "h-9 sm:h-10 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="110 110 1100 290"
      role="img"
      aria-labelledby="brandLogoTitle brandLogoDesc"
      className={className}
      {...props}
    >
      <title id="brandLogoTitle">Anas Al Dahamsheh — AI Engineer</title>
      <desc id="brandLogoDesc">Personal brand logo with AD monogram, name, blue divider, and AI Engineer subtitle.</desc>

      <defs>
        {/* Light mode gradient for AD monogram 'A' */}
        <linearGradient id="adBlueLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#153B8F" />
          <stop offset="100%" stopColor="#0B1530" />
        </linearGradient>

        {/* Dark mode gradient for AD monogram 'A' */}
        <linearGradient id="adBlueDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>

        {/* Vibrant accent blue */}
        <linearGradient id="accentBlue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2F6FED" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Main name */}
      <text
        x="120"
        y="200"
        fontFamily="Inter, Segoe UI, Arial, sans-serif"
        fontSize="108"
        fontWeight="800"
        letterSpacing="-3"
        fill="currentColor"
        className="text-[#0B1530] transition-colors duration-200 dark:text-[#F8FAFC]"
      >
        Anas Al Dahamsheh
      </text>

      {/* AD monogram */}
      <g transform="translate(120 245)">
        {/* A - Light mode */}
        <path
          d="M18 128 L74 18 H103 L158 128 H126 L114 102 H62 L50 128 Z M74 77 H103 L89 47 Z"
          fill="url(#adBlueLight)"
          className="dark:hidden"
        />

        {/* A - Dark mode */}
        <path
          d="M18 128 L74 18 H103 L158 128 H126 L114 102 H62 L50 128 Z M74 77 H103 L89 47 Z"
          fill="url(#adBlueDark)"
          className="hidden dark:inline"
        />

        {/* D */}
        <path
          d="M118 18 H171 C215 18 244 41 244 73 C244 105 215 128 171 128 H118 V101 H168 C195 101 211 90 211 73 C211 56 195 45 168 45 H118 Z"
          fill="currentColor"
          className="text-[#0B1530] transition-colors duration-200 dark:text-[#F8FAFC]"
        />

        {/* Accent slash inside monogram */}
        <path d="M79 128 L104 79 H128 L103 128 Z" fill="url(#accentBlue)" />
      </g>

      {/* Divider */}
      <rect x="405" y="286" width="12" height="106" rx="6" fill="url(#accentBlue)" />

      {/* Subtitle */}
      <text
        x="465"
        y="365"
        fontFamily="Inter, Segoe UI, Arial, sans-serif"
        fontSize="78"
        fontWeight="500"
        fill="currentColor"
        className="text-[#6B7C99] transition-colors duration-200 dark:text-[#9AA8C0]"
      >
        AI Engineer
      </text>
    </svg>
  );
}
