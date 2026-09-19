import { eq, like, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { secretReferences, auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";
import { encryptString, decryptString, maskSecretValue, type EncryptedPayload } from "./encryption";

export interface SecretMetadata {
  key: string;
  exists: boolean;
  maskedPreview: string | null;
  updatedAt: string | null;
}

export class SecretsService {
  private memoryCache: Map<
    string,
    { payload: EncryptedPayload; masked: string; updatedAt: string }
  > = new Map();

  public clearCache(): void {
    this.memoryCache.clear();
  }

  /**
   * Encrypts and securely stores a secret in the database.
   * Write-only: value is encrypted at rest using AES-256-GCM.
   */
  async setSecret(key: string, rawValue: string, adminUserId: string): Promise<SecretMetadata> {
    if (!key || !rawValue) {
      throw new Error("Secret key and value must be non-empty strings");
    }

    const trimmedKey = key.trim();
    const payload = encryptString(rawValue.trim());
    const masked = maskSecretValue(rawValue.trim());
    const now = new Date();

    try {
      // Upsert into secret_references table
      const existing = await db
        .select()
        .from(secretReferences)
        .where(eq(secretReferences.key, trimmedKey))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        await db
          .update(secretReferences)
          .set({
            encryptedValue: payload.encryptedValue,
            iv: payload.iv,
            tag: payload.tag,
            updatedAt: now,
          })
          .where(eq(secretReferences.id, existing[0].id));
      } else {
        await db.insert(secretReferences).values({
          key: trimmedKey,
          encryptedValue: payload.encryptedValue,
          iv: payload.iv,
          tag: payload.tag,
          updatedAt: now,
        });
      }

      // Write audit event (never records plain text secret)
      try {
        await db.insert(auditEvents).values({
          userId: adminUserId,
          action: "secret_updated",
          entityType: "secret_reference",
          entityId: trimmedKey,
          newState: {
            key: trimmedKey,
            maskedPreview: masked,
          },
        });
      } catch (auditErr) {
        logger.warn("Failed to write audit event for secret update", {
          module: "secrets",
          metadata: { key: trimmedKey, error: String(auditErr) },
        });
      }

      this.memoryCache.set(trimmedKey, {
        payload,
        masked,
        updatedAt: now.toISOString(),
      });

      return {
        key: trimmedKey,
        exists: true,
        maskedPreview: masked,
        updatedAt: now.toISOString(),
      };
    } catch (err) {
      logger.error("Failed to persist secret to database, using memory fallback", {
        module: "secrets",
        metadata: { key: trimmedKey, error: String(err) },
      });

      this.memoryCache.set(trimmedKey, {
        payload,
        masked,
        updatedAt: now.toISOString(),
      });

      return {
        key: trimmedKey,
        exists: true,
        maskedPreview: masked,
        updatedAt: now.toISOString(),
      };
    }
  }

  /**
   * Retrieves and decrypts a secret in server-side code only.
   * Never exposed directly over client-facing APIs.
   */
  async getSecret(key: string): Promise<string | null> {
    const trimmedKey = key.trim();

    // Check memory cache first
    const cached = this.memoryCache.get(trimmedKey);
    if (cached) {
      try {
        return decryptString(cached.payload);
      } catch (err) {
        logger.error("Failed to decrypt cached secret", {
          module: "secrets",
          metadata: { key: trimmedKey, error: String(err) },
        });
      }
    }

    try {
      const rows = await db
        .select()
        .from(secretReferences)
        .where(eq(secretReferences.key, trimmedKey))
        .limit(1);

      if (rows.length > 0 && rows[0]) {
        const row = rows[0];
        const payload: EncryptedPayload = {
          encryptedValue: row.encryptedValue,
          iv: row.iv,
          tag: row.tag,
        };

        const decrypted = decryptString(payload);
        this.memoryCache.set(trimmedKey, {
          payload,
          masked: maskSecretValue(decrypted),
          updatedAt: row.updatedAt.toISOString(),
        });

        return decrypted;
      }
    } catch (err) {
      logger.warn("Failed to load secret from database", {
        module: "secrets",
        metadata: { key: trimmedKey, error: String(err) },
      });
    }

    // Fallback to environment variables if not stored in database
    if (
      trimmedKey === "ai_provider_prov-google-gemini_api_key" ||
      trimmedKey.toLowerCase().includes("gemini")
    ) {
      const envKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_AI_API_KEY"];
      if (envKey) return envKey;
    }
    if (process.env[trimmedKey]) {
      return process.env[trimmedKey]!;
    }

    return null;
  }

  /**
   * Checks if a secret exists without decrypting.
   */
  async hasSecret(key: string): Promise<boolean> {
    const meta = await this.getSecretMetadata(key);
    return meta.exists;
  }

  /**
   * Returns display-safe secret metadata with masked preview.
   */
  async getSecretMetadata(key: string): Promise<SecretMetadata> {
    const trimmedKey = key.trim();
    const cached = this.memoryCache.get(trimmedKey);
    if (cached) {
      return {
        key: trimmedKey,
        exists: true,
        maskedPreview: cached.masked,
        updatedAt: cached.updatedAt,
      };
    }

    try {
      const rows = await db
        .select()
        .from(secretReferences)
        .where(eq(secretReferences.key, trimmedKey))
        .limit(1);

      if (rows.length > 0 && rows[0]) {
        const row = rows[0];
        let masked = "********";
        try {
          const decrypted = decryptString({
            encryptedValue: row.encryptedValue,
            iv: row.iv,
            tag: row.tag,
          });
          masked = maskSecretValue(decrypted);
        } catch {
          // Decryption failed or unkeyed
        }

        return {
          key: trimmedKey,
          exists: true,
          maskedPreview: masked,
          updatedAt: row.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      logger.warn("Failed to query secret metadata from database", {
        module: "secrets",
        metadata: { key: trimmedKey, error: String(err) },
      });
    }

    // Fallback to environment variables if not stored in database
    if (
      trimmedKey === "ai_provider_prov-google-gemini_api_key" ||
      trimmedKey.toLowerCase().includes("gemini")
    ) {
      const envKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_AI_API_KEY"];
      if (envKey) {
        return {
          key: trimmedKey,
          exists: true,
          maskedPreview: maskSecretValue(envKey),
          updatedAt: new Date().toISOString(),
        };
      }
    }
    if (process.env[trimmedKey]) {
      return {
        key: trimmedKey,
        exists: true,
        maskedPreview: maskSecretValue(process.env[trimmedKey]!),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      key: trimmedKey,
      exists: false,
      maskedPreview: null,
      updatedAt: null,
    };
  }

  /**
   * Lists secret metadata, optionally filtered by key prefix.
   */
  async listSecretMetadata(prefix?: string): Promise<SecretMetadata[]> {
    try {
      const query = db.select().from(secretReferences).orderBy(desc(secretReferences.updatedAt));

      const rows = prefix
        ? await query.where(like(secretReferences.key, `${prefix}%`))
        : await query;

      return rows.map((row) => {
        let masked = "********";
        try {
          const decrypted = decryptString({
            encryptedValue: row.encryptedValue,
            iv: row.iv,
            tag: row.tag,
          });
          masked = maskSecretValue(decrypted);
        } catch {
          // Fallback
        }

        return {
          key: row.key,
          exists: true,
          maskedPreview: masked,
          updatedAt: row.updatedAt.toISOString(),
        };
      });
    } catch (err) {
      logger.warn("Failed to list secret metadata from DB", {
        module: "secrets",
        metadata: { error: String(err) },
      });
    }

    // Return in-memory entries matching prefix
    const list: SecretMetadata[] = [];
    this.memoryCache.forEach((val, k) => {
      if (!prefix || k.startsWith(prefix)) {
        list.push({
          key: k,
          exists: true,
          maskedPreview: val.masked,
          updatedAt: val.updatedAt,
        });
      }
    });
    return list;
  }

  /**
   * Deletes a secret from storage.
   */
  async deleteSecret(key: string, adminUserId: string): Promise<boolean> {
    const trimmedKey = key.trim();
    try {
      await db.delete(secretReferences).where(eq(secretReferences.key, trimmedKey));
      try {
        await db.insert(auditEvents).values({
          userId: adminUserId,
          action: "secret_deleted",
          entityType: "secret_reference",
          entityId: trimmedKey,
          newState: { deleted: true },
        });
      } catch {
        // Audit error handled gracefully
      }
      this.memoryCache.delete(trimmedKey);
      return true;
    } catch (err) {
      logger.error("Failed to delete secret from database", {
        module: "secrets",
        metadata: { key: trimmedKey, error: String(err) },
      });
      this.memoryCache.delete(trimmedKey);
      return true;
    }
  }
}

export const secretsService = new SecretsService();
