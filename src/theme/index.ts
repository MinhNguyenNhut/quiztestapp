import { createTheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';
export type ThemePaletteName = 'indigo' | 'blue' | 'teal' | 'violet' | 'rose' | 'amber';

export const themePalettes: Record<
  ThemePaletteName,
  { light: string; dark: string; secondary: string }
> = {
  indigo: { light: '#4f46e5', dark: '#a5b4fc', secondary: '#ec4899' },
  blue: { light: '#1565c0', dark: '#90caf9', secondary: '#26a69a' },
  teal: { light: '#00796b', dark: '#80cbc4', secondary: '#5c6bc0' },
  violet: { light: '#7b1fa2', dark: '#ce93d8', secondary: '#26a69a' },
  rose: { light: '#c2185b', dark: '#f48fb1', secondary: '#5c6bc0' },
  amber: { light: '#b45309', dark: '#ffcc80', secondary: '#5c6bc0' },
};

export function createAppTheme(mode: ThemeMode, paletteName: ThemePaletteName) {
  const palette = themePalettes[paletteName];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? palette.dark : palette.light,
        contrastText: isDark ? '#111827' : '#fff',
      },
      secondary: {
        main: palette.secondary,
      },
      background: {
        default: isDark ? '#111827' : '#f5f7fb',
        paper: isDark ? '#1f2937' : '#ffffff',
      },
      divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
    },
    typography: {
      fontFamily: [
        'system-ui',
        '-apple-system',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            backgroundColor: theme.palette.background.default,
            transition: 'background-color 160ms ease, color 160ms ease',
          },
          '*': {
            scrollbarColor: `${theme.palette.divider} transparent`,
            scrollbarWidth: 'thin',
          },
          '*::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: 999,
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.action.disabled,
            backgroundClip: 'content-box',
          },
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 1px 3px rgb(0 0 0 / 0.24)'
              : '0 1px 3px rgb(15 23 42 / 0.08)',
          },
        },
      },
    },
  });
}
