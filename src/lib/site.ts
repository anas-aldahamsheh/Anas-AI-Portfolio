/** Absolute base URL of the deployment, for metadata, sitemaps and auth callbacks. */
export function siteUrl(): string {
  const explicit = process.env["NEXT_PUBLIC_SITE_URL"] || process.env["BETTER_AUTH_URL"];
  if (explicit && !explicit.includes("localhost")) return explicit.replace(/\/$/, "");
  const production = process.env["VERCEL_PROJECT_PRODUCTION_URL"];
  if (production) return `https://${production}`;
  const deployment = process.env["VERCEL_URL"];
  if (deployment) return `https://${deployment}`;
  return process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000";
}
