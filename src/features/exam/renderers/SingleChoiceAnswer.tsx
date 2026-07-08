import { FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../quiz/store';
import { getExamSession, setAnswer } from '../examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

export const SingleChoiceAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const selected = answer?.type === 'single_choice' ? answer.optionId : '';

  return (
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        value={selected}
        onChange={(e) =>
          dispatch(
            setAnswer({ questionId: question.id, value: { type: 'single_choice', optionId: e.target.value } }),
          )
        }
      >
        <Stack spacing={1}>
          {question.options.map((opt, i) => {
            const labelLetter = String.fromCharCode(65 + i);
            const checked = selected === opt.id;
            return (
              <FormControlLabel
                key={opt.id}
                value={opt.id}
                control={<Radio />}
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
      </RadioGroup>
    </FormControl>
  );
};
