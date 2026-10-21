import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import SectionHeading from './SectionHeading';

const steps = ['step1', 'step2', 'step3'];

export default function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id="how-it-works"
      sx={{ scrollMarginTop: { xs: 56, sm: 64 }, py: { xs: 7, md: 11 }, px: { xs: 2, md: 3 }, bgcolor: 'background.default' }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <SectionHeading title={t('landing.howItWorks.title')} subtitle={t('landing.howItWorks.subtitle')} />

        {/* Numbers are right here: this really is a sequence */}
        <Stack component="ol" direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {steps.map((step, index) => (
            <Box
              component="li"
              key={step}
              sx={{
                flex: 1,
                position: 'relative',
                '&:not(:last-of-type)::after': {
                  content: '""',
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  top: 28,
                  left: 76,
                  right: 0,
                  borderTop: '2px dashed',
                  borderColor: 'divider',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mb: 3,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {index + 1}
              </Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {t(`landing.howItWorks.${step}.title`)}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 340 }}>
                {t(`landing.howItWorks.${step}.description`)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
