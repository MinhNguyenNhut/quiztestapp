import { TextField, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { RichTextEditor } from '../../common/RichTextEditor/index.ts';
import { Controller } from 'react-hook-form';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  index: number;
}

export default function QuestionContentSection({ control, watch, setValue, index }: Props) {
  const { t } = useTranslation();
  const question = watch(`questions.${index}`);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {t('questionBuilder.questionContent')}
        </Typography>
        <Controller
          name={`questions.${index}.title`}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label={t('questionBuilder.questionTitleLabel')}
              placeholder={t('questionBuilder.questionTitlePlaceholder')}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{ mb: 3 }}
            />
          )}
        />
        <RichTextEditor
          label={t('questionBuilder.questionContent')}
          value={question?.content || { html: '', text: '' }}
          onChange={(content) =>
            setValue(`questions.${index}.content`, content, { shouldValidate: true })
          }
          placeholder={t('questionBuilder.questionContent')}
          minHeight={250}
          showBlanks={question?.type === 'fill_in_blank'}
        />
      </CardContent>
    </Card>
  );
}
