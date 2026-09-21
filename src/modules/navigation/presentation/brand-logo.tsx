import { cn } from "@/lib/utils";

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * BrandLogo renders the official vector logo from "logo final.svg".
 * Features the stylized AD monogram, personal name, bright blue accent divider,
 * and AI Engineer subtitle with responsive dark/light mode support.
 */
export function BrandLogo({ className = "h-8 sm:h-9 w-auto", ...props }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="25 95 1400 270"
      role="img"
      aria-labelledby="brandTitle brandDesc"
      className={cn("shrink-0", className)}
      {...props}
    >
      <title id="brandTitle">Anas Al Dahamsheh — AI Engineer</title>
      <desc id="brandDesc">Transparent high-quality vector logo with AD monogram, name, and AI Engineer subtitle.</desc>

      <defs>
        {/* Light mode gradient for AD monogram */}
        <linearGradient id="blueGradLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0B1530" />
        </linearGradient>

        {/* Dark mode gradient for AD monogram */}
        <linearGradient id="blueGradDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="55%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>

        {/* Vibrant blue gradient for divider */}
        <linearGradient id="blueBright" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* AD monogram */}
      <g transform="translate(40 88)">
        {/* Stylized A - Light mode */}
        <path
          d="M0 230 L118 18 H154 L274 230 H224 L198 181 H75 L49 230 Z"
          fill="url(#blueGradLight)"
          className="dark:hidden"
        />
        {/* Stylized A - Dark mode */}
        <path
          d="M0 230 L118 18 H154 L274 230 H224 L198 181 H75 L49 230 Z"
          fill="url(#blueGradDark)"
          className="hidden dark:inline"
        />

        {/* Stylized D - Light mode */}
        <path
          d="M146 18 H229 C294 18 337 58 337 124 C337 190 294 230 229 230 H146 V184 H222 C265 184 289 162 289 124 C289 86 265 64 222 64 H146 Z"
          fill="url(#blueGradLight)"
          className="dark:hidden"
        />
        {/* Stylized D - Dark mode */}
        <path
          d="M146 18 H229 C294 18 337 58 337 124 C337 190 294 230 229 230 H146 V184 H222 C265 184 289 162 289 124 C289 86 265 64 222 64 H146 Z"
          fill="url(#blueGradDark)"
          className="hidden dark:inline"
        />

        {/* Accent wedge */}
        <path d="M96 230 L131 168 H163 L129 230 Z" fill="#2F6FED" />
      </g>

      {/* Name: adaptive light/dark colors */}
      <text
        x="420"
        y="220"
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize="104"
        fontWeight="800"
        letterSpacing="-3"
        fill="currentColor"
        className="text-[#0B1530] transition-colors duration-200 dark:text-[#F8FAFC]"
      >
        Anas Al Dahamsheh
      </text>

      {/* Accent divider */}
      <rect x="420" y="280" width="165" height="12" rx="6" fill="url(#blueBright)" />

      {/* Subtitle */}
      <text
        x="620"
        y="340"
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize="72"
        fontWeight="500"
        letterSpacing="2"
        fill="currentColor"
        className="text-[#6B7C99] transition-colors duration-200 dark:text-[#9AA8C0]"
      >
        AI Engineer
      </text>
    </svg>
  );
}
