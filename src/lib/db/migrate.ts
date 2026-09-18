import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, client } from "./client";
import { logger } from "@/lib/observability/logger";

export async function runMigrations() {
  logger.info("database_migrations_started", { module: "db" });

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("database_migrations_completed", { module: "db" });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("database_migrations_failed", {
      module: "db",
      errorCode: "MIGRATION_FAILED",
      metadata: { message: errMessage },
    });
    throw error;
  } finally {
    await client.end();
  }
}

// Allow direct execution via CLI (e.g. tsx src/lib/db/migrate.ts)
if (process.argv[1]?.includes("migrate.ts")) {
  runMigrations()
    .then(() => {
      logger.info("migrations_applied_successfully", { module: "db" });
      process.exit(0);
    })
    .catch((err) => {
      logger.error("migration_execution_failed", {
        module: "db",
        metadata: { error: String(err) },
      });
      process.exit(1);
    });
}
