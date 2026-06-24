import { TextField, Typography, Card, CardContent } from '@mui/material';
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

export default function QuestionContentSection({ watch, setValue, errors, index }: Props) {
  const question = watch(`questions.${index}`);
  const titleError = errors.questions?.[index]?.title;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Question Content
        </Typography>
        <TextField
          fullWidth
          label="Question Title"
          placeholder="Enter a short question title"
          value={question?.title || ''}
          onChange={(e) =>
            setValue(`questions.${index}.title`, e.target.value, { shouldValidate: true })
          }
          error={!!titleError}
          helperText={titleError?.message as string}
          sx={{ mb: 3 }}
        />
        <RichTextEditor
          label="Question Content"
          value={question?.content || { html: '', text: '' }}
          onChange={(content) =>
            setValue(`questions.${index}.content`, content, { shouldValidate: true })
          }
          placeholder="Enter question content..."
          minHeight={250}
          showBlanks={question?.type === 'fill_in_blank'}
        />
      </CardContent>
    </Card>
  );
}
