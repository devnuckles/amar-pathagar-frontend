'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, BookOpen } from 'lucide-react';
import { useTheme, Theme } from './theme-provider';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show theme switcher ONLY when within hero section (approximately 600px)
      // Hide when scrolled past hero
      const heroSectionHeight = 600;
      setIsVisible(window.scrollY <= heroSectionHeight);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'default', icon: <Sun className="w-5 h-5" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-5 h-5" />, label: 'Dark' },
    { value: 'reading', icon: <BookOpen className="w-5 h-5" />, label: 'Reading' },
  ];

  return (
    <div
      className={`fixed top-[100px] right-6 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      } ${className}`}
      aria-hidden={!isVisible}
    >
      <div className="flex flex-row gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-lg p-2">
        {themes.map(({ value, icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex items-center justify-center w-11 h-11 rounded-md
              transition-all duration-200
              hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]
              focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2
              ${
                theme === value
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'
              }
            `}
            aria-label={`Switch to ${label} theme`}
            aria-pressed={theme === value}
            title={`${label} theme`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
