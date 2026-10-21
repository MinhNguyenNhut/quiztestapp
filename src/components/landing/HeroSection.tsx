import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { alpha, Box, Button, ButtonBase, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuizIcon from '@mui/icons-material/Quiz';
import { useAppSelector } from '../../features/store.ts';
import { getIsAuthenticated } from '../../features/auth/authSlice.ts';

const CORRECT_INDEX = 1;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/** Interactive mini quiz: shows what the product feels like in 5 seconds. */
function QuizPreview() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isRight = selected === CORRECT_INDEX;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: '100%',
        maxWidth: 480,
        mx: 'auto',
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        boxShadow: `0 28px 64px ${alpha(theme.palette.primary.main, 0.2)}`,
      })}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {t('landing.hero.preview.progress', { current: 3, total: 10 })}
        </Typography>
        <Chip size="small" variant="outlined" icon={<TimerIcon />} label="00:42" />
      </Stack>
      <LinearProgress variant="determinate" value={30} sx={{ height: 6, borderRadius: 3, mb: 3 }} />

      <Typography variant="h6" component="p" sx={{ fontWeight: 700, mb: 2.5 }}>
        {t('landing.hero.preview.question')}
      </Typography>

      <Stack spacing={1.25} role="group" aria-label={t('landing.hero.preview.question')}>
        {OPTION_LETTERS.map((letter, i) => {
          const isCorrectOption = answered && i === CORRECT_INDEX;
          const isWrongPick = selected === i && i !== CORRECT_INDEX;
          return (
            <ButtonBase
              key={letter}
              disabled={answered}
              onClick={() => setSelected(i)}
              sx={(theme) => {
                const tone = isCorrectOption
                  ? theme.palette.success.main
                  : isWrongPick
                    ? theme.palette.error.main
                    : null;
                return {
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  border: 1.5,
                  borderStyle: 'solid',
                  textAlign: 'left',
                  borderColor: tone ?? theme.palette.divider,
                  bgcolor: tone ? alpha(tone, 0.1) : 'transparent',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease',
                  '&:hover': { borderColor: answered ? undefined : theme.palette.primary.main },
                  '&.Mui-disabled': { pointerEvents: 'none' },
                };
              }}
            >
              <Box
                sx={(theme) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                })}
              >
                {letter}
              </Box>
              <Typography sx={{ flex: 1, fontWeight: 500 }}>{t(`landing.hero.preview.option${i}`)}</Typography>
              {isCorrectOption && <CheckCircleIcon color="success" fontSize="small" />}
              {isWrongPick && <CancelIcon color="error" fontSize="small" />}
            </ButtonBase>
          );
        })}
      </Stack>

      <Stack
        direction="row"
        aria-live="polite"
        sx={{ mt: 2.5, minHeight: 36, justifyContent: 'space-between', alignItems: 'center' }}
      >
        {answered ? (
          <>
            <Typography sx={{ fontWeight: 700 }} color={isRight ? 'success.main' : 'error.main'}>
              {isRight ? t('landing.hero.preview.correct') : t('landing.hero.preview.incorrect')}
            </Typography>
            <Button size="small" onClick={() => setSelected(null)}>
              {t('landing.hero.preview.retry')}
            </Button>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('landing.hero.preview.hint')}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(getIsAuthenticated);

  const scrollToQuizzes = () => document.getElementById('quizzes')?.scrollIntoView({ behavior: 'smooth' });
  const handlePrimaryCta = () => navigate(isAuthenticated ? '/quiz/new' : '/login');

  const highlights = [
    { icon: <AssessmentIcon fontSize="small" />, label: t('landing.hero.instantScoring') },
    { icon: <QuizIcon fontSize="small" />, label: t('landing.hero.multipleTypes') },
    { icon: <TimerIcon fontSize="small" />, label: t('landing.hero.flexibleTiming') },
  ];

  return (
    <Box
      component="section"
      sx={(theme) => ({
        py: { xs: 6, md: 12 },
        px: { xs: 2, md: 3 },
        borderBottom: 1,
        borderColor: 'divider',
        background: `radial-gradient(900px 420px at 85% 0%, ${alpha(theme.palette.primary.main, 0.14)}, transparent 60%), ${theme.palette.background.default}`,
      })}
    >
      <Grid container spacing={{ xs: 6, md: 8 }} sx={{ maxWidth: 1200, mx: 'auto', alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, mb: 3, fontSize: { xs: '2.4rem', md: '3.5rem' } }}
          >
            {t('landing.hero.title')}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ fontWeight: 400, lineHeight: 1.7, mb: 4, maxWidth: 520 }}
          >
            {t('landing.hero.description')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
            <Button
              variant="contained"
              size="large"
              disableElevation
              startIcon={isAuthenticated ? <AddIcon /> : <PlayArrowIcon />}
              onClick={handlePrimaryCta}
              sx={{ px: 3.5, py: 1.4, fontWeight: 700, borderRadius: 999 }}
            >
              {isAuthenticated ? t('landing.hero.ctaCreateQuiz') : t('landing.hero.ctaLoginToCreate')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SearchIcon />}
              onClick={scrollToQuizzes}
              sx={{ px: 3.5, py: 1.4, fontWeight: 700, borderRadius: 999 }}
            >
              {t('landing.hero.ctaBrowse')}
            </Button>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 1 }}>
            {highlights.map((h) => (
              <Stack key={h.label} direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', color: 'primary.main' }}>{h.icon}</Box>
                <Typography variant="body2">{h.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <QuizPreview />
        </Grid>
      </Grid>
    </Box>
  );
}
