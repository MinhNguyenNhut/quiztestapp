import { useTranslation } from 'react-i18next';
import { Box, Grid, Card, CardContent, Stack, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';

const features = [
  {
    icon: <QuizIcon />,
    title: 'landing.features.multipleTypes.title',
    description: 'landing.features.multipleTypes.description',
  },
  {
    icon: <TimerIcon />,
    title: 'landing.features.flexibleTiming.title',
    description: 'landing.features.flexibleTiming.description',
  },
  {
    icon: <AssessmentIcon />,
    title: 'landing.features.instantScoring.title',
    description: 'landing.features.instantScoring.description',
  },
  {
    icon: <DashboardIcon />,
    title: 'landing.features.submissionsDashboard.title',
    description: 'landing.features.submissionsDashboard.description',
  },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id="features"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 3 },
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Section header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            color="primary"
            sx={{ fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
          >
            {t('landing.features.label')}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            {t('landing.features.title')}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            {t('landing.features.subtitle')}
          </Typography>
        </Box>

        {/* Features grid */}
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Box
                      sx={(theme) => ({
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        color: theme.palette.primary.contrastText,
                      })}
                    >
                      {feature.icon}
                    </Box>
                    <Stack spacing={1} sx={{ width: '100%' }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                        {t(feature.title)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {t(feature.description)}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}