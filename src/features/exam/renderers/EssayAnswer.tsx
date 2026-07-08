import { Box, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../quiz/store';
import { getExamSession, setAnswer } from '../examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

const MAX = 5000;

export const EssayAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
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
        placeholder="Write your essay here..."
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Essays are graded manually after submission.
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
