'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'default' | 'dark' | 'reading';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  storageKey = 'app-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey);
      
      // Validate stored theme
      if (storedTheme && ['default', 'dark', 'reading'].includes(storedTheme)) {
        setThemeState(storedTheme as Theme);
      }
    } catch (error) {
      // localStorage unavailable (e.g., private browsing, disabled)
      console.warn('localStorage unavailable, using default theme');
    }
    
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document root and persist to localStorage
  useEffect(() => {
    if (!mounted) return;

    try {
      // Apply theme to document root
      document.documentElement.setAttribute('data-theme', theme);
      
      // Persist to localStorage
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // localStorage unavailable
      console.warn('Failed to persist theme to localStorage');
    }
  }, [theme, storageKey, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
