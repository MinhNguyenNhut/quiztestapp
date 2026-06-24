import { Box, Typography, Radio, FormControlLabel, Card, CardContent, FormControl, RadioGroup } from '@mui/material';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { useCallback } from 'react';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

export default function TrueFalseAnswers({ watch, setValue, index }: Props) {
  const currentValue = watch(`questions.${index}.options.0.isCorrect`);

  const handleChange = useCallback(
    (value: string) => {
      const isTrue = value === 'true';
      setValue(`questions.${index}.options`, [
        { text: 'True', isCorrect: isTrue, order: 0 },
        { text: 'False', isCorrect: !isTrue, order: 1 },
      ], { shouldValidate: true });
    },
    [setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Select the correct answer
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''}
            onChange={(e) => handleChange(e.target.value)}
          >
            <FormControlLabel value="true" control={<Radio />} label="True" />
            <FormControlLabel value="false" control={<Radio />} label="False" />
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
}
