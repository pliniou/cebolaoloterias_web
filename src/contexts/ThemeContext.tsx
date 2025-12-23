import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cebolao-theme") as Theme;
      if (stored && ["light", "dark"].includes(stored)) {
        return stored;
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Add transitioning class for smooth theme change
    root.classList.add("transitioning");
    
    // Remove all theme classes
    root.classList.remove("light", "dark");
    
    // Add new theme class
    root.classList.add(theme);
    
    // Store preference
    localStorage.setItem("cebolao-theme", theme);
    
    // Remove transitioning class after animation
    const timeout = setTimeout(() => {
      root.classList.remove("transitioning");
    }, 350);
    
    return () => clearTimeout(timeout);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
