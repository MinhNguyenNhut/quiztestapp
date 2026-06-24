import { Box, Typography, Card, CardContent } from '@mui/material';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { RichTextEditor } from '../../common/RichTextEditor/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  index: number;
}

export default function ExplanationSection({ watch, setValue, index }: Props) {
  const explanation = watch(`questions.${index}.explanation`);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Explanation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Explain why the correct answer is right and optionally why incorrect answers are wrong
        </Typography>
        <RichTextEditor
          value={explanation || { html: '', text: '' }}
          onChange={(content) =>
            setValue(`questions.${index}.explanation`, content, { shouldValidate: false })
          }
          placeholder="Enter explanation..."
          minHeight={150}
          showToolbar={true}
        />
      </CardContent>
    </Card>
  );
}
