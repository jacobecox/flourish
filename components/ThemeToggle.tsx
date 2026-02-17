"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faDesktop, faChevronDown } from "@fortawesome/free-solid-svg-icons";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get stored theme preference
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme("system");
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemPrefersDark);
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const getThemeIcon = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return faSun;
      case "dark":
        return faMoon;
      case "system":
        return faDesktop;
    }
  };

  const getThemeLabel = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
    }
  };

  const themes: Theme[] = ["light", "dark", "system"];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-secondary-hover text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        <FontAwesomeIcon icon={getThemeIcon(theme)} className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-card border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
          {themes.map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => handleThemeChange(themeOption)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                theme === themeOption
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <FontAwesomeIcon icon={getThemeIcon(themeOption)} className="w-4 h-4" />
              <span>{getThemeLabel(themeOption)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
