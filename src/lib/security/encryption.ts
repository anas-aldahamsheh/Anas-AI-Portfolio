import crypto from "node:crypto";
import { validateEnv } from "@/lib/config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // 96-bit IV recommended for GCM

export interface EncryptedPayload {
  encryptedValue: string; // hex
  iv: string; // hex
  tag: string; // hex
}

/**
 * Derives the 32-byte master encryption key from the environment.
 */
function getMasterKeyBuffer(): Buffer {
  const env = validateEnv();
  const hexKey = env.ENCRYPTION_MASTER_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("ENCRYPTION_MASTER_KEY must be a valid 64-character hex string (32 bytes)");
  }
  return Buffer.from(hexKey, "hex");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 */
export function encryptString(plaintext: string, overrideKey?: Buffer): EncryptedPayload {
  const key = overrideKey ?? getMasterKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encryptedBuffer = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  const tag = cipher.getAuthTag();

  return {
    encryptedValue: encryptedBuffer.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload back to plaintext.
 * Throws an error if ciphertext or auth tag is invalid or tampered with.
 */
export function decryptString(payload: EncryptedPayload, overrideKey?: Buffer): string {
  const key = overrideKey ?? getMasterKeyBuffer();
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");
  const encryptedBuffer = Buffer.from(payload.encryptedValue, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

  return decryptedBuffer.toString("utf8");
}

/**
 * Creates a display-safe masked fingerprint of a secret string.
 * Example: "sk-proj-1234567890abcdef" -> "sk-...cdef"
 */
export function maskSecretValue(secret: string): string {
  if (!secret) return "";
  if (secret.length <= 8) return "********";

  const prefix = secret.slice(0, 3);
  const suffix = secret.slice(-4);
  return `${prefix}...${suffix}`;
}
