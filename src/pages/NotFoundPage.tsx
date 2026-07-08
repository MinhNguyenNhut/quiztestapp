import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
   const navigate = useNavigate();

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
            <ErrorIcon
               color="primary"
               sx={{ fontSize: 90 }}
            />

            <Typography
               variant="h1"
               sx={{
                  fontWeight: 700,
                  fontSize: { xs: 64, md: 96 },
               }}
            >
               404
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 600 }}>
               Page Not Found
            </Typography>

            <Typography
               variant="body1"
               color="text.secondary"
               sx={{ maxWidth: 500 }}
            >
               Sorry, the page you are looking for doesn't exist or has been
               moved.
            </Typography>

            <Button
               variant="contained"
               size="large"
               startIcon={<HomeIcon />}
               onClick={() => navigate('/')}
            >
               Back to Home
            </Button>
         </Stack>
      </Box>
   );
}
