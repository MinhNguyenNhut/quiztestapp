
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const authFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: 'background.paper',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused': {
      boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`,
    },
  },
};

export const authPanelSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 4,
  p: { xs: 3, sm: 4.5 },
  boxShadow: (theme) =>
    theme.palette.mode === 'dark'
      ? '0 20px 50px rgba(0, 0, 0, 0.28)'
      : '0 20px 50px rgba(15, 23, 42, 0.06)',
};

export const gradientButtonSx: SxProps<Theme> = {
  height: 52,
  borderRadius: 3,
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  background: (theme) =>
    `linear-gradient(150deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'primary.contrastText',
  boxShadow: (theme) => `0 10px 24px ${theme.palette.primary.main}55`,
  transition: 'all 0.25s ease',
  '&:hover': {
    background: (theme) =>
      `linear-gradient(150deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: (theme) => `0 14px 30px ${theme.palette.primary.main}66`,
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
};
