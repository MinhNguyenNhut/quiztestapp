import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { FlagEN, FlagVN } from './Flags';

interface Language {
  code: string;
  name: string;
  flag: ReactNode;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: <FlagEN /> },
  { code: 'vi', name: 'Tiếng Việt', flag: <FlagVN /> },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 'en-US' / 'vi-VN' should still match 'en' / 'vi'
  const activeCode = (i18n.resolvedLanguage ?? i18n.language ?? 'en').split('-')[0];
  const currentLang = languages.find((l) => l.code === activeCode) ?? languages[0];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLanguageChange = (langCode: string) => {
    void i18n.changeLanguage(langCode);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ color: 'inherit', textTransform: 'none', fontWeight: 500 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentLang.flag}
          <span>{currentLang.name}</span>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === currentLang.code}
          >
            <ListItemIcon>{lang.flag}</ListItemIcon>
            <ListItemText primary={lang.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
