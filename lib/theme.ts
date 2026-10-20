'use client';

import { useState, useEffect, useCallback } from 'react';

export const THEME_KEY = 'theme';

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  try {
    const html = document.documentElement;
    // Add temporary transition class for smooth 250ms animation
    html.classList.add('theme-transition');
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent('blogflow-theme-change', { detail: theme }));

    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 350);
  } catch (e) {
    console.error('Failed to set theme', e);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getInitialTheme();
    setThemeState(initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<'light' | 'dark'>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      } else {
        setThemeState(getInitialTheme());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY) {
        const newTheme = e.newValue === 'dark' ? 'dark' : 'light';
        setThemeState(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('blogflow-theme-change', handleChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('blogflow-theme-change', handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setTheme(next);
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    mounted,
  };
}
