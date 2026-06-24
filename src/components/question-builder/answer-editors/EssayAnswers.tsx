import { TextField, Typography, Card, CardContent, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
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

export default function EssayAnswers({ watch, setValue, index }: Props) {
  const scoringGuide = watch(`questions.${index}.scoringGuide`);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Essay Configuration
        </Typography>
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
          Essay questions require manual grading. Provide a scoring guide and rubric to assist graders.
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Scoring Guide"
          placeholder="Describe how to score this essay question. Include criteria for full credit, partial credit, etc."
          value={scoringGuide || ''}
          onChange={(e) =>
            setValue(`questions.${index}.scoringGuide`, e.target.value, {
              shouldValidate: false,
            })
          }
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary">
          Tip: Include specific criteria such as thesis quality, evidence use, organization, and grammar.
        </Typography>
      </CardContent>
    </Card>
  );
}
