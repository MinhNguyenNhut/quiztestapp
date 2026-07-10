import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../features/store';
import { getExamSession, setAnswer } from '../../../features/exam/examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

export const MatchingAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const pairs = question.matchingPairs ?? [];
  const values: Record<string, string> =
    answer?.type === 'matching' ? answer.pairs : {};

  const rightOptions = pairs.map((p) => p.right);

  const update = (leftId: string, rightId: string) => {
    dispatch(
      setAnswer({
        questionId: question.id,
        value: { type: 'matching', pairs: { ...values, [leftId]: rightId } },
      }),
    );
  };

  if (pairs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No pairs are configured for this question.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        Match each item on the left with the correct one on the right.
      </Typography>
      {pairs.map((pair, i) => (
        <Box
          key={pair.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            backgroundColor: values[pair.id] ? 'rgba(99,102,241,0.04)' : 'background.paper',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {i + 1}.
            </Typography>{' '}
            <Typography variant="body2" component="span">
              {pair.left || <em>(empty)</em>}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 18,
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' },
              textAlign: 'center',
            }}
            aria-hidden
          >
            ↔
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel id={`match-${pair.id}`}>Match with</InputLabel>
            <Select
              labelId={`match-${pair.id}`}
              label="Match with"
              value={values[pair.id] ?? ''}
              onChange={(e) => update(pair.id, e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Choose...</em>
              </MenuItem>
              {rightOptions.map((right) => (
                <MenuItem key={right} value={right}>
                  {right}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ))}
    </Stack>
  );
};
