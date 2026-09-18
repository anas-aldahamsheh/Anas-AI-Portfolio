export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export type ResolvedTheme = "light" | "dark";

export const THEME_COOKIE_NAME = "portfolio_theme";
export const THEME_STORAGE_KEY = "portfolio_theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

/**
 * Resolves effective theme ('light' or 'dark') taking into account system preference.
 */
export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return theme;
}
