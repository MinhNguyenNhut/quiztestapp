import { createContext, useContext } from 'react';
import type { ThemeMode, ThemePaletteName } from './index';

export interface ThemePreferencesContextValue {
  mode: ThemeMode;
  palette: ThemePaletteName;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePaletteName) => void;
}

export const ThemePreferencesContext =
  createContext<ThemePreferencesContextValue | null>(null);

export function useThemePreferences() {
  const context = useContext(ThemePreferencesContext);
  if (!context) {
    throw new Error('useThemePreferences must be used within AppThemeProvider.');
  }
  return context;
}
