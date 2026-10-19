import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardActions, Stack, Typography, Button, Tooltip, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { QuizMeta } from '../quiz/QuizMeta';
import type { Quiz } from '../../types/index.ts';

interface PublicQuizCardProps {
  quiz: Quiz;
}

export function PublicQuizCard({ quiz }: PublicQuizCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
          {quiz.title || t('quizList.untitledQuiz')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {quiz.description || t('quizList.noDescription')}
        </Typography>

        <QuizMeta quiz={quiz} />
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            component={RouterLink}
            to={`/quiz/${quiz.id}/candidate`}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('quizList.start')}
          </Button>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.preview')}>
            <IconButton
              size="small"
              component={RouterLink}
              to={`/quiz/${quiz.id}/preview`}
              aria-label={t('quizList.ariaPreview', { title: quiz.title })}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
}