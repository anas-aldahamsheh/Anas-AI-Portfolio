export interface SsrfValidationResult {
  isValid: boolean;
  sanitizedUrl?: string | undefined;
  error?: string | undefined;
}

const FORBIDDEN_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "169.254.169.254",
  "metadata.google.internal",
  "instance-data",
]);

/**
 * Validates an outbound URL to defend against Server-Side Request Forgery (SSRF)
 * per docs/security/03_SECRETS_AND_PROVIDER_ENDPOINTS.md.
 */
export function validateOutboundUrl(
  rawUrl: string,
  options: {
    allowHttp?: boolean | undefined;
    allowLocalhost?: boolean | undefined;
    isProduction?: boolean | undefined;
  } = {},
): SsrfValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "URL must be a non-empty string" };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isValid: false, error: "Malformed URL syntax" };
  }

  const isProd = options.isProduction ?? process.env.NODE_ENV === "production";
  const allowHttp = options.allowHttp ?? (!isProd || options.allowLocalhost);

  // Scheme verification
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return {
      isValid: false,
      error: `Unsupported protocol '${parsed.protocol}'. Only HTTP(S) is permitted.`,
    };
  }

  if (isProd && !allowHttp && parsed.protocol !== "https:") {
    return {
      isValid: false,
      error: "HTTPS is strictly required for external outbound endpoints in production.",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const normalizedHostname = hostname.replace(/^\[|\]$/g, "");

  // Check forbidden hostnames
  if (
    (FORBIDDEN_HOSTNAMES.has(hostname) || FORBIDDEN_HOSTNAMES.has(normalizedHostname)) &&
    !options.allowLocalhost
  ) {
    return {
      isValid: false,
      error: `Destination '${hostname}' is blocked by SSRF defense policy.`,
    };
  }

  // Check link-local IP range (169.254.x.x)
  if (hostname.startsWith("169.254.")) {
    return {
      isValid: false,
      error: "Link-local cloud metadata endpoints are strictly blocked.",
    };
  }

  // Check private IP ranges in production
  if (isProd && !options.allowLocalhost) {
    // 10.x.x.x
    if (hostname.startsWith("10.")) {
      return { isValid: false, error: "Private network addressing is blocked in production." };
    }
    // 192.168.x.x
    if (hostname.startsWith("192.168.")) {
      return { isValid: false, error: "Private network addressing is blocked in production." };
    }
    // 172.16.x.x - 172.31.x.x
    const match172 = /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
    if (match172) {
      return { isValid: false, error: "Private network addressing is blocked in production." };
    }
  }

  // Port checks: prohibit standard sensitive ports
  const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
  const sensitivePorts = new Set([22, 25, 111, 2375, 2376, 5432, 6379, 9200, 27017]);
  if (sensitivePorts.has(port)) {
    return {
      isValid: false,
      error: `Port ${port} is prohibited by network defense policy.`,
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}
