import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, Stack } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

export default function LandingFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 3 },
        backgroundColor: 'background.default',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Brand */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
              <QuizIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('common.quizBuilder')}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              {t('landing.footer.tagline')}
            </Typography>
          </Box>

          {/* Links */}
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link component={RouterLink} to="/login" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {t('landing.login')}
            </Link>
            <Link component={RouterLink} to="/register" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {t('landing.register')}
            </Link>
          </Stack>

          {/* Copyright */}
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
            {t('landing.footer.copyright', { year: currentYear })}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}