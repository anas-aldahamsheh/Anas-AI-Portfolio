const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "secret",
  "apikey",
  "api_key",
  "token",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "better_auth_secret",
  "encryption_master_key",
]);

const SENSITIVE_PATTERNS = [
  /(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi,
  /(Basic\s+)[A-Za-z0-9+/=]+/gi,
  /(sk-[a-zA-Z0-9_-]{8})[a-zA-Z0-9_-]+/g,
  /((?:api[_-]?key|secret|token|password)=)[^&\s]+/gi,
];

/**
 * Redacts sensitive tokens, API keys, passwords, and authorization headers
 * from plain text or JSON logs per docs/security/03_SECRETS_AND_PROVIDER_ENDPOINTS.md.
 */
export function redactSensitiveString(text: string): string {
  if (!text || typeof text !== "string") return text;

  let redacted = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, "$1[REDACTED]");
  }
  return redacted;
}

/**
 * Deeply clones and redacts sensitive keys from an object or array.
 */
export function redactSensitiveObject<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    if (typeof obj === "string") {
      return redactSensitiveString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveObject(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      result[key] = redactSensitiveString(value);
    } else if (value !== null && typeof value === "object") {
      result[key] = redactSensitiveObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
