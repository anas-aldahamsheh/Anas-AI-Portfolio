import { defineConfig } from "drizzle-kit";

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
