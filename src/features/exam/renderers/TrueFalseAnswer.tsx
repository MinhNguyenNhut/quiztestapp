import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppDispatch, useAppSelector } from '../../quiz/store';
import { getExamSession, setAnswer } from '../examSlice';
import type { Question } from '../../../types/quiz';

interface Props {
  question: Question;
}

export const TrueFalseAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const selected = answer?.type === 'true_false' ? answer.value : null;

  return (
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        value={selected === null ? '' : String(selected)}
        onChange={(e) =>
          dispatch(
            setAnswer({
              questionId: question.id,
              value: { type: 'true_false', value: e.target.value === 'true' },
            }),
          )
        }
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          {[true, false].map((value) => {
            const checked = selected === value;
            return (
              <FormControlLabel
                key={String(value)}
                value={String(value)}
                control={<Radio />}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    {value ? (
                      <CheckCircleIcon fontSize="small" color={checked ? 'success' : 'action'} />
                    ) : (
                      <CancelIcon fontSize="small" color={checked ? 'error' : 'action'} />
                    )}
                    <Typography sx={{ fontWeight: 600 }}>{value ? 'True' : 'False'}</Typography>
                  </Stack>
                }
                sx={{
                  flex: 1,
                  border: '1px solid',
                  borderColor: checked ? (value ? 'success.main' : 'error.main') : 'divider',
                  borderRadius: 2,
                  m: 0,
                  px: 2,
                  py: 1.5,
                  backgroundColor: checked ? (value ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)') : 'background.paper',
                }}
              />
            );
          })}
        </Stack>
      </RadioGroup>
      {question.options.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {/* Visible hint for candidates — exposes the source-of-truth options if the
                author labeled them differently. */}
            Reference: {question.options.map((o) => o.text).join(' / ')}
          </Typography>
        </Box>
      )}
    </FormControl>
  );
};
