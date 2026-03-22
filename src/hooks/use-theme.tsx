import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContext {
  theme: Theme;
  toggleTheme: () => void;
  forceLight: () => void;
  restoreTheme: () => void;
}

const ThemeCtx = createContext<ThemeContext>({ theme: "light", toggleTheme: () => {}, forceLight: () => {}, restoreTheme: () => {} });

const STORAGE_KEY = "politiu_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [forced, setForced] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", !forced && theme === "dark");
  }, [theme, forced]);

  useEffect(() => {
    if (!forced) localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, forced]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const forceLight = useCallback(() => setForced(true), []);
  const restoreTheme = useCallback(() => setForced(false), []);

  return <ThemeCtx.Provider value={{ theme, toggleTheme, forceLight, restoreTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
