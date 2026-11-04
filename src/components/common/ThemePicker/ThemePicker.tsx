import { useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CheckIcon from '@mui/icons-material/Check';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useTranslation } from 'react-i18next';
import { themePalettes, type ThemePaletteName } from '../../../theme';
import { useThemePreferences } from '../../../theme/ThemePreferencesContext';

const paletteNames: ThemePaletteName[] = ['indigo', 'blue', 'teal', 'violet', 'rose', 'amber'];

export default function ThemePicker() {
  const { t } = useTranslation();
  const { mode, palette, setMode, setPalette } = useThemePreferences();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title={t('appearance.title')}>
        <IconButton
          color="inherit"
          aria-label={t('appearance.title')}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <PaletteOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 250, p: 0.5 } } }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ px: 2, pt: 1 }}>
          {t('appearance.mode')}
        </Typography>
        <MenuItem
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          aria-label={mode === 'light' ? t('appearance.enableDark') : t('appearance.enableLight')}
        >
          <ListItemIcon>
            {mode === 'light'
              ? <LightModeOutlinedIcon fontSize="small" />
              : <DarkModeOutlinedIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText
            primary={mode === 'light' ? t('appearance.light') : t('appearance.dark')}
          />
          <Switch
            edge="end"
            checked={mode === 'dark'}
            onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
            onClick={(event) => event.stopPropagation()}
            slotProps={{
              input: {
                'aria-label': mode === 'light' ? t('appearance.enableDark') : t('appearance.enableLight'),
              },
            }}
          />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <Typography variant="overline" color="text.secondary" sx={{ px: 2, pt: 0.5 }}>
          {t('appearance.accent')}
        </Typography>
        {paletteNames.map((name) => (
          <MenuItem
            key={name}
            selected={palette === name}
            onClick={() => setPalette(name)}
            role="menuitemradio"
            aria-checked={palette === name}
          >
            <ListItemIcon>
              <Box
                aria-hidden="true"
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: mode === 'dark' ? themePalettes[name].dark : themePalettes[name].light,
                }}
              />
            </ListItemIcon>
            <ListItemText primary={t(`appearance.colors.${name}`)} />
            {palette === name && <CheckIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
