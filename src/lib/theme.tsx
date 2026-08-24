import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "tn-theme";

type Ctx = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx>({
  theme: "system",
  resolved: "light",
  setTheme: () => {},
  toggle: () => {},
});

function apply(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  // Sync embedded labs (iframes) with the current theme.
  document.querySelectorAll("iframe").forEach((f) => {
    try {
      f.contentWindow?.postMessage({ type: "tn-theme", theme: resolved }, "*");
    } catch {
      /* cross-origin iframes are ignored */
    }
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark mode temporarily disabled — the app is locked to light theme.
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    apply("light");
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      theme: "light" as Theme,
      resolved: "light" as const,
      setTheme: () => {},
      toggle: () => {},
    }),
    [],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Inline script that keeps the document in light mode before first paint. */
export const themeInitScript = `(function(){try{localStorage.removeItem('${STORAGE_KEY}');document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}catch(e){}})();`;

