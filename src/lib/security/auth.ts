import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import { users, sessions, accounts, verifications } from "@/lib/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret:
    process.env["BETTER_AUTH_SECRET"] ||
    "dev_default_auth_secret_minimum_32_characters_long_for_security",
  baseURL:
    process.env["BETTER_AUTH_URL"] ||
    process.env["NEXT_PUBLIC_APP_URL"] ||
    (process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : "http://localhost:3000"),
  trustedOrigins: [
    "http://localhost:3000",
    "https://anas-ai-portfolio-roan.vercel.app",
    "https://*.vercel.app",
    ...(process.env["NEXT_PUBLIC_APP_URL"] ? [process.env["NEXT_PUBLIC_APP_URL"]] : []),
    ...(process.env["BETTER_AUTH_URL"] ? [process.env["BETTER_AUTH_URL"]] : []),
    ...(process.env["VERCEL_URL"] ? [`https://${process.env["VERCEL_URL"]}`] : []),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type Auth = typeof auth;
