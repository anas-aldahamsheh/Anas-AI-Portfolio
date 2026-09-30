import { migrate } from "drizzle-orm/postgres-js/migrator";
import { client, db } from "./client";

/** Applies pending migrations from ./drizzle (idempotent SQL; safe to re-run). */
export async function runMigrations() {
  const host =
    (process.env["DATABASE_URL"] ?? "").replace(/^.*@/, "").replace(/\/.*$/, "") || "local";
  console.info(`Applying migrations to ${host} ...`);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.info("Migrations applied.");
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.includes("migrate")) {
  runMigrations().catch((error) => {
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
