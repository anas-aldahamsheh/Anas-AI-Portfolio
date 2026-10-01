import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import { accounts, sessions, users, verifications } from "@/lib/db/schema/auth";

function authSecret(): string {
  const secret = process.env["BETTER_AUTH_SECRET"];
  if (secret && secret.length >= 32) return secret;
  if (
    process.env.NODE_ENV === "production" &&
    process.env["NEXT_PHASE"] !== "phase-production-build"
  ) {
    throw new Error("BETTER_AUTH_SECRET must be set (32+ characters) in production");
  }
  return "development-only-secret-not-for-production-use-000";
}

/** Exact origins allowed to call the auth API (no wildcards). */
function trustedOrigins(): string[] {
  // Local dev servers are trusted only outside production.
  const origins = new Set<string>(
    process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3100"],
  );
  for (const value of [
    process.env["BETTER_AUTH_URL"],
    process.env["NEXT_PUBLIC_APP_URL"],
    process.env["NEXT_PUBLIC_SITE_URL"],
  ]) {
    if (value) origins.add(value.replace(/\/$/, ""));
  }
  for (const host of [
    process.env["VERCEL_URL"],
    process.env["VERCEL_BRANCH_URL"],
    process.env["VERCEL_PROJECT_PRODUCTION_URL"],
  ]) {
    if (host) origins.add(`https://${host}`);
  }
  return [...origins];
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  secret: authSecret(),
  baseURL:
    process.env["BETTER_AUTH_URL"] ||
    (process.env["VERCEL_URL"]
      ? `https://${process.env["VERCEL_URL"]}`
      : process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000"),
  trustedOrigins: trustedOrigins(),
  emailAndPassword: {
    enabled: true,
    // The site has exactly one account: the owner. Nobody can register.
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: { enabled: true, window: 60, max: 20 },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    database: { generateId: () => crypto.randomUUID() },
  },
});
