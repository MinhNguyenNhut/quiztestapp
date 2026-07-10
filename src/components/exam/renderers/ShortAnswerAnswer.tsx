import { Box, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../features/store';
import { getExamSession, setAnswer } from '../../../features/exam/examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

const MAX = 500;

export const ShortAnswerAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const value = answer?.type === 'short_answer' ? answer.text : '';

  return (
    <Stack spacing={1}>
      <TextField
        multiline
        minRows={2}
        maxRows={6}
        fullWidth
        value={value}
        onChange={(e) =>
          dispatch(
            setAnswer({
              questionId: question.id,
              value: { type: 'short_answer', text: e.target.value.slice(0, MAX) },
            }),
          )
        }
        placeholder="Type a brief answer..."
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Short answer (a few sentences max).
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
