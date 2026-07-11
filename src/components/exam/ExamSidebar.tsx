import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState, type ReactNode } from 'react';

interface ExamSidebarProps {
  children: ReactNode;
}

export const ExamSidebar = ({ children }: ExamSidebarProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label={t('examUi.openNavigation')}
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 80, right: 16, bgcolor: 'background.paper', boxShadow: 3, zIndex: 1099 }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
          <Box sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction="row" sx={{ mb: 1, alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('examUi.navigation')}
              </Typography>
              <IconButton onClick={() => setOpen(false)} aria-label={t('examUi.closeNavigation')}>
                <CloseIcon />
              </IconButton>
            </Stack>
            {children}
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      component="aside"
      sx={{
        width: 320,
        minWidth: 320,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        pr: 1,
      }}
    >
      {children}
    </Box>
  );
};
