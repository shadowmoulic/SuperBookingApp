import { createContext, useState, useEffect } from "react";
import { designTokens } from "../styles/designTokens";

const ThemeContext = createContext();

export default ThemeContext;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const applyTheme = (themeMode) => {
    const themeName = themeMode === "dark" ? "mintGoldDark" : "mintGoldLight";
    const tokens = designTokens[themeName];
    if (!tokens) return;

    const root = document.documentElement;

    // Apply all color tokens as CSS variables
    Object.entries(tokens.colors).forEach(([key, value]) => {
      const cssKey = `--md-sys-color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssKey, value);
    });

    // Toggle a standard "dark" class on the <html> tag for Tailwind classes if needed
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
