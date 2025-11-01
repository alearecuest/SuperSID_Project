import { useState, useEffect, useCallback } from 'react';
import { preferencesStorage } from '../utils/storage';
import { logger } from '../utils/logger';

type Theme = 'dark' | 'light' | 'auto';

export const useTheme = (initialTheme?: Theme) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (initialTheme) return initialTheme;
    const prefs = preferencesStorage.getPreferences();
    return prefs.theme;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  });

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      preferencesStorage.setPreferences({ theme: newTheme });
      logger.debug(`Theme changed to ${newTheme}`);

      if (newTheme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        setIsDarkMode(prefersDark);
      } else {
        document.documentElement.setAttribute('data-theme', newTheme);
        setIsDarkMode(newTheme === 'dark');
      }
    } catch (error) {
      logger.error('Failed to set theme', error as Error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      logger.debug(`System theme changed to ${e.matches ? 'dark' : 'light'}`);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
  };
};

export default useTheme;