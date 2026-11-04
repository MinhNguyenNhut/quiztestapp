import { useEffect, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
  createAppTheme,
  type ThemeMode,
  type ThemePaletteName,
} from './index';
import {
  ThemePreferencesContext,
  type ThemePreferencesContextValue,
} from './ThemePreferencesContext';

interface ThemePreferences {
  mode: ThemeMode;
  palette: ThemePaletteName;
}

const STORAGE_KEY = 'quiztest-theme-preferences';
const defaultPreferences: ThemePreferences = { mode: 'light', palette: 'indigo' };

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

function isPaletteName(value: unknown): value is ThemePaletteName {
  return (
    value === 'indigo' ||
    value === 'blue' ||
    value === 'teal' ||
    value === 'violet' ||
    value === 'rose' ||
    value === 'amber'
  );
}

function loadPreferences(): ThemePreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;
    const value: unknown = JSON.parse(stored);
    if (typeof value !== 'object' || value === null) return defaultPreferences;
    const saved = value as { mode?: unknown; palette?: unknown };
    return {
      mode: isThemeMode(saved.mode) ? saved.mode : defaultPreferences.mode,
      palette: isPaletteName(saved.palette) ? saved.palette : defaultPreferences.palette,
    };
  } catch (error: unknown) {
    console.error('Could not read saved theme preferences.', error);
    return defaultPreferences;
  }
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const theme = useMemo(
    () => createAppTheme(preferences.mode, preferences.palette),
    [preferences.mode, preferences.palette],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error: unknown) {
      console.error('Could not save theme preferences.', error);
    }
  }, [preferences]);

  const value = useMemo<ThemePreferencesContextValue>(
    () => ({
      ...preferences,
      setMode: (mode) => setPreferences((current) => ({ ...current, mode })),
      setPalette: (palette) => setPreferences((current) => ({ ...current, palette })),
    }),
    [preferences],
  );

  return (
    <ThemePreferencesContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemePreferencesContext.Provider>
  );
}
