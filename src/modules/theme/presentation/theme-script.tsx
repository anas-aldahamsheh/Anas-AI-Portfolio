import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "../domain/theme";

/**
 * Blocking inline script injected into head before interactive hydration.
 * Evaluates cookie and localStorage, applying .dark class synchronously to prevent FOUC.
 */
export function ThemeScript() {
  const code = `
    (function() {
      try {
        var cookieMatch = document.cookie.match(/(^|; )${THEME_COOKIE_NAME}=([^;]+)/);
        var theme = cookieMatch ? cookieMatch[2] : null;
        if (!theme) {
          theme = localStorage.getItem('${THEME_STORAGE_KEY}');
        }
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = theme === 'dark' || ((!theme || theme === 'system') && prefersDark);
        var root = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
