import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/en/admin", "/ar/admin", "/en/sign-in", "/ar/sign-in"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
