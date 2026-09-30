import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Static shells + cached data, invalidated by tag when the admin edits content.
  cacheComponents: true,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/images/**" }],
  },
  experimental: {
    serverActions: {
      // Vercel caps request bodies at 4.5 MB; uploads are checked against 4 MB in the action.
      bodySizeLimit: "4.4mb",
    },
    optimizePackageImports: ["lucide-react", "motion"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Retired pages from the first version.
      { source: "/:locale(en|ar)/lab", destination: "/:locale/projects", permanent: true },
      { source: "/:locale(en|ar)/evaluation", destination: "/:locale/projects", permanent: true },
      { source: "/:locale(en|ar)/about", destination: "/:locale/cv", permanent: true },
      { source: "/:locale(en|ar)/sign-up", destination: "/:locale/sign-in", permanent: true },
    ];
  },
};

export default nextConfig;
