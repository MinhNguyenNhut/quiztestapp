import { Box, TextField, Typography, Card, CardContent, FormControlLabel, Switch } from '@mui/material';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

export default function ShortAnswerAnswers({ watch, setValue, index }: Props) {
  const expectedAnswer = watch(`questions.${index}.expectedAnswer`);
  const caseSensitive = watch(`questions.${index}.caseSensitive`);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Short Answer Configuration
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Expected Answer"
          placeholder="Enter the expected correct answer"
          value={expectedAnswer || ''}
          onChange={(e) =>
            setValue(`questions.${index}.expectedAnswer`, e.target.value, {
              shouldValidate: true,
            })
          }
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={caseSensitive || false}
              onChange={(e) =>
                setValue(`questions.${index}.caseSensitive`, e.target.checked, {
                  shouldValidate: false,
                })
              }
            />
          }
          label="Case sensitive matching"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          When enabled, student answers must match the expected answer exactly including capitalization.
        </Typography>
      </CardContent>
    </Card>
  );
}
