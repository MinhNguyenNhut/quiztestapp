import { Box, Checkbox, FormControl, FormControlLabel, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../quiz/store';
import { getExamSession, setAnswer } from '../examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

export const MultipleChoiceAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const selected: string[] = answer?.type === 'multiple_choice' ? answer.optionIds : [];

  const toggle = (optionId: string) => {
    const next = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    dispatch(setAnswer({ questionId: question.id, value: { type: 'multiple_choice', optionIds: next } }));
  };

  return (
    <FormControl component="fieldset" fullWidth>
      <Stack spacing={1}>
        {question.options.map((opt, i) => {
          const labelLetter = String.fromCharCode(65 + i);
          const checked = selected.includes(opt.id);
          return (
            <FormControlLabel
              key={opt.id}
              control={
                <Checkbox
                  checked={checked}
                  onChange={() => toggle(opt.id)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: checked ? 'primary.main' : 'text.secondary',
                      minWidth: 22,
                    }}
                  >
                    {labelLetter}.
                  </Typography>
                  <Typography>{opt.text}</Typography>
                </Box>
              }
              sx={{
                border: '1px solid',
                borderColor: checked ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                m: 0,
                px: 1.5,
                py: 0.5,
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                backgroundColor: checked ? 'rgba(99,102,241,0.06)' : 'background.paper',
                '&:hover': { backgroundColor: 'rgba(99,102,241,0.04)' },
              }}
            />
          );
        })}
      </Stack>
    </FormControl>
  );
};
