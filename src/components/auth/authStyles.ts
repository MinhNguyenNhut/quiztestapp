
import type { SxProps, Theme } from '@mui/material';

const BRAND_GRADIENT =
  'linear-gradient(150deg, #4F46E5 0%, #7C3AED 55%, #A855F7 100%)';

export const authFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: 'background.paper',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.14)',
    },
  },
};

export const authPanelSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 4,
  p: { xs: 3, sm: 4.5 },
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
};

export const gradientButtonSx: SxProps<Theme> = {
  height: 52,
  borderRadius: 3,
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  background: BRAND_GRADIENT,
  boxShadow: '0 10px 24px rgba(99, 102, 241, 0.35)',
  transition: 'all 0.25s ease',
  '&:hover': {
    background:
      'linear-gradient(150deg, #4338CA 0%, #6D28D9 55%, #9333EA 100%)',
    boxShadow: '0 14px 30px rgba(99, 102, 241, 0.45)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
};
