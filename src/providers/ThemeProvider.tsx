import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {
      console.error("Can not get saved Theme: ", e);
    }
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Can not set Theme from Local Storage: ", e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      const html = document.documentElement;
      html.setAttribute("data-theme", theme);
      if (theme === "dark") html.classList.add("dark");
      else html.classList.remove("dark");

      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Can not set Theme from Local Storage: ", e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return;

      if (typeof window === "undefined" || !window.matchMedia) return;

      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) =>
        setTheme(e.matches ? "dark" : "light");

      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }
    } catch (e) {
      console.log("Add Event Listener/Remove Event Listener Fail: ", e);
    }
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
