import { useTranslation } from 'react-i18next';
import { alpha, Box, Grid, Paper, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SectionHeading from './SectionHeading';

// Bento layout: widths alternate 7/5 and 5/7. The first tile is the single bold one.
const features = [
  { icon: <QuizIcon />, key: 'multipleTypes', md: 7 },
  { icon: <TimerIcon />, key: 'flexibleTiming', md: 5 },
  { icon: <AssessmentIcon />, key: 'instantScoring', md: 5 },
  { icon: <DashboardIcon />, key: 'submissionsDashboard', md: 7 },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id="features"
      sx={{ scrollMarginTop: { xs: 56, sm: 64 }, py: { xs: 7, md: 11 }, px: { xs: 2, md: 3 }, bgcolor: 'background.paper' }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <SectionHeading title={t('landing.features.title')} subtitle={t('landing.features.subtitle')} />

        <Grid container spacing={2.5}>
          {features.map((f, i) => {
            const highlight = i === 0;
            return (
              <Grid key={f.key} size={{ xs: 12, md: f.md }}>
                <Paper
                  elevation={0}
                  variant={highlight ? undefined : 'outlined'}
                  sx={(theme) => ({
                    height: '100%',
                    minHeight: 220,
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: highlight ? 'primary.main' : 'background.default',
                    color: highlight ? theme.palette.primary.contrastText : 'text.primary',
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      width: 48,
                      height: 48,
                      mb: 4,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: highlight
                        ? alpha(theme.palette.primary.contrastText, 0.18)
                        : alpha(theme.palette.primary.main, 0.1),
                      color: highlight ? 'inherit' : 'primary.main',
                    })}
                  >
                    {f.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {t(`landing.features.${f.key}.title`)}
                    </Typography>
                    <Typography sx={{ lineHeight: 1.7, maxWidth: 460, opacity: highlight ? 0.9 : 1 }} color={highlight ? 'inherit' : 'text.secondary'}>
                      {t(`landing.features.${f.key}.description`)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
