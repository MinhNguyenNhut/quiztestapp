import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
   const navigate = useNavigate();
   const { t } = useTranslation();

   return (
      <Box
         sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            px: 2,
         }}
      >
         <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
            <ErrorIcon color="primary" sx={{ fontSize: 90 }} />

            <Typography variant="h1" sx={{ fontWeight: 700, fontSize: { xs: 64, md: 96 } }}>
               404
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 600 }}>
               {t('notFound.title')}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
               {t('notFound.description')}
            </Typography>

            <Button
               variant="contained"
               size="large"
               startIcon={<HomeIcon />}
               onClick={() => navigate('/')}
            >
               {t('notFound.backToHome')}
            </Button>
         </Stack>
      </Box>
   );
}
