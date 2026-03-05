'use client';

import { ThemeProvider } from './theme.provider';
import { ThemeSwitcher } from './theme.switcher';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="default" storageKey="app-theme">
      <ThemeSwitcher />
      {children}
    </ThemeProvider>
  );
}
