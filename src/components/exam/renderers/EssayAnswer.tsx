import { Box, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../features/store';
import { getExamSession, setAnswer } from '../../../features/exam/examSlice';
import type { Question } from '../../../types/quiz';
import { useTranslation } from 'react-i18next';

interface Props {
  question: Question;
}

const MAX = 5000;

export const EssayAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const value = answer?.type === 'essay' ? answer.text : '';

  return (
    <Stack spacing={1}>
      <TextField
        multiline
        minRows={6}
        maxRows={20}
        fullWidth
        value={value}
        onChange={(e) =>
          dispatch(
            setAnswer({
              questionId: question.id,
              value: { type: 'essay', text: e.target.value.slice(0, MAX) },
            }),
          )
        }
        placeholder={t("answer.essayPlaceholder")}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {t("answer.essayManualGrading")}
        </Typography>
        <Typography
          variant="caption"
          color={value.length >= MAX ? 'warning.main' : 'text.secondary'}
        >
          {value.length} / {MAX}
        </Typography>
      </Box>
    </Stack>
  );
};
