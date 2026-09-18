import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __db_client: postgres.Sql | undefined;
}

const connectionString =
  process.env["DATABASE_URL"] || "postgresql://postgres:postgres@localhost:5432/portfolio_dev";

const clientOptions: postgres.Options<{}> = {
  max: process.env.NODE_ENV === "production" ? 10 : 1,
  idle_timeout: 20,
  connect_timeout: process.env.NODE_ENV === "test" ? 1 : 10,
};

if (connectionString.includes("sslmode=require")) {
  clientOptions.ssl = "require";
}

export const client = globalThis.__db_client ?? postgres(connectionString, clientOptions);

if (process.env.NODE_ENV !== "production") {
  globalThis.__db_client = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
