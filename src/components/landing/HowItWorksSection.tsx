import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import AssessmentIcon from '@mui/icons-material/Assessment';

const steps = [
  {
    icon: <AddIcon />,
    title: 'landing.howItWorks.step1.title',
    description: 'landing.howItWorks.step1.description',
  },
  {
    icon: <ShareIcon />,
    title: 'landing.howItWorks.step2.title',
    description: 'landing.howItWorks.step2.description',
  },
  {
    icon: <AssessmentIcon />,
    title: 'landing.howItWorks.step3.title',
    description: 'landing.howItWorks.step3.description',
  },
];

export default function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id="how-it-works"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 3 },
        backgroundColor: 'background.default',
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
            {t('landing.howItWorks.label')}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            {t('landing.howItWorks.title')}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            {t('landing.howItWorks.subtitle')}
          </Typography>
        </Box>

        {/* Steps */}
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {steps.map((step, index) => (
            <Grid key={step.title} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={(theme) => ({
                    mb: 3,
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: theme.palette.primary.contrastText,
                    '& svg': { fontSize: 28 },
                  })}
                >
                  {step.icon}
                </Box>

                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 700, lineHeight: 1.5 }}
                >
                  {index + 1}
                </Typography>

                <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {t(step.title)}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7, flex: 1 }}
                >
                  {t(step.description)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}