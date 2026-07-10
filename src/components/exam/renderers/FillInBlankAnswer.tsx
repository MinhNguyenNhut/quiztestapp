import { Box, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../features/store';
import { getExamSession, setAnswer } from '../../../features/exam/examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

export const FillInBlankAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const blanks = question.blanks ?? [];
  const values: Record<string, string> =
    answer?.type === 'fill_in_blank' ? answer.values : {};

  const update = (blankId: string, text: string) => {
    dispatch(
      setAnswer({
        questionId: question.id,
        value: { type: 'fill_in_blank', values: { ...values, [blankId]: text } },
      }),
    );
  };

  if (blanks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No blanks are configured for this question.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {blanks.map((blank, i) => (
        <Box
          key={blank.id}
          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              minWidth: 80,
            }}
          >
            {`Blank ${i + 1}`}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={values[blank.id] ?? ''}
            onChange={(e) => update(blank.id, e.target.value)}
            placeholder="Type your answer..."
          />
        </Box>
      ))}
    </Stack>
  );
};
