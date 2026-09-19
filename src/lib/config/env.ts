import { z } from "zod";

const isBuildPhase =
  process.env["NEXT_PHASE"] === "phase-production-build" ||
  process.env["SKIP_ENV_VALIDATION"] === "true" ||
  process.env["npm_lifecycle_event"] === "build";

const isDevOrTest = process.env.NODE_ENV !== "production" || isBuildPhase;

/**
 * Environment Schema Specification
 * Conforms to docs/ops/02_ENVIRONMENT_VARIABLES.md
 */
export const envSchema = z.object({
  // 1. Application Runtime
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // 2. Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default(isDevOrTest ? "postgresql://postgres:postgres@localhost:5432/portfolio_dev" : ""),

  // 3. Authentication
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long")
    .default(isDevOrTest ? "dev_default_auth_secret_minimum_32_characters_long_for_security" : ""),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  // 4. Master Encryption Key (32-byte hex for AES-256-GCM)
  ENCRYPTION_MASTER_KEY: z
    .string()
    .length(64, "ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes)")
    .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_MASTER_KEY must contain only hexadecimal characters")
    .default(isDevOrTest ? "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" : ""),

  // 5. Vector Database (Qdrant)
  QDRANT_URL: z.string().url().optional().or(z.literal("")),
  QDRANT_API_KEY: z.string().optional().or(z.literal("")),

  // 6. Cache / Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),

  // 7. Blob Storage (S3-compatible)
  BLOB_STORAGE_ENDPOINT: z.string().url().optional().or(z.literal("")),
  BLOB_STORAGE_REGION: z.string().optional().or(z.literal("")),
  BLOB_STORAGE_BUCKET: z.string().optional().or(z.literal("")),
  BLOB_STORAGE_ACCESS_KEY_ID: z.string().optional().or(z.literal("")),
  BLOB_STORAGE_SECRET_ACCESS_KEY: z.string().optional().or(z.literal("")),

  // 8. Observability
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal("")),

  // 9. AI Providers
  GEMINI_API_KEY: z.string().optional().or(z.literal("")),
  GOOGLE_AI_API_KEY: z.string().optional().or(z.literal("")),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates environment variables against the schema.
 * Throws a formatted error if validation fails.
 */
export function validateEnv(customEnv?: Record<string, unknown>): Env {
  const target = customEnv ?? process.env;
  const result = envSchema.safeParse(target);

  if (!result.success) {
    const formattedErrors = result.error.format();
    const errorDetails = Object.entries(formattedErrors)
      .filter(([key]) => key !== "_errors")
      .map(([key, value]) => {
        const errors = (value as { _errors?: string[] })._errors ?? [];
        return `  - ${key}: ${errors.join(", ")}`;
      })
      .join("\n");

    const message = `[FATAL] Invalid environment configuration:\n${errorDetails}`;
    console.error(message);
    throw new Error(message);
  }

  return result.data;
}

/**
 * Retrieves the validated runtime environment configuration.
 * Caches the result on subsequent calls.
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

export const env = getEnv();
