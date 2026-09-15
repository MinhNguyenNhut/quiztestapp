import { memo, useCallback, useMemo } from 'react';
import { TextField, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch, type Control, type UseFormSetValue, type UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues, RichTextContent } from '../../../types/index.ts';
import { RichTextEditor } from '../../common/RichTextEditor/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  index: number;
}

const EMPTY_CONTENT: RichTextContent = { html: '', text: '' };

function QuestionContentSection({ control, setValue, getValues, index }: Props) {
  const { t } = useTranslation();
  const content = getValues(`questions.${index}.content`);
  const type = useWatch({ control, name: `questions.${index}.type` });

  const resolvedContent = useMemo(() => content || EMPTY_CONTENT, [content]);
  const handleContentChange = useCallback(
    (newContent: RichTextContent) => setValue(`questions.${index}.content`, newContent, { shouldValidate: false }),
    [setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>{t('questionBuilder.questionContent')}</Typography>
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
          value={resolvedContent}
          onChange={handleContentChange}
          placeholder={t('questionBuilder.questionContent')}
          minHeight={250}
          showBlanks={type === 'fill_in_blank'}
        />
      </CardContent>
    </Card>
  );
}

export default memo(QuestionContentSection);