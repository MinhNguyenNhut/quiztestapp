import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { useAppSelector } from '../../features/store.ts';
import { getIsAuthenticated } from '../../features/auth/authSlice.ts';

export default function CtaBanner() {
   const { t } = useTranslation();
   const navigate = useNavigate();
   const isAuthenticated = useAppSelector(getIsAuthenticated);

   return (
      <Box component="section" sx={{ py: { xs: 7, md: 10 }, px: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
         <Box
            sx={(theme) => ({
               maxWidth: 1200,
               mx: 'auto',
               px: { xs: 3, md: 8 },
               py: { xs: 6, md: 8 },
               borderRadius: 5,
               textAlign: 'center',
               color: theme.palette.primary.contrastText,
               background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`,
            })}
         >
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 2, fontSize: { xs: '1.85rem', md: '2.5rem' } }}>
               {t('landing.cta.title')}
            </Typography>
            <Typography sx={{ mb: 4, maxWidth: 520, mx: 'auto', opacity: 0.92, lineHeight: 1.7 }}>
               {t('landing.cta.description')}
            </Typography>
            <Button
               size="large"
               disableElevation
               onClick={() => navigate(isAuthenticated ? '/quiz/new' : '/login')}
               sx={{
                  px: 4,
                  py: 1.4,
                  fontWeight: 700,
                  borderRadius: 999,
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'background.paper', opacity: 0.92 },
               }}
            >
               {isAuthenticated ? t('landing.hero.ctaCreateQuiz') : t('landing.cta.button')}
            </Button>
         </Box>
      </Box>
   );
}
