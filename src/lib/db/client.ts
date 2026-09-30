import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __db_client: postgres.Sql | undefined;
}

const connectionString =
  process.env["DATABASE_URL"] || "postgresql://postgres:postgres@127.0.0.1:5439/portfolio_dev";

const isProduction = process.env.NODE_ENV === "production";

const clientOptions: postgres.Options<{}> = {
  // Serverless instances handle a few concurrent requests each; the Neon pooler does the rest.
  max: isProduction ? 5 : 3,
  idle_timeout: 20,
  connect_timeout: process.env.NODE_ENV === "test" ? 2 : 15,
  // Transaction-mode poolers (Neon "-pooler" hosts, PgBouncer) cannot use named prepared statements.
  prepare: false,
  onnotice: () => {},
};

if (/sslmode=require|neon\.tech/.test(connectionString)) {
  clientOptions.ssl = "require";
}

export const client = globalThis.__db_client ?? postgres(connectionString, clientOptions);

if (!isProduction) {
  globalThis.__db_client = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
