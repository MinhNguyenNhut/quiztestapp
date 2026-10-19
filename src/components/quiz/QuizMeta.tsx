import { useTranslation } from 'react-i18next';
import { Stack, Chip, Typography } from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import StarIcon from '@mui/icons-material/Star';
import { isQuizUnlimitedTime } from '../../types/quiz';
import {
  aggregateDifficulty,
  formatRelativeTime,
} from '../../utils/quizDisplay.ts';
import {
  DIFFICULTY_COLORS,
  getDifficultyLabel,
  type Quiz,
} from '../../types/index.ts';

interface QuizMetaProps {
  quiz: Quiz;
  /** Show the "Updated X time ago" line */
  showUpdatedAt?: boolean;
  /** Additional className for the chip container */
  sx?: object;
}

export function QuizMeta({
  quiz,
  showUpdatedAt = true,
  sx,
}: QuizMetaProps) {
  const { t } = useTranslation();
  const questions = quiz.questions ?? [];
  const difficulty = aggregateDifficulty(questions);
  const minutes = quiz.estimatedTime ?? 0;
  const questionCount = quiz.questionCount ?? questions.length ?? 0;
  const unlimitedTime = isQuizUnlimitedTime(quiz);

  return (
    <Stack direction="column" spacing={1} sx={sx}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Chip
          size="small"
          icon={<QuizIcon />}
          label={t('quizList.questions', { count: questionCount })}
          variant="outlined"
        />
        {difficulty && (
          <Chip
            size="small"
            icon={<StarIcon />}
            label={getDifficultyLabel(difficulty, t)}
            sx={{
              bgcolor: DIFFICULTY_COLORS[difficulty],
              color: 'common.white',
              '& .MuiChip-icon': { color: 'common.white' },
            }}
          />
        )}
        <Chip
          size="small"
          icon={<TimerIcon />}
          label={unlimitedTime ? t('quizList.unlimitedTime') : t('quizList.minutes', { count: minutes })}
          variant="outlined"
          sx={unlimitedTime ? { bgcolor: 'success.light', color: 'success.dark', '& .MuiChip-icon': { color: 'success.dark' } } : {}}
        />
      </Stack>
      {showUpdatedAt && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <UpdateIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            {t('quizList.updated', { time: formatRelativeTime(quiz.updatedAt, t) })}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}