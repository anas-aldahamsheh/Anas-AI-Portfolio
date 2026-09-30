import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { listEntries } from "@/server/content/repository";

const PAGES = [
  "",
  "/cv",
  "/experience",
  "/projects",
  "/certificates",
  "/contact",
  "/chat",
  "/job-fit",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await listEntries("project", "en");
  const alternates = (path: string) => ({
    languages: { en: `${base}/en${path}`, ar: `${base}/ar${path}` },
  });
  return [
    ...PAGES.map((path) => ({
      url: `${base}/en${path}`,
      alternates: alternates(path),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...projects.map((project) => ({
      url: `${base}/en/projects/${project.slug}`,
      lastModified: project.updatedAt,
      alternates: alternates(`/projects/${project.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
