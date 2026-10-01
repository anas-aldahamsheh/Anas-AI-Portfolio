import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read .env.local on its own.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: ["./src/lib/db/schema/index.ts", "./src/lib/db/schema/legacy/index.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env["DATABASE_URL"] || "postgresql://postgres:postgres@127.0.0.1:5439/portfolio_dev",
  },
  strict: true,
  verbose: true,
});
