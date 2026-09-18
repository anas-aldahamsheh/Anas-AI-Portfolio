"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useSyncExternalStore,
} from "react";
import {
  type Theme,
  type ResolvedTheme,
  THEME_STORAGE_KEY,
  resolveTheme,
  isTheme,
} from "../domain/theme";
import { serializeThemeCookie } from "../infrastructure/theme-cookie";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribeMatchMedia(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSystemDarkSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getSystemDarkServerSnapshot(): boolean {
  return false;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && isTheme(stored)) return stored;
    }
    return initialTheme;
  });

  const systemPrefersDark = useSyncExternalStore(
    subscribeMatchMedia,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot,
  );

  const [, startTransition] = useTransition();

  const resolvedTheme: ResolvedTheme = resolveTheme(theme, systemPrefersDark);

  // Apply DOM classes on resolvedTheme change
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
          document.cookie = serializeThemeCookie(newTheme);
        } catch {}
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
