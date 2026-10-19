import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimerIcon from '@mui/icons-material/Timer';
import { useAppSelector } from '../../features/store.ts';
import { getIsAuthenticated } from '../../features/auth/authSlice.ts';

export default function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(getIsAuthenticated);

  const scrollToQuizzes = () => {
    document.getElementById('quizzes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrimaryCta = () => navigate(isAuthenticated ? '/quiz/new' : '/login');

  return (
    <Box
      component="section"
      sx={(theme) => ({
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 3 },
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(
          theme.palette.primary.main,
          0.12
        )} 100%)`,
        borderBottom: 1,
        borderColor: 'divider',
      })}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Decorative illustration: only the background is translucent, the icon stays solid */}
        <Box
          aria-hidden
          sx={(theme) => ({
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: 120, md: 160 },
            height: { xs: 120, md: 160 },
            mx: 'auto',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.18
            )} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`,
          })}
        >
          <QuizIcon sx={{ fontSize: { xs: 48, md: 64 }, color: 'primary.main' }} />
        </Box>

        {/* Headline (gradient text with a solid-colour fallback) */}
        <Typography
          variant="h2"
          component="h1"
          sx={(theme) => ({
            fontWeight: 800,
            mb: 3,
            lineHeight: 1.2,
            color: 'primary.main',
            '@supports ((-webkit-background-clip: text) or (background-clip: text))': {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            },
          })}
        >
          {t('landing.hero.title')}
        </Typography>

        {/* Description */}
        <Typography
          variant="h5"
          component="p"
          color="text.secondary"
          sx={{ mb: 5, fontWeight: 400, lineHeight: 1.6, maxWidth: 700, mx: 'auto' }}
        >
          {t('landing.hero.description')}
        </Typography>

        {/* CTA buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={isAuthenticated ? <AddIcon /> : <PlayArrowIcon />}
            onClick={handlePrimaryCta}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 4,
            }}
          >
            {isAuthenticated
              ? t('landing.hero.ctaCreateQuiz')
              : t('landing.hero.ctaLoginToCreate')}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<SearchIcon />}
            onClick={scrollToQuizzes}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {t('landing.hero.ctaBrowse')}
          </Button>
        </Stack>

        {/* Highlights */}
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 3, md: 6 },
            flexWrap: 'wrap',
          }}
        >
          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
            <AssessmentIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography variant="body2" color="text.secondary">
              {t('landing.hero.instantScoring')}
            </Typography>
          </Stack>
          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
            <QuizIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography variant="body2" color="text.secondary">
              {t('landing.hero.multipleTypes')}
            </Typography>
          </Stack>
          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
            <TimerIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography variant="body2" color="text.secondary">
              {t('landing.hero.flexibleTiming')}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}