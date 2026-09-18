import { type Theme, THEME_COOKIE_NAME, THEME_COOKIE_MAX_AGE, isTheme } from "../domain/theme";

/**
 * Extracts and validates the theme from a raw Cookie header string.
 */
export function getThemeFromCookie(cookieHeader?: string | null): Theme {
  if (!cookieHeader) {
    return "system";
  }

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${THEME_COOKIE_NAME}=`));

  if (!match) {
    return "system";
  }

  const rawValue = match.split("=")[1];
  if (rawValue && isTheme(rawValue)) {
    return rawValue;
  }

  return "system";
}

/**
 * Generates a Set-Cookie string for persisting theme selection.
 */
export function serializeThemeCookie(theme: Theme): string {
  return `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}
